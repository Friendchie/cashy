/**
 * financial-analyzer.js
 * Motor matemático y algorítmico de análisis financiero on-device.
 * Especializado en:
 *  1. Detección de Gastos Hormiga y microfugas de capital.
 *  2. Presupuesto Inteligente bajo la Regla 60-25-15 (Necesidades, Deseos, Ahorro).
 *  3. Estrategias conductuales (Regla de 2 días de gasto de ocio por semana).
 *  4. Proyección de ahorro en productos de Caja de Ahorros.
 */

// Categorías según pilares de la Regla 60-25-15
const CATEGORY_MAPPING = {
  // Necesidades (Meta: 60%)
  "Vivienda": "necesidades",
  "Servicios Básicos": "necesidades",
  "Alimentación Básica": "necesidades",
  "Salud": "necesidades",
  "Educación": "necesidades",
  "Transporte": "necesidades",

  // Deseos / Estilo de vida (Meta: 25%)
  "Café y Bebidas": "deseos",
  "Snacks / Kiosco": "deseos",
  "Delivery Comida": "deseos",
  "Ocio / Salidas": "deseos",
  "Compras Varias": "deseos",
  "Transporte Opcional": "deseos",
  "Suscripciones Digitales": "deseos",

  // Ahorro e Inversión (Meta: 15%)
  "Ahorro": "ahorro",
  "Inversión": "ahorro",
  "Fondo de Emergencia": "ahorro"
};

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

/**
 * Analiza el historial de transacciones y devuelve un diagnóstico financiero completo.
 * @param {Array} transactions Lista de transacciones
 * @param {number} monthlyIncome Ingreso mensual de referencia (opcional)
 * @param {number} microThreshold Umbral para considerar un gasto hormiga (por defecto $15.00)
 */
