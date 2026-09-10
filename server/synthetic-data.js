/**
 * synthetic-data.js
 * Generador y catálogo de datos financieros sintéticos realistas de Panamá.
 * Creado para el Reto Corporativo de Caja de Ahorros con QVAC SDK.
 * 
 * Cumple con la regla del concurso:
 * "No se entrega un dataset. Los equipos deben trabajar con datos sintéticos o públicos.
 * No se admite el uso de datos reales de clientes de ninguna entidad financiera."
 */

export const PROFILES = {
  carlos_gastos_hormiga: {
    id: "carlos_gastos_hormiga",
    name: "Carlos Méndez (Joven Profesional)",
    description: "Ingresos estables pero sufre fugas constantes por microgastos diarios (café, delivery, snacks). Ahorra apenas el 2% mensual.",
    avatar: "👨‍💻",
    accountNumber: "CA-0104-8842-19",
    accountType: "Cuenta de Ahorros Tradicional - Caja de Ahorros",
    monthlyIncome: 1850.00,
    targetGoal: "Reducir gastos hormiga y abrir Cuenta de Ahorro Navideño",
    transactions: [
      // Quincena 1 (Ingreso)
      { id: "tx-001", date: "2026-08-15", merchant: "ACH Depósito de Nómina / Empleador", category: "Ingresos", amount: 925.00, type: "income" },
      
      // Gastos fijos (Necesidades)
      { id: "tx-002", date: "2026-08-16", merchant: "Alquiler Apartamento Obarrio", category: "Vivienda", amount: 550.00, type: "expense" },
      { id: "tx-003", date: "2026-08-16", merchant: "Naturgy Panamá (Electricidad)", category: "Servicios Básicos", amount: 58.40, type: "expense" },
      { id: "tx-004", date: "2026-08-17", merchant: "Tigo Panamá (Plan Móvil + Hogar)", category: "Servicios Básicos", amount: 45.00, type: "expense" },
      { id: "tx-005", date: "2026-08-17", merchant: "Recarga Metro de Panamá / MetroBus", category: "Transporte", amount: 20.00, type: "expense" },
      { id: "tx-006", date: "2026-08-18", merchant: "Super 99 Albrook (Supermercado quincenal)", category: "Alimentación Básica", amount: 165.20, type: "expense" },
      { id: "tx-007", date: "2026-08-18", merchant: "Farmacias Arrocha (Medicamentos)", category: "Salud", amount: 24.50, type: "expense" },

      // Gastos Hormiga & Compras impulsivas (Lunes a Jueves)
      { id: "tx-008", date: "2026-08-17", merchant: "Cafetería Unido Costa del Este", category: "Café y Bebidas", amount: 4.85, type: "expense", isMicroExpense: true },
      { id: "tx-009", date: "2026-08-17", merchant: "Mini Súper Bella Vista (Snacks)", category: "Snacks / Kiosco", amount: 3.25, type: "expense", isMicroExpense: true },
      { id: "tx-010", date: "2026-08-18", merchant: "Cafetería Unido (Latte + Galleta)", category: "Café y Bebidas", amount: 5.50, type: "expense", isMicroExpense: true },
      { id: "tx-011", date: "2026-08-18", merchant: "PedidosYa (Almuerzo express)", category: "Delivery Comida", amount: 12.80, type: "expense", isMicroExpense: true },
      { id: "tx-012", date: "2026-08-19", merchant: "Kotowa Coffee (Frappé)", category: "Café y Bebidas", amount: 4.50, type: "expense", isMicroExpense: true },
      { id: "tx-013", date: "2026-08-19", merchant: "Máquina Vendedora Oficina", category: "Snacks / Kiosco", amount: 1.75, type: "expense", isMicroExpense: true },
      { id: "tx-014", date: "2026-08-20", merchant: "Dulcería Momi (Postre)", category: "Snacks / Kiosco", amount: 3.80, type: "expense", isMicroExpense: true },
      { id: "tx-015", date: "2026-08-20", merchant: "PedidosYa (Envío nocturno)", category: "Delivery Comida", amount: 11.20, type: "expense", isMicroExpense: true },
      { id: "tx-016", date: "2026-08-21", merchant: "Cafetería Unido (Café matutino)", category: "Café y Bebidas", amount: 4.85, type: "expense", isMicroExpense: true },
      { id: "tx-017", date: "2026-08-22", merchant: "Bar La Rana Dorada (Salida amigos)", category: "Ocio / Salidas", amount: 48.00, type: "expense" },
      { id: "tx-018", date: "2026-08-23", merchant: "Uber Panamá (Traslados)", category: "Transporte Opcional", amount: 14.50, type: "expense", isMicroExpense: true },

      // Quincena 2 (Ingreso)
      { id: "tx-019", date: "2026-08-30", merchant: "ACH Depósito de Nómina / Empleador", category: "Ingresos", amount: 925.00, type: "income" },
      
      // Gastos quincena 2
      { id: "tx-020", date: "2026-08-31", merchant: "Riba Smith Transístmica (Supermercado)", category: "Alimentación Básica", amount: 184.30, type: "expense" },
      { id: "tx-021", date: "2026-08-31", merchant: "Recarga Panapass Corredores", category: "Transporte", amount: 25.00, type: "expense" },
      { id: "tx-022", date: "2026-09-01", merchant: "IDAAN Panamá (Agua potable)", category: "Servicios Básicos", amount: 12.50, type: "expense" },
      { id: "tx-023", date: "2026-09-01", merchant: "Suscripción Spotify + Netflix", category: "Suscripciones Digitales", amount: 21.99, type: "expense" },

      // Más Gastos Hormiga semana 2
      { id: "tx-024", date: "2026-09-01", merchant: "Kotowa Coffee (Capuccino)", category: "Café y Bebidas", amount: 4.25, type: "expense", isMicroExpense: true },
      { id: "tx-025", date: "2026-09-02", merchant: "Mini Súper El Progreso (Bebida energética)", category: "Snacks / Kiosco", amount: 2.75, type: "expense", isMicroExpense: true },
      { id: "tx-026", date: "2026-09-02", merchant: "PedidosYa (Almuerzo oficina)", category: "Delivery Comida", amount: 13.40, type: "expense", isMicroExpense: true },
      { id: "tx-027", date: "2026-09-03", merchant: "Café Duran Kiosco", category: "Café y Bebidas", amount: 2.50, type: "expense", isMicroExpense: true },
      { id: "tx-028", date: "2026-09-03", merchant: "Doit Center (Compra no planificada)", category: "Compras Varias", amount: 14.90, type: "expense", isMicroExpense: true },
      { id: "tx-029", date: "2026-09-04", merchant: "Cafetería Unido (Cold Brew)", category: "Café y Bebidas", amount: 5.25, type: "expense", isMicroExpense: true },
      { id: "tx-030", date: "2026-09-04", merchant: "PedidosYa (Postres nocturnos)", category: "Delivery Comida", amount: 10.50, type: "expense", isMicroExpense: true },
      { id: "tx-031", date: "2026-09-05", merchant: "Cinepolis Multiplaza", category: "Ocio / Salidas", amount: 32.00, type: "expense" },
      { id: "tx-032", date: "2026-09-06", merchant: "Aporte simbólico a Ahorro", category: "Ahorro", amount: 40.00, type: "expense" }
    ]
  },

  familia_gomez_vivienda: {
    id: "familia_gomez_vivienda",
    name: "Familia Gómez (Meta: Primera Vivienda)",
    description: "Ingresos familiares conjuntos de $2,450. Buscan ahorrar para el abono inicial de su hipoteca con Caja de Ahorros.",
    avatar: "👨‍👩‍👧",
    accountNumber: "CA-0205-9931-44",
    accountType: "Cuenta de Ahorros Familiar - Caja de Ahorros",
    monthlyIncome: 2450.00,
    targetGoal: "Reunir $3,600 para el abono inicial hipotecario Caja de Ahorros",
    transactions: [
      { id: "tx-101", date: "2026-08-15", merchant: "Depósito Nómina Titular 1", category: "Ingresos", amount: 1225.00, type: "income" },
      { id: "tx-102", date: "2026-08-15", merchant: "Depósito Nómina Titular 2", category: "Ingresos", amount: 1225.00, type: "income" },
      { id: "tx-103", date: "2026-08-16", merchant: "Alquiler Casa Brisas del Golf", category: "Vivienda", amount: 750.00, type: "expense" },
      { id: "tx-104", date: "2026-08-16", merchant: "Ensa Electricidad", category: "Servicios Básicos", amount: 84.00, type: "expense" },
      { id: "tx-105", date: "2026-08-17", merchant: "Super 99 Brisas del Golf", category: "Alimentación Básica", amount: 280.00, type: "expense" },
      { id: "tx-106", date: "2026-08-18", merchant: "Colegio / Mensualidad Escolar", category: "Educación", amount: 220.00, type: "expense" },
      { id: "tx-107", date: "2026-08-20", merchant: "Combustible Terpel", category: "Transporte", amount: 65.00, type: "expense" },
      { id: "tx-108", date: "2026-08-21", merchant: "Restaurante Fin de Semana (Cena fuera)", category: "Ocio / Salidas", amount: 95.00, type: "expense" },
      { id: "tx-109", date: "2026-08-23", merchant: "McDonald's Auto-Rápido", category: "Delivery Comida", amount: 14.50, type: "expense", isMicroExpense: true },
      { id: "tx-110", date: "2026-08-24", merchant: "Farmacias Metro (Vitaminas)", category: "Salud", amount: 18.00, type: "expense" },
      { id: "tx-111", date: "2026-08-26", merchant: "Snacks Paseo de compras", category: "Snacks / Kiosco", amount: 8.50, type: "expense", isMicroExpense: true },
      { id: "tx-112", date: "2026-08-28", merchant: "Restaurante Amador (Salida dominical)", category: "Ocio / Salidas", amount: 110.00, type: "expense" },
      { id: "tx-113", date: "2026-08-30", merchant: "Aporte a Ahorro Caja de Ahorros", category: "Ahorro", amount: 150.00, type: "expense" }
    ]
  },

  valeria_regla_60_25_15: {
    id: "valeria_regla_60_25_15",
    name: "Valeria Ríos (Optimizando 60-25-15)",
    description: "Ingreso mensual de $1,400. Quiere ordenar sus finanzas para cumplir exactamente la regla 60% Necesidades, 25% Deseos y 15% Ahorro.",
    avatar: "👩‍💼",
    accountNumber: "CA-0309-1120-77",
    accountType: "Cuenta Juventud / Plan Ahorro - Caja de Ahorros",
    monthlyIncome: 1400.00,
    targetGoal: "Alcanzar 15% de ahorro mensual ($210/mes) en Plazo Fijo",
    transactions: [
      { id: "tx-201", date: "2026-08-15", merchant: "ACH Salario Quincenal", category: "Ingresos", amount: 700.00, type: "income" },
      { id: "tx-202", date: "2026-08-30", merchant: "ACH Salario Quincenal", category: "Ingresos", amount: 700.00, type: "income" },
      { id: "tx-203", date: "2026-08-16", merchant: "Alquiler compartido El Cangrejo", category: "Vivienda", amount: 400.00, type: "expense" },
      { id: "tx-204", date: "2026-08-17", merchant: "El Machetazo Calidonia", category: "Alimentación Básica", amount: 180.00, type: "expense" },
      { id: "tx-205", date: "2026-08-18", merchant: "Luz + Internet compartido", category: "Servicios Básicos", amount: 60.00, type: "expense" },
      { id: "tx-206", date: "2026-08-19", merchant: "Metro de Panamá Pasajes", category: "Transporte", amount: 35.00, type: "expense" },
      { id: "tx-207", date: "2026-08-20", merchant: "Salida con compañeras de trabajo", category: "Ocio / Salidas", amount: 65.00, type: "expense" },
      { id: "tx-208", date: "2026-08-22", merchant: "Café y postre", category: "Café y Bebidas", amount: 6.50, type: "expense", isMicroExpense: true },
      { id: "tx-209", date: "2026-08-25", merchant: "Ropa Zara Albrook Mall", category: "Compras Varias", amount: 75.00, type: "expense" },
      { id: "tx-210", date: "2026-08-27", merchant: "PedidosYa cena", category: "Delivery Comida", amount: 13.50, type: "expense", isMicroExpense: true },
      { id: "tx-211", date: "2026-08-30", merchant: "Cuenta de Ahorro Caja de Ahorros", category: "Ahorro", amount: 90.00, type: "expense" }
    ]
  }
};

/**
 * Retorna la lista de perfiles disponibles para la demo.
 */
export function getAvailableProfiles() {
  return Object.values(PROFILES).map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    avatar: p.avatar,
    monthlyIncome: p.monthlyIncome,
    targetGoal: p.targetGoal,
    transactionsCount: p.transactions.length
  }));
}

/**
 * Retorna las transacciones y metadatos de un perfil.
 */
export function getProfileData(profileId) {
  return PROFILES[profileId] || PROFILES.carlos_gastos_hormiga;
}
