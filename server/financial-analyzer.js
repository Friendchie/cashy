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

/**
 * Patrones semánticos y comercios panameños para clasificación autónoma
 * de transacciones bancarias en bruto (fecha, comercio, monto).
 */
const MERCHANT_PATTERNS = [
  // INGRESOS
  { pattern: /nomina|salario|deposito|quincena|ach credito|planilla|honorarios|sueldo|pago quincenal/i, type: "income", category: "Ingresos" },

  // NECESIDADES (Meta 60%)
  { pattern: /super 99|riba smith|machetazo|pricesmart|super rey|romero|super xtra|supermercado|carniceria|fruteria|abasto/i, type: "expense", category: "Alimentación Básica" },
  { pattern: /naturgy|ensa|idaan|tigo|mas movil|\+movil|cable onda|claro|cable & wireless|gas|aseo|electricidad|agua/i, type: "expense", category: "Servicios Básicos" },
  { pattern: /alquiler|hipoteca|ph |condominio|inmobiliaria|arriendo|residencia|apartamento/i, type: "expense", category: "Vivienda" },
  { pattern: /metro de panama|metrobus|panapass|terpel|delta|texaco|puma|combustible|gasolina|peaje/i, type: "expense", category: "Transporte" },
  { pattern: /farmacia|arrocha|metro|javillo|clinica|hospital|laboratorio|doctor|medico|medicamento/i, type: "expense", category: "Salud" },
  { pattern: /colegio|escuela|universidad|matricula|mensualidad escolar|educacion/i, type: "expense", category: "Educación" },

  // DESEOS (Meta 25%)
  { pattern: /cafe|cafeteria|unido|kotowa|starbucks|juan valdez|duran|bakery|panaderia|latte|capuccino/i, type: "expense", category: "Café y Bebidas" },
  { pattern: /pedidosya|uber eats|asap|appetito|delivery/i, type: "expense", category: "Delivery Comida" },
  { pattern: /kiosco|momi|dulceria|cinnabon|dairy queen|paleta|gelati|snacks|vending|dulces|chucherias/i, type: "expense", category: "Snacks / Kiosco" },
  { pattern: /mcdonald|wendy|kfc|burger king|popeyes|pizza|subway|taco bell|fridays|doraditos|papas/i, type: "expense", category: "Delivery Comida" },
  { pattern: /restaurante|bar|la rana dorada|cerveceria|pub|discoteca|cine|cinepolis|cinemark|salida/i, type: "expense", category: "Ocio / Salidas" },
  { pattern: /zara|h&m|albrook mall|multiplaza|doit center|felix|stevens|compras|tienda/i, type: "expense", category: "Compras Varias" },
  { pattern: /uber|didi|cabify|taxi/i, type: "expense", category: "Transporte Opcional" },
  { pattern: /netflix|spotify|disney|apple|prime video|youtube|hbo|max|suscripcion/i, type: "expense", category: "Suscripciones Digitales" },

  // AHORRO (Meta 15%)
  { pattern: /caja de ahorros|ahorro|plazo fijo|inversion|fondo de emergencia/i, type: "expense", category: "Ahorro" }
];

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

/**
 * Normaliza y clasifica automáticamente una transacción bancaria en bruto (incluso si solo tiene fecha, comercio y monto).
 */