export function analyzeFinancialHealth(transactions, monthlyIncome = null, microThreshold = 15.00) {
  let totalIncome = 0;
  let totalExpenses = 0;

  const expensesByCategory = {};
  const breakdown = {
    necesidades: 0,
    deseos: 0,
    ahorro: 0
  };

  const microExpenses = [];
  const microExpensesByDay = {
    "Lunes": 0, "Martes": 0, "Miércoles": 0, "Jueves": 0,
    "Viernes": 0, "Sábado": 0, "Domingo": 0
  };
  let weekdayMicroSum = 0; // Lunes a Jueves
  let weekendMicroSum = 0; // Viernes a Domingo

  for (const tx of transactions) {
    if (tx.type === "income") {
      totalIncome += tx.amount;
      continue;
    }

    // Es un egreso
    totalExpenses += tx.amount;
    expensesByCategory[tx.category] = (expensesByCategory[tx.category] || 0) + tx.amount;

    // Asignar al pilar 60-25-15
    const pillar = CATEGORY_MAPPING[tx.category] || "deseos";
    breakdown[pillar] += tx.amount;

    // Evaluar si es Gasto Hormiga (menor a umbral y en categorías de consumo impulsivo/ocio)
    const isPillarDeseos = pillar === "deseos";
    const isUnderThreshold = tx.amount <= microThreshold;
    if (tx.isMicroExpense || (isPillarDeseos && isUnderThreshold)) {
      microExpenses.push(tx);

      // Calcular día de la semana
      const dateObj = new Date(tx.date + "T12:00:00Z");
      const dayIndex = dateObj.getUTCDay();
      const dayName = DAY_NAMES[dayIndex];
      microExpensesByDay[dayName] = (microExpensesByDay[dayName] || 0) + tx.amount;

      if (dayIndex >= 1 && dayIndex <= 4) {
        weekdayMicroSum += tx.amount; // Lunes a Jueves
      } else {
        weekendMicroSum += tx.amount; // Viernes a Domingo
      }
    }
  }

  const effectiveIncome = monthlyIncome || totalIncome || (totalExpenses > 0 ? totalExpenses : 1000);

  // Totales de gastos hormiga
  const totalMicroAmount = microExpenses.reduce((sum, tx) => sum + tx.amount, 0);
  const microExpenseCount = microExpenses.length;
  const projectedYearlyMicro = totalMicroAmount * 12;

  // Regla conductual: "Gastar solo 2 días a la semana"
  // Si se reducen los gastos entre semana (lunes a jueves) al 80% y se limita el ocio a 2 días (ej. vie y sab),
  // se estima un ahorro del ~65% de estos microgastos.
  const potentialSavingsWith2DaysRule = (weekdayMicroSum * 0.85) + (weekendMicroSum * 0.35);
  const potentialYearlySavings = potentialSavingsWith2DaysRule * 12;

  // Cálculo de la regla 60-25-15
  const actualPercentages = {
    necesidades: Number(((breakdown.necesidades / effectiveIncome) * 100).toFixed(1)),
    deseos: Number(((breakdown.deseos / effectiveIncome) * 100).toFixed(1)),
    ahorro: Number(((breakdown.ahorro / effectiveIncome) * 100).toFixed(1))
  };

  const idealBudget = {
    necesidades: Number((effectiveIncome * 0.60).toFixed(2)),
    deseos: Number((effectiveIncome * 0.25).toFixed(2)),
    ahorro: Number((effectiveIncome * 0.15).toFixed(2))
  };

  const budgetGaps = {
    necesidadesDiff: Number((breakdown.necesidades - idealBudget.necesidades).toFixed(2)),
    deseosDiff: Number((breakdown.deseos - idealBudget.deseos).toFixed(2)),
    ahorroDiff: Number((breakdown.ahorro - idealBudget.ahorro).toFixed(2))
  };

  // Cálculo del Score de Salud Financiera (0 - 100)
  let healthScore = 100;
  // Penalización si deseos supera el 25%
  if (actualPercentages.deseos > 25) {
    healthScore -= Math.min(35, (actualPercentages.deseos - 25) * 2);
  }
  // Penalización si necesidades supera el 60%
  if (actualPercentages.necesidades > 60) {
    healthScore -= Math.min(25, (actualPercentages.necesidades - 60) * 1.5);
  }
  // Bonificación / Penalización por ahorro (meta 15%)
  if (actualPercentages.ahorro < 15) {
    healthScore -= Math.min(30, (15 - actualPercentages.ahorro) * 2.5);
  }
  healthScore = Math.max(10, Math.min(100, Math.round(healthScore)));

  // Oportunidades con Productos de Caja de Ahorros
  const cajaDeAhorrosProducts = {
    cuentaNavidena: {
      name: "Cuenta de Ahorro Navideño Caja de Ahorros",
      weeklyContribution: Number((potentialSavingsWith2DaysRule / 4).toFixed(2)),
      yearEndPayout: Number((potentialSavingsWith2DaysRule * 11.5).toFixed(2)), // Con interés y bonificación
      description: "Canalizando tu ahorro de gastos hormiga tendrías un aguinaldo de fin de año garantizado sin deudas."
    },
    plazoFijo: {
      name: "Depósito a Plazo Fijo Caja de Ahorros",
      initialDeposit: Number(potentialSavingsWith2DaysRule.toFixed(2)),
      projected3Years: Number((potentialYearlySavings * 3 * 1.045).toFixed(2)), // Tasa referencial 4.5% anual
      description: "Haz que tu dinero ahorrado trabaje para ti con la solidez y garantía del banco de la familia panameña."
    },
    metaHipotecaria: {
      name: "Fondo para Primera Vivienda / Hipoteca Caja de Ahorros",
      monthlyPotential: Number((potentialSavingsWith2DaysRule + Math.max(0, -budgetGaps.ahorroDiff)).toFixed(2)),
      description: "Caja de Ahorros es líder en préstamos hipotecarios; este ahorro te acerca a tu casa propia en 24 meses."
    }
  };

  return {
    summary: {
      totalIncome: Number(totalIncome.toFixed(2)),
      totalExpenses: Number(totalExpenses.toFixed(2)),
      netBalance: Number((totalIncome - totalExpenses).toFixed(2)),
      effectiveIncome: Number(effectiveIncome.toFixed(2)),
      healthScore
    },
    gastosHormiga: {
      totalMicroAmount: Number(totalMicroAmount.toFixed(2)),
      microExpenseCount,
      projectedYearlyMicro: Number(projectedYearlyMicro.toFixed(2)),
      percentageOfIncome: Number(((totalMicroAmount / effectiveIncome) * 100).toFixed(1)),
      byDay: microExpensesByDay,
      weekdayTotal: Number(weekdayMicroSum.toFixed(2)),
      weekendTotal: Number(weekendMicroSum.toFixed(2)),
      potentialMonthlySavingsWith2DaysRule: Number(potentialSavingsWith2DaysRule.toFixed(2)),
      potentialYearlySavings: Number(potentialYearlySavings.toFixed(2)),
      items: microExpenses
    },
    rule60_25_15: {
      actual: {
        necesidades: Number(breakdown.necesidades.toFixed(2)),
        deseos: Number(breakdown.deseos.toFixed(2)),
        ahorro: Number(breakdown.ahorro.toFixed(2))
      },
      actualPercentages,
      targetPercentages: { necesidades: 60, deseos: 25, ahorro: 15 },
      idealBudget,
      budgetGaps,
      complianceStatus: {
        necesidades: actualPercentages.necesidades <= 60 ? "Óptimo" : "Excedido",
        deseos: actualPercentages.deseos <= 25 ? "Saludable" : "Elevado",
        ahorro: actualPercentages.ahorro >= 15 ? "Meta cumplida" : "Insuficiente"
      }
    },
    cajaDeAhorrosProducts,
    expensesByCategory
  };
}

