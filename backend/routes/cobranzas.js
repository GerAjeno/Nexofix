import express from 'express';
import { db } from '../database.js';

const router = express.Router();

const resolveRefs = async (cob) => {
  if (cob.cliente_id) {
    const cli = await db.collection('clientes').doc(cob.cliente_id).get();
    if (cli.exists) {
      cob.cliente_nombre = cli.data().nombre;
      cob.cliente_rut = cli.data().rut;
      cob.cliente_telefono = cli.data().telefono;
      cob.cliente_direccion = cli.data().direccion;
    }
  }
  
  if (cob.ticket_id) {
    const tkt = await db.collection('tickets').doc(cob.ticket_id).get();
    if (tkt.exists) {
      cob.numero_ticket = tkt.data().numero_ticket;
      cob.tipo_trabajo = tkt.data().tipo_trabajo;
      cob.descripcion_problema = tkt.data().descripcion_problema;
      cob.notas_tecnicas = tkt.data().notas_tecnicas;
      cob.fecha_termino = tkt.data().fecha_termino;
    }
  }

  if (cob.cotizacion_id) {
    const cot = await db.collection('cotizaciones').doc(cob.cotizacion_id).get();
    if (cot.exists) {
      cob.proyecto_nombre = cot.data().proyecto;
      cob.numero_cotizacion = cot.data().numero_cotizacion;
      cob.descripcion_cotizada = cot.data().descripcion_trabajo;
      cob.subtotal = cot.data().subtotal;
      cob.monto_impuesto = cot.data().monto_impuesto;
      cob.tipo_impuesto = cot.data().tipo_impuesto;
      cob.total_final = cot.data().total_final;
      cob.items = cot.data().items || [];
    } else {
      cob.items = [];
    }
  } else {
    cob.items = [];
  }
  
  return cob;
};

// GET todas las cobranzas activas
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('cobranzas')
                             .where('activo', '==', 1)
                             .get();
                             
    let cobranzas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    cobranzas.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    cobranzas = await Promise.all(cobranzas.map(c => resolveRefs(c)));
    
    res.json(cobranzas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET detalle de cobranza por ID
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('cobranzas').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Cobranza no encontrada' });
    
    let cob = { id: doc.id, ...doc.data() };
    cob = await resolveRefs(cob);
    
    res.json(cob);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT actualizar cobranza (incluye registro de pago)
router.put('/:id', async (req, res) => {
  const { estado, fecha_pago, metodo_pago, notas_pago } = req.body;
  
  try {
    const docRef = db.collection('cobranzas').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'Cobranza no encontrada' });

    const updates = {
      estado,
      updated_at: new Date().toISOString()
    };
    
    if (fecha_pago !== undefined) updates.fecha_pago = fecha_pago;
    if (metodo_pago !== undefined) updates.metodo_pago = metodo_pago;
    if (notas_pago !== undefined) updates.notas_pago = notas_pago;

    await docRef.update(updates);
    res.json({ updated: 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE (soft) cobranza
router.delete('/:id', async (req, res) => {
  try {
    const docRef = db.collection('cobranzas').doc(req.params.id);
    await docRef.update({ activo: 0, updated_at: new Date().toISOString() });
    res.json({ archived: 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