export function normalizeTransaction(rawTx, index = 0, microThreshold = 15.00) {
  const merchantName = (rawTx.merchant || rawTx.description || rawTx.detalle || rawTx.name || "Comercio no especificado").trim();
  const rawAmount = Number(rawTx.amount ?? rawTx.monto ?? 0);
  const amount = Math.abs(rawAmount);

  // Fecha por defecto si no viene
  let date = rawTx.date || rawTx.fecha || new Date().toISOString().split("T")[0];

  // Si ya venía clasificada manualmente
  let type = rawTx.type;
  let category = rawTx.category;

  // Clasificación inteligente basada en comercio
  if (!type || !category) {
    for (const rule of MERCHANT_PATTERNS) {
      if (rule.pattern.test(merchantName)) {
        if (!type) type = rule.type;
        if (!category) category = rule.category;
        break;
      }
    }

    // Si aún no se clasifica el tipo:
    if (!type) {
      // Si el monto original era positivo mayor a $200 y no coincide con gastos, o contiene "abono", "deposito"
      type = (rawAmount > 0 && rawTx.isDeposit) ? "income" : "expense";
    }

    // Si aún no se clasifica la categoría:
    if (!category) {
      if (type === "income") {
        category = "Ingresos";
      } else {
        // En egresos no identificados: si es menor a $15 tiende a ser microgasto/kiosco/antojo
        category = (amount <= microThreshold) ? "Snacks / Kiosco" : "Compras Varias";
      }
    }
  }

  // Detección automática de Gasto Hormiga:
  // Es gasto, pertenece al pilar de Deseos (o microgasto evidente) y es menor o igual a $15
  const pillar = CATEGORY_MAPPING[category] || (type === "income" ? "ingreso" : "deseos");
  const isMicroExpense = rawTx.isMicroExpense ?? (type === "expense" && pillar === "deseos" && amount <= microThreshold);

  return {
    id: rawTx.id || `tx-norm-${index + 1}`,
    date,
    merchant: merchantName,
    amount,
    category,
    type,
    isMicroExpense
  };
}

/**
 * Analiza el historial de transacciones y devuelve un diagnóstico financiero completo.
 * Soporta transacciones en bruto con solo fecha, comercio y monto.
 * @param {Array} transactions Lista de transacciones (en bruto o preclasificadas)
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

  // Normalizar y clasificar cada transacción automáticamente
  const normalizedTransactions = (transactions || []).map((tx, idx) => normalizeTransaction(tx, idx, microThreshold));

  for (const tx of normalizedTransactions) {
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

  // 5. Proyección Quincenal Día a Día (Pista de Aterrizaje)
  const quincenaRunway = calculateQuincenaRunway(effectiveIncome, totalExpenses);

  // 6. Simulador de Escenarios de Ahorro
  const savingsScenarios = calculateSavingsScenarios(expensesByCategory, potentialSavingsWith2DaysRule);

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
    quincenaRunway,
    savingsScenarios,
    expensesByCategory,
    normalizedTransactions
  };
}

/**
 * Calcula la proyección de liquidez día a día hasta la próxima quincena panameña (día 15 o fin de mes).
 */
export function calculateQuincenaRunway(effectiveIncome, totalExpenses, refDate = new Date()) {
  const currentDay = refDate.getDate();
  const currentMonth = refDate.getMonth();
  const currentYear = refDate.getFullYear();
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  let targetDay = 15;
  let isEndOfMonth = false;

  if (currentDay < 15) {
    targetDay = 15;
  } else if (currentDay === 15) {
    targetDay = lastDayOfMonth;
    isEndOfMonth = true;
  } else if (currentDay < lastDayOfMonth) {
    targetDay = lastDayOfMonth;
    isEndOfMonth = true;
  } else {
    targetDay = 15;
  }

  let daysRemaining = targetDay >= currentDay ? (targetDay - currentDay) : (lastDayOfMonth - currentDay + 15);
  if (daysRemaining <= 0) daysRemaining = 15;

  const quincenaIncome = effectiveIncome / 2;
  const estimatedLiquidBalance = Math.max(120, quincenaIncome - (totalExpenses / 2 * 0.70));
  const safeDailySpend = Number((estimatedLiquidBalance / daysRemaining).toFixed(2));
  
  const dayByDay = [];
  let runningBalance = estimatedLiquidBalance;
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  for (let i = 0; i <= daysRemaining; i++) {
    const d = new Date(currentYear, currentMonth, currentDay + i);
    const label = `${d.getDate()} ${monthNames[d.getMonth()]}`;
    const isPayday = (i === daysRemaining);
    
    if (i > 0) {
      runningBalance = Math.max(0, runningBalance - safeDailySpend);
    }
    
    dayByDay.push({
      dateLabel: label,
      projectedBalance: isPayday ? Number((runningBalance + quincenaIncome).toFixed(2)) : Number(runningBalance.toFixed(2)),
      safeSpendAllowed: safeDailySpend,
      isPayday
    });
  }

  const nextPaydayLabel = isEndOfMonth 
    ? `${lastDayOfMonth} de ${refDate.toLocaleString('es-ES', { month: 'long' })}` 
    : `15 de ${refDate.toLocaleString('es-ES', { month: 'long' })}`;

  return {
    daysRemaining,
    nextPaydayLabel,
    quincenaIncome: Number(quincenaIncome.toFixed(2)),
    estimatedLiquidBalance: Number(estimatedLiquidBalance.toFixed(2)),
    safeDailySpend,
    status: safeDailySpend >= 18 ? "Saludable" : (safeDailySpend >= 10 ? "Moderado" : "Ajustado"),
    dayByDay
  };
}

