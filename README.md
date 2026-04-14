<div align="center">
  <img src="https://img.icons8.com/plasticine/100/000000/react.png" alt="React Logo"/>
  <img src="https://img.icons8.com/color/96/000000/javascript--v1.png" alt="JS Logo"/>
  <img src="https://img.icons8.com/fluency/96/css3.png" alt="CSS Logo"/>
  
  <h1>FinShare Analytics - Frontend </h1>
  
  <p>
    <strong>El cliente interactivo y analítico para la gestión inteligente de tus finanzas</strong>
  </p>

  [![React](https://img.shields.io/badge/React-18.x-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-Build_Tool-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
</div>

<br/>

Este repositorio contiene el **Frontend (Interfaz de Usuario)** de **FinShare Analytics**. Ha sido diseñado bajo una arquitectura moderna utilizando las últimas características funcionales de **React**, empaquetado ultra-rápido gracias a **Vite**, y con un diseño estelar, profesional y estilo *SaaS* usando CSS avanzado y librerías UI de alto impacto.

---

##  Módulos Destacados

*    **Dashboard Administrativo:** Vista global del estado financiero, tarjetas de resumen con indicadores de rendimiento (KPIs).
*    **Centro de Simulaciones:** Panel dinámico para correr escenarios económicos del tipo *"Qué pasaría si..."*, evaluando impactos de nuevos gastos.
*    **Análisis de Riesgo:** Indicadores en tiempo real que miden la liquidez y capacidad de pago para cuidar el bienestar de los ingresos.
*    **Finanzas Grupales:** Repartición inteligente de gastos y administración de cuentas colaborativas.

---

##  Principios de Diseño

El apartado visual del proyecto se enfoca en ofrecer una experiencia de usuario Premium e intuitiva:
*   Temática limpia, flat y minimalista estilo *SaaS Moderno*.
*   Tipografías modernas para mejorar la lectura de los datos.
*   Componentes funcionales altamente aislados para ser reutilizables (Tarjetas de estadísticas, Barras de Progreso, Modales).

---

##  Estructura del Código

```text
 FinShareAnalytics
 ┣  src
 ┃ ┣  assets         # Imágenes, Íconos y utilerías multimedia
 ┃ ┣  components     # Componentes visuales genéricos y reutilizables
 ┃ ┣  contexts       # Almacenamiento Global de Estados (Autenticación)
 ┃ ┣  pages          # Vistas principales (Risk, Dashboard, Groups, etc.)
 ┃ ┣  services       # Conexiones Fetch/Axios a la API Backend
 ┃ ┗  main.jsx       # Punto de montaje central de React
 ┣  package.json     # Metadatos del proyecto y Scripts
 ┗  vite.config.js   # Ajustes del compilador de Vite
```

---

##  Instalación y Uso Local

Sigue estos pasos para arrancar el entorno web en tu navegador:

### 1. Prerrequisitos
Deberás tener instalado en tu computadora:
*   [Node.js](https://nodejs.org/) (Incluye el gestor de paquetes `npm`).

### 2. Instalación de Dependencias

Abre una terminal apuntando a esta misma ruta (`FinShareAnalytics/`) y ejecuta la descarga de paquetes:

```bash
# Instalar los paquetes definidos y dependencias
npm install
```

### 3. Configuración de Entorno (`.env`)

Revisa o crea un archivo `.env` que apunte a la ruta de tu API backend para asegurar el correcto consumo de servicios:

```env
# Ejemplo apuntando al servidor de tu propio PC
VITE_API_URL=http://localhost:5000/api
```

### 4. Lanzar el Entorno de Trabajo

Ejecuta este comando para levantar el servidor web:

```bash
npm run dev
```

>  Consola te mostrará un enlace local (Usualmente el servidor arranca en `http://localhost:5173/`). Abre ese enlace para utilizar la aplicación.

<br/>
<div align="center">
  <i>Construido con dedicación para FinShare Analytics - Chávez Piñón Santiago Ronaldo - González Ávalos César Fernando - Torres Pérez Leonel Alejandro. </i>
</div>