/**
 * Genera el contexto optimizado para el prompt del LLM QVAC.
 */
export function buildLlmPromptContext(analysis, profileName = "Cliente de Caja de Ahorros") {
  const { summary, gastosHormiga, rule60_25_15, cajaDeAhorrosProducts } = analysis;

  return `
--- DATOS FINANCIEROS AUDITADOS LOCALMENTE PARA ${profileName.toUpperCase()} ---
* Ingresos Mensuales: $${summary.effectiveIncome.toFixed(2)}
* Gastos Totales del Periodo: $${summary.totalExpenses.toFixed(2)}
* Balance Neto: $${summary.netBalance.toFixed(2)}
* Puntuación de Salud Financiera: ${summary.healthScore}/100

[DETECCIÓN DE GASTOS HORMIGA]
- Total detectado en micro-gastos: $${gastosHormiga.totalMicroAmount.toFixed(2)} (${gastosHormiga.percentageOfIncome}% de tus ingresos).
- Cantidad de transacciones hormiga: ${gastosHormiga.microExpenseCount} compras (cafés, delivery, golosinas, kioscos).
- Fuga proyectada al año: $${gastosHormiga.projectedYearlyMicro.toFixed(2)} al año.
- Distribución semanal: $${gastosHormiga.weekdayTotal.toFixed(2)} de Lunes a Jueves vs $${gastosHormiga.weekendTotal.toFixed(2)} de Viernes a Domingo.
- REGLA DE 2 DÍAS DE GASTO: Si limitas gastos en ocio/café/delivery solo a 2 días a la semana (ej. viernes y sábado), ahorrarías aproximadamente $${gastosHormiga.potentialMonthlySavingsWith2DaysRule.toFixed(2)} al mes ($${gastosHormiga.potentialYearlySavings.toFixed(2)} al año).

[DISTRIBUCIÓN REGLA 60-25-15]
- Necesidades (Meta: 60% | $${rule60_25_15.idealBudget.necesidades.toFixed(2)}): Actual ${rule60_25_15.actualPercentages.necesidades}% ($${rule60_25_15.actual.necesidades.toFixed(2)}) -> Estado: ${rule60_25_15.complianceStatus.necesidades}
- Deseos (Meta: 25% | $${rule60_25_15.idealBudget.deseos.toFixed(2)}): Actual ${rule60_25_15.actualPercentages.deseos}% ($${rule60_25_15.actual.deseos.toFixed(2)}) -> Estado: ${rule60_25_15.complianceStatus.deseos}
- Ahorro (Meta: 15% | $${rule60_25_15.idealBudget.ahorro.toFixed(2)}): Actual ${rule60_25_15.actualPercentages.ahorro}% ($${rule60_25_15.actual.ahorro.toFixed(2)}) -> Estado: ${rule60_25_15.complianceStatus.ahorro}

[PRODUCTOS SUGERIDOS DE CAJA DE AHORROS]
- ${cajaDeAhorrosProducts.cuentaNavidena.name}: Podrías acumular aprox. $${cajaDeAhorrosProducts.cuentaNavidena.yearEndPayout.toFixed(2)} para fin de año.
- ${cajaDeAhorrosProducts.plazoFijo.name}: Proyección a 3 años de $${cajaDeAhorrosProducts.plazoFijo.projected3Years.toFixed(2)}.
`;
}