/**
 * Calcula escenarios interactivos de ahorro proyectados a productos de Caja de Ahorros.
 */
export function calculateSavingsScenarios(expensesByCategory = {}, potentialSavingsWith2DaysRule = 148.50) {
  const cafeTotal = expensesByCategory["Café y Bebidas"] || 65.00;
  const deliveryTotal = expensesByCategory["Delivery Comida"] || 95.00;
  const snacksTotal = expensesByCategory["Snacks / Kiosco"] || 58.45;

  const rescuedModerate = (cafeTotal * 0.30) + (deliveryTotal * 0.30) + (snacksTotal * 0.30);
  const rescuedOptimal = potentialSavingsWith2DaysRule;
  const rescuedAggressive = (cafeTotal * 0.75) + (deliveryTotal * 0.75) + (snacksTotal * 0.75);

  const formatScenario = (name, desc, monthly) => ({
    name,
    description: desc,
    monthlySavings: Number(monthly.toFixed(2)),
    yearlySavings: Number((monthly * 12).toFixed(2)),
    navidenaPayout: Number((monthly * 11.5).toFixed(2)),
    plazoFijo3Years: Number((monthly * 36 * 1.045).toFixed(2)),
    monthsToMortgageDownpayment: Math.max(6, Math.ceil(3500 / Math.max(1, monthly)))
  });

  return {
    breakdown: {
      cafeMonthly: Number(cafeTotal.toFixed(2)),
      deliveryMonthly: Number(deliveryTotal.toFixed(2)),
      snacksMonthly: Number(snacksTotal.toFixed(2))
    },
    escenarios: {
      moderado: formatScenario("Escenario Moderado", "Recorta 30% en delivery y cafés", rescuedModerate),
      optimo: formatScenario("Regla 2 Días de Ocio", "Consumo de ocio solo viernes y sábado", rescuedOptimal),
      intenso: formatScenario("Meta Acelerada", "Recorta 75% en antojos para meta de casa propia", rescuedAggressive)
    }
  };
}

/**
 * Genera el contexto optimizado para el prompt del LLM QVAC.
 */
export function buildLlmPromptContext(analysis, profileName = "Cliente de Caja de Ahorros") {
  const { summary, gastosHormiga, rule60_25_15, cajaDeAhorrosProducts, quincenaRunway } = analysis;

  return `Perfil: ${profileName} | Ingreso: $${summary.effectiveIncome} | Gastos: $${summary.totalExpenses}
Gastos hormiga: $${gastosHormiga.totalMicroAmount}/mes. Ahorro con Regla de 2 días: $${gastosHormiga.potentialMonthlySavingsWith2DaysRule}/mes.
Presupuesto 60-25-15: Necesidades=${rule60_25_15.actualPercentages.necesidades}%, Deseos=${rule60_25_15.actualPercentages.deseos}%, Ahorro=${rule60_25_15.actualPercentages.ahorro}%.
Quincena: faltan ${quincenaRunway?.daysRemaining || 4} días (gasto seguro: $${quincenaRunway?.safeDailySpend || 20}/día).
Productos CA: Cuenta Navideña (aguinaldo ~$${cajaDeAhorrosProducts.cuentaNavidena.yearEndPayout}) | Plazo Fijo (~$${cajaDeAhorrosProducts.plazoFijo.projected3Years}).`;
}
