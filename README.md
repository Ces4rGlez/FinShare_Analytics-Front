# FinShare Analytics - Plataforma de Gestión Financiera

FinShare Analytics es una aplicación SaaS premium diseñada para la gestión de finanzas compartidas, análisis de riesgo de insolvencia y simulación de escenarios financieros mediante Inteligencia Artificial.

---

##  Despliegue del Frontend

La parte del cliente está construida con **React + Vite** y utiliza **Vanilla CSS** para un diseño minimalista y moderno.

### Pasos para iniciar:

1. **Navegar a la carpeta del proyecto:**
   ```bash
   cd FinShareAnalytics
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   *El frontend estará disponible por defecto en `http://localhost:5173`.*

4. **Construir para producción (Opcional):**
   ```bash
   npm run build
   ```

---

##  Configuración de la Base de Datos (MongoDB)

El proyecto utiliza **MongoDB** como base de datos. A continuación se detallan las colecciones, esquemas y validadores necesarios para el correcto funcionamiento del backend.

### 1. Inicialización
```javascript
use finshare_db;
```

### 2. Colección: `users`
Almacena la información de perfil, finanzas personales y resúmenes de riesgo.

```javascript
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["fullName", "email", "passwordHash", "isActive", "createdAt", "updatedAt"],
      properties: {
        fullName:      { bsonType: "string" },
        email:         { bsonType: "string" },
        passwordHash:  { bsonType: "string" },
        phone:         { bsonType: ["string", "null"] },
        isActive:      { bsonType: "bool" },
        createdAt:     { bsonType: "date" },
        updatedAt:     { bsonType: "date" },
        finance: {
          bsonType: "object",
          properties: {
            monthlyIncome:     { bsonType: "number" },
            fixedExpenses:     { bsonType: "number" },
            variableExpenses:  { bsonType: "number" },
            savings:           { bsonType: "number" },
            incomeStability:   { enum: ["stable", "variable", "freelance"] },
            updatedAt:         { bsonType: "date" }
          }
        },
        debts: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              creditor:        { bsonType: "string" },
              totalAmount:     { bsonType: "number" },
              remainingAmount: { bsonType: "number" },
              monthlyPayment:  { bsonType: "number" },
              debtType:        { enum: ["credit", "loan", "mortgage", "other"] },
              isActive:        { bsonType: "bool" }
            }
          }
        },
        lastRiskReport: {
          bsonType: "object",
          properties: {
            debtIndex:           { bsonType: "number" },
            savingsCapacity:     { bsonType: "number" },
            emergencyFundMonths: { bsonType: "number" },
            riskScore:           { bsonType: "number" },
            riskLevel:           { enum: ["low", "medium", "high"] },
            generatedAt:         { bsonType: "date" }
          }
        }
      }
    }
  }
});

// Índices
db.users.createIndex({ email: 1 }, { unique: true });
```

### 3. Colección: `groups`
Gestiona los grupos de gastos compartidos y sus analíticas de estabilidad.

```javascript
db.createCollection("groups", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "groupType", "ownerId", "isActive", "createdAt", "updatedAt"],
      properties: {
        name:        { bsonType: "string" },
        description: { bsonType: "string" },
        groupType:   { enum: ["roommates", "travel", "project", "other"] },
        ownerId:     { bsonType: "objectId" },
        isActive:    { bsonType: "bool" },
        createdAt:   { bsonType: "date" },
        updatedAt:   { bsonType: "date" },
        members: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              userId:      { bsonType: "objectId" },
              displayName: { bsonType: "string" },
              role:        { enum: ["admin", "member"] },
              joinedAt:    { bsonType: "date" },
              isActive:    { bsonType: "bool" }
            }
          }
        },
        analytics: {
          bsonType: "object",
          properties: {
            stabilityIndex:      { bsonType: "number" },
            conflictRiskLevel:   { enum: ["low", "medium", "high"] },
            contributionVariance:{ bsonType: "number" },
            dominantPayerId:     { bsonType: ["objectId", "null"] },
            calculatedAt:        { bsonType: "date" }
          }
        }
      }
    }
  }
});

// Índices
db.groups.createIndex({ ownerId: 1 });
db.groups.createIndex({ "members.userId": 1 });
```

### 4. Colección: `simulations`
Almacena los resultados de las simulaciones de escenarios críticos.

```javascript
db.createCollection("simulations", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["createdBy", "scenarioType", "createdAt", "updatedAt"],
      properties: {
        createdBy:     { bsonType: "objectId" },
        targetGroupId: { bsonType: ["objectId", "null"] },
        scenarioType:  { enum: ["job_loss", "rent_increase", "member_default", "expense_spike", "income_cut"] },
        description:   { bsonType: "string" },
        parameters:    { bsonType: "object" },
        createdAt:     { bsonType: "date" },
        updatedAt:     { bsonType: "date" },
        result: {
          bsonType: "object",
          properties: {
            riskDelta:           { bsonType: "number" },
            stabilityDelta:      { bsonType: "number" },
            conflictProbability: { bsonType: "number" },
            affectedMembers: {
              bsonType: "array",
              items: { bsonType: "objectId" }
            },
            recommendation: { bsonType: "string" },
            generatedAt:    { bsonType: "date" }
          }
        }
      }
    }
  }
});

// Índices
db.simulations.createIndex({ createdBy: 1 });
db.simulations.createIndex({ targetGroupId: 1 });
```

---

##  Tecnologías Utilizadas

- **Frontend:** React, Vite, Vanilla CSS, Heroicons, Recharts.
- **Backend:** Flask (Python), MongoDB.
- **IA:** Integración de analíticas predictivas para estabilidad financiera.

---
© 2026 FinShare Analytics - Sistema de Finanzas Compartidas e Inteligentes.
