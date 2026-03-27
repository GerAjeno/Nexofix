import express from 'express';
import { db } from '../database.js';

const router = express.Router();

// Helper para resolver datos de cliente (Simular LEFT JOIN)
const resolveClientData = async (cotizacion) => {
  if (cotizacion.cliente_id) {
    try {
      const cliDoc = await db.collection('clientes').doc(cotizacion.cliente_id).get();
      if (cliDoc.exists) {
        cotizacion.cliente_nombre = cliDoc.data().nombre;
        cotizacion.cliente_rut = cliDoc.data().rut;
        cotizacion.cliente_direccion = cliDoc.data().direccion;
        cotizacion.cliente_email = cliDoc.data().email;
      }
    } catch (e) {
      console.error(e);
    }
  }
  return cotizacion;
};

// GET todas las cotizaciones activas
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('cotizaciones')
                             .where('activo', '==', 1)
                             .get();
    let cotizaciones = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    cotizaciones.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    
    // Resolver cliente_nombre y rut para cada una (Promise.all para rendimiento)
    cotizaciones = await Promise.all(cotizaciones.map(c => resolveClientData(c)));
    
    res.json(cotizaciones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET una sola cotización con sus ítems (que ahora son un array embebido)
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('cotizaciones').doc(req.params.id).get();
    if (!doc.exists || doc.data().activo === 0) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }
    
    let cotizacion = { id: doc.id, ...doc.data() };
    cotizacion = await resolveClientData(cotizacion);
    
    // Si no tiene arreglo de items por default, inyectar array vacio
    if (!cotizacion.items) cotizacion.items = [];
    
    res.json(cotizacion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST nueva cotización (items insertados embebidos)
router.post('/', async (req, res) => {
  const data = req.body;
  
  const numero_cotizacion = data.numero_cotizacion || `COT-${Date.now().toString().slice(-6)}`;
  
  const itemsCalculados = (data.items || []).map(item => ({
    ...item,
    total: item.total || (item.cantidad * item.precio_unitario)
  }));

  const nuevaCot = {
    numero_cotizacion,
    cliente_id: data.cliente_id,
    fecha_emision: data.fecha_emision || null,
    validez: data.validez || null,
    tipo_trabajo: data.tipo_trabajo || null,
    estado: data.estado || 'Enviada',
    proyecto: data.proyecto || null,
    direccion_trabajo: data.direccion_trabajo || null,
    telefono_contacto: data.telefono_contacto || null,
    descripcion_trabajo: data.descripcion_trabajo || null,
    subtotal: data.subtotal || 0,
    descuento_porcentaje: data.descuento_porcentaje || 0,
    descuento_monto: data.descuento_monto || 0,
    tipo_impuesto: data.tipo_impuesto || null,
    monto_impuesto: data.monto_impuesto || 0,
    total_final: data.total_final || 0,
    condiciones_notas: data.condiciones_notas || null,
    items: itemsCalculados, // Con totales autocalculados
    activo: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Limpiar undefined
  Object.keys(nuevaCot).forEach(k => nuevaCot[k] === undefined && delete nuevaCot[k]);

  try {
    const docRef = await db.collection('cotizaciones').add(nuevaCot);
    res.status(201).json({ id: docRef.id, numero_cotizacion, message: 'Cotización creada exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT actualizar cotización completando el documento
router.put('/:id', async (req, res) => {
  const data = req.body;
  try {
    const docRef = db.collection('cotizaciones').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Cotización no encontrada' });

    const itemsCalculados = (data.items || []).map(item => ({
      ...item,
      total: item.total || (item.cantidad * item.precio_unitario)
    }));

    const updates = {
      cliente_id: data.cliente_id,
      fecha_emision: data.fecha_emision,
      validez: data.validez,
      tipo_trabajo: data.tipo_trabajo,
      estado: data.estado,
      proyecto: data.proyecto,
      direccion_trabajo: data.direccion_trabajo,
      telefono_contacto: data.telefono_contacto,
      descripcion_trabajo: data.descripcion_trabajo,
      subtotal: data.subtotal,
      descuento_porcentaje: data.descuento_porcentaje,
      descuento_monto: data.descuento_monto,
      tipo_impuesto: data.tipo_impuesto,
      monto_impuesto: data.monto_impuesto,
      total_final: data.total_final,
      condiciones_notas: data.condiciones_notas,
      items: itemsCalculados,
      updated_at: new Date().toISOString()
    };
    
    Object.keys(updates).forEach(k => updates[k] === undefined && delete updates[k]);

    await docRef.update(updates);
    res.json({ message: 'Cotización actualizada exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST aceptar cotización y crear ticket (Batch de Firestore)
router.post('/:id/aceptar', async (req, res) => {
  const { id } = req.params;
  const numero_ticket = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
  const fecha = new Date().toISOString().split('T')[0];

  try {
    const cotRef = db.collection('cotizaciones').doc(id);
    const cotDoc = await cotRef.get();

    if (!cotDoc.exists) return res.status(404).json({ error: 'Cotización no encontrada' });
    const cot = cotDoc.data();

    const batch = db.batch();

    // Actualizar Cotizacion
    batch.update(cotRef, { estado: 'Aceptada', updated_at: new Date().toISOString() });

    // Crear Ticket
    const ticketsRef = db.collection('tickets').doc(); // Generar ID auto
    const nuevoTicket = {
      numero_ticket,
      cliente_id: cot.cliente_id,
      cotizacion_id: id, // Firebase ID
      direccion_trabajo: cot.direccion_trabajo || '',
      telefono_contacto: cot.telefono_contacto || '',
      tipo_trabajo: cot.tipo_trabajo || 'Corrientes Débiles',
      fecha_creacion: fecha,
      estado: 'Pendiente',
      prioridad: 'Media',
      descripcion_problema: cot.descripcion_trabajo || '',
      notas_tecnicas: '',
      jornada: 'Sin Asignar',
      activo: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    batch.set(ticketsRef, nuevoTicket);
    await batch.commit();

    res.json({ 
      message: 'Cotización aceptada y Ticket generado', 
      ticket_id: ticketsRef.id,
      numero_ticket 
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE (Borrado Suave) cotización
router.delete('/:id', async (req, res) => {
  try {
    const docRef = db.collection('cotizaciones').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Cotización no encontrada' });

    await docRef.update({ activo: 0, updated_at: new Date().toISOString() });
    res.json({ message: 'Cotización archivada exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
