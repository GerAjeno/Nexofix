import express from 'express';
import { db } from '../database.js';

const router = express.Router();

const resolveRefs = async (ticket) => {
  if (ticket.cliente_id) {
    const cliDoc = await db.collection('clientes').doc(ticket.cliente_id).get();
    if (cliDoc.exists) {
      ticket.cliente_nombre = cliDoc.data().nombre;
      ticket.cliente_rut = cliDoc.data().rut;
      ticket.cliente_telefono = cliDoc.data().telefono;
      ticket.cliente_direccion = cliDoc.data().direccion;
    }
  }
  if (ticket.cotizacion_id) {
    const cotDoc = await db.collection('cotizaciones').doc(ticket.cotizacion_id).get();
    if (cotDoc.exists) {
      ticket.proyecto_nombre = cotDoc.data().proyecto;
      ticket.numero_cotizacion = cotDoc.data().numero_cotizacion;
      ticket.items = cotDoc.data().items || [];
      ticket.condiciones_notas = cotDoc.data().condiciones_notas || '';
      ticket.descripcion_cotizada = cotDoc.data().descripcion_trabajo || '';
    } else {
      ticket.items = [];
    }
  } else {
    ticket.items = [];
  }
  return ticket;
};

// GET todos los tickets activos
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('tickets')
                             .where('activo', '==', 1)
                             .get();
    let tickets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    tickets.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    tickets = await Promise.all(tickets.map(t => resolveRefs(t)));
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET un ticket por ID
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('tickets').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Ticket no encontrado' });
    let ticket = { id: doc.id, ...doc.data() };
    ticket = await resolveRefs(ticket);
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST crear nuevo ticket
router.post('/', async (req, res) => {
  const data = req.body;
  let estadoFinal = data.estado || 'Pendiente';
  if ((data.jornada === 'Mañana' || data.jornada === 'Tarde') && estadoFinal === 'Pendiente') {
    estadoFinal = 'En Proceso';
  }

  const numero_ticket = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
  const fecha = new Date().toISOString().split('T')[0];

  const nuevoTicket = {
    numero_ticket,
    cliente_id: data.cliente_id,
    cotizacion_id: data.cotizacion_id || null,
    direccion_trabajo: data.direccion_trabajo || null,
    telefono_contacto: data.telefono_contacto || null,
    tipo_trabajo: data.tipo_trabajo || null,
    fecha_creacion: fecha,
    estado: estadoFinal,
    prioridad: data.prioridad || 'Media',
    descripcion_problema: data.descripcion_problema || null,
    notas_tecnicas: data.notas_tecnicas || '',
    jornada: data.jornada || 'Sin Asignar',
    fecha_agendada: data.fecha_agendada || null,
    activo: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  Object.keys(nuevoTicket).forEach(k => nuevoTicket[k] === undefined && delete nuevoTicket[k]);

  try {
    const docRef = await db.collection('tickets').add(nuevoTicket);
    res.status(201).json({ id: docRef.id, numero_ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT actualizar ticket y AUTO-CREAR COBRO
router.put('/:id', async (req, res) => {
  const data = req.body;
  const { id } = req.params;

  let nuevoEstado = data.estado;
  if ((data.jornada === 'Mañana' || data.jornada === 'Tarde') && data.estado === 'Pendiente') {
    nuevoEstado = 'En Proceso';
  }

  try {
    const ticketRef = db.collection('tickets').doc(id);
    const ticketDoc = await ticketRef.get();
    if (!ticketDoc.exists) return res.status(404).json({ error: 'Ticket no encontrado' });

    const updates = {
      estado: nuevoEstado,
      prioridad: data.prioridad,
      descripcion_problema: data.descripcion_problema,
      notas_tecnicas: data.notas_tecnicas,
      direccion_trabajo: data.direccion_trabajo,
      telefono_contacto: data.telefono_contacto,
      tipo_trabajo: data.tipo_trabajo,
      jornada: data.jornada,
      fecha_agendada: data.fecha_agendada,
      fecha_termino: data.fecha_termino,
      updated_at: new Date().toISOString()
    };

    Object.keys(updates).forEach(k => updates[k] === undefined && delete updates[k]);

    const oldEstado = ticketDoc.data().estado;
    await ticketRef.update(updates);

    // Si pasa a Terminado, generar Cobranza si no existe
    if (nuevoEstado === 'Terminado' && oldEstado !== 'Terminado') {
      console.log(`[AUTOMATIZACIÓN] Iniciando validación de cobranza para ticket ${id}`);
      const cobrosSnap = await db.collection('cobranzas').where('ticket_id', '==', id).where('activo', '==', 1).limit(1).get();
      
      if (!cobrosSnap.empty) {
        console.log(`[AUTOMATIZACIÓN] Ticket ${id} ya tiene cobranza.`);
      } else {
        const ticketFinalData = { ...ticketDoc.data(), ...updates };
        const numero_cobro = `COB-${Math.floor(100000 + Math.random() * 900000)}`;
        let monto = 0;
        
        if (ticketFinalData.cotizacion_id) {
           const cotDoc = await db.collection('cotizaciones').doc(ticketFinalData.cotizacion_id).get();
           if (cotDoc.exists) monto = cotDoc.data().total_final || 0;
        }

        const nuevaCobranza = {
           numero_cobro,
           ticket_id: id,
           cliente_id: ticketFinalData.cliente_id,
           cotizacion_id: ticketFinalData.cotizacion_id || null,
           fecha_creacion: new Date().toISOString().split('T')[0],
           estado: 'En Cobro',
           monto_total: monto,
           activo: 1,
           created_at: new Date().toISOString(),
           updated_at: new Date().toISOString()
        };

        await db.collection('cobranzas').add(nuevaCobranza);
        console.log(`[AUTOMATIZACIÓN] Generando cobro para Ticket: ${ticketFinalData.numero_ticket}`);
      }
    }

    res.json({ updated: 1, nuevoEstado });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE (soft delete) ticket
router.delete('/:id', async (req, res) => {
  try {
    const docRef = db.collection('tickets').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Ticket no encontrada' });

    await docRef.update({ activo: 0, updated_at: new Date().toISOString() });
    res.json({ archived: 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
