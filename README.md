# 🛠️ NexoFix

**NexoFix** es una plataforma web integral diseñada para la gestión operativa y administrativa de trabajos técnicos en terreno, con un enfoque especial en servicios de electricidad y corrientes débiles. Permite a los técnicos y administradores llevar un control completo y eficiente de sus clientes, presupuestos, trabajos, procesos de facturación y agenda diaria, todo centralizado en un solo lugar.

## ✨ Características Principales

- **👥 Gestión de Clientes**: Creación y administración de clientes clasificados por categorías (Cliente Final, Condominio, Empresa). Incluye validación del algoritmo de RUT chileno y registro de datos de facturación e información de contacto.
- **📝 Cotizaciones y Presupuestos**: Generador dinámico de cotizaciones con cálculos de impuestos y retenciones de la normativa chilena (IVA 19%, Retención de Boletas de Honorarios 15.25% parametrizable). Incluye la opción de exportar directamente a formato PDF (`html2pdf.js`).
- **🏗️ Gestión de Trabajos**: Monitoreo y actualización del estado de los trabajos técnicos a realizar.
- **📅 Agenda Integrada**: Visualización y gestión de las horas y fechas de las visitas programadas.
- **⚙️ Panel de Ajustes**: Módulo modularizado por pestañas (General, Usuarios, Clientes, Sistema, Agenda) para personalizar variables generales del sistema y administrar los accesos del personal.
- **🔐 Seguridad y Autenticación**: Sistema sólido con validación de credenciales encriptadas y sesiones manejadas a través de JSON Web Tokens (JWT).
- **🎨 Interfaz Moderna e Intuitiva**: Diseño limpio y fácil de navegar, optimizado para flujos de trabajo rápidos y compatibilidad nativa con Modo Oscuro.

## 🚀 Tecnologías Utilizadas

NexoFix utiliza una arquitectura cliente-servidor dividida en dos aplicaciones conectadas:

**Frontend (Interfaz de Usuario)**
- **Framework**: React.js 19
- **Build Tool**: Vite
- **Navegación**: React Router DOM v7
- **Iconografía**: Lucide React
- **Peticiones HTTP**: Axios
- **Generación de Documentos**: html2pdf.js

**Backend (Lógica de Servidor & API)**
- **Entorno**: Node.js
- **Framework**: Express.js
- **Base de Datos**: SQLite3 (Motor relacional ultra-rápido embebido)
- **Seguridad**: bcryptjs (Hashing de contraseñas), jsonwebtoken (autenticación)
- **Gestión de Archivos**: Multer

## 📦 Estructura del Repositorio

El proyecto se divide físicamente en dos directorios independientes:
- `/frontend`: Contiene todo el código fuente de la aplicación en React orientada al usuario final.
- `/backend`: Contiene la lógica del servidor RESTful, controladores de la base de datos y endpoints de la API.

## 🏃‍♂️ Instalación y Ejecución en Entorno de Desarrollo

El sistema requiere [Node.js](https://nodejs.org/) (versión 20 LTS o superior) para funcionar.

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/nexofix.git
cd nexofix
```

### 2. Levantar la API (Backend)
En una terminal:
```bash
cd backend
npm install
npm run dev
# El servidor Express iniciará en http://localhost:3000
```

### 3. Levantar la Aplicación (Frontend)
En una nueva terminal:
```bash
cd frontend
npm install
npm run dev
# Vite iniciará el entorno de desarrollo en http://localhost:5173
```

## 🌐 Notas de Despliegue en Producción

El proyecto está diseñado para funcionar en un entorno de producción altamente protegido. La recomendación de infraestructura estándar para NexoFix es:
- Servidor host **Ubuntu Server** (ej. Virtualizado vía Proxmox VE).
- Procesos persistentes con **PM2** (`pm2 start server.js` y `pm2 start npm -- run preview`).
- Exposición segura a Internet mediante **Cloudflare Zero Trust (Tunnels)**, evitando así la apertura de puertos HTTP (80/443) directamente en el firewall local (UFW) del servidor.

---
*NexoFix - Desarrollado para optimizar el trabajo técnico y proveer excelencia en el servicio.*
