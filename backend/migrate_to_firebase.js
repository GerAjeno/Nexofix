import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { db as firestore } from './database.js';

const dbPath = path.join(process.cwd(), 'nexofix.db');

if (!fs.existsSync(dbPath)) {
  console.error('❌ nexofix.db no existe. No hay datos que migrar.');
  process.exit(1);
}

const sqliteDb = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

const queryAll = (query) => {
  return new Promise((resolve, reject) => {
    sqliteDb.all(query, [], (err, rows) => {
      if (err) {
        // Ignorar si la tabla no existe en la db vieja
        if (err.message.includes('no such table')) resolve([]);
        else reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
};

async function migrateData() {
  console.log('🚀 Iniciando migración de SQLite a Firebase Firestore...');
  
  if (!firestore) {
    console.error('❌ Firebase no inicializado. Asegúrate de tener serviceAccountKey.json en la carpeta backend.');
    process.exit(1);
  }

  try {
    // 1. Usuarios
    const usuarios = await queryAll('SELECT * FROM usuarios');
    console.log(`Migrando ${usuarios.length} usuarios...`);
    for (const u of usuarios) {
      await firestore.collection('usuarios').doc(u.id.toString()).set(u);
    }

    // 2. Clientes
    const clientes = await queryAll('SELECT * FROM clientes');
    console.log(`Migrando ${clientes.length} clientes...`);
    for (const c of clientes) {
      await firestore.collection('clientes').doc(c.id.toString()).set(c);
    }

    // 3. Cotizaciones e Items (Anidados)
    const cotizaciones = await queryAll('SELECT * FROM cotizaciones');
    const allCotItems = await queryAll('SELECT * FROM cotizacion_items');
    console.log(`Migrando ${cotizaciones.length} cotizaciones y empaquetando ${allCotItems.length} items...`);
    
    for (const c of cotizaciones) {
      c.items = allCotItems.filter(i => i.cotizacion_id === c.id);
      c.cliente_id = c.cliente_id ? c.cliente_id.toString() : null; // Mantener referencias correctas como keys NoSQL
      await firestore.collection('cotizaciones').doc(c.id.toString()).set(c);
    }

    // 4. Tickets
    const tickets = await queryAll('SELECT * FROM tickets');
    console.log(`Migrando ${tickets.length} tickets de trabajo...`);
    for (const t of tickets) {
      t.cliente_id = t.cliente_id ? t.cliente_id.toString() : null;
      t.cotizacion_id = t.cotizacion_id ? t.cotizacion_id.toString() : null;
      await firestore.collection('tickets').doc(t.id.toString()).set(t);
    }

    // 5. Cobranzas
    const cobranzas = await queryAll('SELECT * FROM cobranzas');
    console.log(`Migrando ${cobranzas.length} registros de cobranza...`);
    for (const cob of cobranzas) {
      cob.cliente_id = cob.cliente_id ? cob.cliente_id.toString() : null;
      cob.cotizacion_id = cob.cotizacion_id ? cob.cotizacion_id.toString() : null;
      cob.ticket_id = cob.ticket_id ? cob.ticket_id.toString() : null;
      await firestore.collection('cobranzas').doc(cob.id.toString()).set(cob);
    }

    // 6. Plantillas de Textos
    const plantillas = await queryAll('SELECT * FROM plantillas');
    console.log(`Migrando ${plantillas.length} plantillas de textos...`);
    for (const p of plantillas) {
      await firestore.collection('plantillas').doc(p.id.toString()).set(p);
    }

    // 7. Plantillas de Itemizados (Anidados)
    const p_items = await queryAll('SELECT * FROM plantillas_itemizados');
    const p_dets = await queryAll('SELECT * FROM plantillas_itemizados_detalles');
    console.log(`Migrando ${p_items.length} plantillas de itemizados complejos...`);
    for (const pi of p_items) {
      pi.items = p_dets.filter(d => d.plantilla_id === pi.id);
      await firestore.collection('plantillas_itemizados').doc(pi.id.toString()).set(pi);
    }

    // 8. Ajustes Generales
    const ajustes = await queryAll('SELECT * FROM ajustes_general WHERE id = 1');
    if (ajustes.length > 0) {
      console.log('Migrando configuración global de la empresa...');
      await firestore.collection('configuracion').doc('general').set(ajustes[0]);
    }

    console.log('✅ Migración de Base de Datos Completada Exitosamente!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error fatal durante la migración:', error);
    process.exit(1);
  }
}

migrateData();
