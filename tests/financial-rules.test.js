/**
 * financial-rules.test.js
 * Pruebas unitarias para validar los algoritmos de detección de gastos hormiga,
 * regla de presupuesto 60-25-15 y reglas conductuales.
 */

import assert from "assert";
import { analyzeFinancialHealth } from "../server/financial-analyzer.js";

console.log("\n============================================================");
console.log("📊 PRUEBAS UNITARIAS DE REGLAS FINANCIERAS Y ANÁLISIS ON-DEVICE");
console.log("============================================================\n");

function runFinancialTests() {
  console.log("[1/4] Probando detección de Gastos Hormiga (< $15)...");
  
  const mockTransactions = [
    { id: "1", date: "2026-09-01", merchant: "Nómina", category: "Ingresos", amount: 1000.00, type: "income" },
    { id: "2", date: "2026-09-02", merchant: "Café diario", category: "Café y Bebidas", amount: 4.50, type: "expense", isMicroExpense: true },
    { id: "3", date: "2026-09-03", merchant: "Snacks", category: "Snacks / Kiosco", amount: 2.50, type: "expense", isMicroExpense: true },
    { id: "4", date: "2026-09-04", merchant: "Delivery", category: "Delivery Comida", amount: 12.00, type: "expense", isMicroExpense: true },
    { id: "5", date: "2026-09-05", merchant: "Alquiler", category: "Vivienda", amount: 450.00, type: "expense" },
    { id: "6", date: "2026-09-06", merchant: "Supermercado", category: "Alimentación Básica", amount: 150.00, type: "expense" }
  ];

  const analysis = analyzeFinancialHealth(mockTransactions, 1000.00);

  // Microgastos deben ser: $4.50 + $2.50 + $12.00 = $19.00
  assert.strictEqual(analysis.gastosHormiga.totalMicroAmount, 19.00);
  assert.strictEqual(analysis.gastosHormiga.microExpenseCount, 3);
  // Fuga anual: $19.00 * 12 = $228.00
  assert.strictEqual(analysis.gastosHormiga.projectedYearlyMicro, 228.00);
  console.log("  ✅ Gastos hormiga detectados y calculados con precisión matemática.");

  console.log("\n[2/4] Probando Regla Conductual de 2 Días de Gasto de Ocio...");
  assert.ok(analysis.gastosHormiga.potentialMonthlySavingsWith2DaysRule > 0, "El ahorro con regla de 2 días debe ser mayor a 0");
  assert.ok(analysis.gastosHormiga.potentialYearlySavings > 0, "El ahorro anual potencial debe ser mayor a 0");
  console.log(`  ✅ Regla conductual calculó ahorro potencial mensual: $${analysis.gastosHormiga.potentialMonthlySavingsWith2DaysRule.toFixed(2)}`);

  console.log("\n[3/4] Probando distribución de la Regla 60-25-15...");
  // Necesidades: Alquiler ($450) + Supermercado ($150) = $600 (60.0% de $1000)
  assert.strictEqual(analysis.rule60_25_15.actual.necesidades, 600.00);
  assert.strictEqual(analysis.rule60_25_15.actualPercentages.necesidades, 60.0);
  assert.strictEqual(analysis.rule60_25_15.complianceStatus.necesidades, "Óptimo");

  // Deseos: Café ($4.50) + Snacks ($2.50) + Delivery ($12.00) = $19.00 (1.9% de $1000)
  assert.strictEqual(analysis.rule60_25_15.actual.deseos, 19.00);
  assert.strictEqual(analysis.rule60_25_15.actualPercentages.deseos, 1.9);
  assert.strictEqual(analysis.rule60_25_15.complianceStatus.deseos, "Saludable");

  console.log("  ✅ Pilares 60-25-15 clasificados y evaluados correctamente.");

  console.log("\n[4/5] Probando integración de Productos de Caja de Ahorros...");
  assert.ok(analysis.cajaDeAhorrosProducts.cuentaNavidena, "Debe existir opción de Cuenta Navideña");
  assert.ok(analysis.cajaDeAhorrosProducts.plazoFijo, "Debe existir opción de Plazo Fijo");
  assert.ok(analysis.cajaDeAhorrosProducts.metaHipotecaria, "Debe existir opción de Hipoteca Familiar");
  console.log("  ✅ Productos de Caja de Ahorros vinculados a la capacidad de ahorro rescatada.");

  console.log("\n[5/5] Probando clasificación autónoma de transacciones en bruto (solo fecha, comercio y monto)...");
  const rawTransactions = [
    { date: "2026-09-01", merchant: "ACH Deposito Nomina Quincenal", amount: 1200.00 },
    { date: "2026-09-02", merchant: "Cafeteria Unido Costa del Este", amount: 4.85 },
    { date: "2026-09-02", merchant: "Super 99 Albrook", amount: 140.20 },
    { date: "2026-09-03", merchant: "PedidosYa express", amount: 11.50 },
    { date: "2026-09-04", merchant: "Naturgy Panama Electricidad", amount: 55.00 }
  ];

  const rawAnalysis = analyzeFinancialHealth(rawTransactions, 1200.00);

  // Unido ($4.85) + PedidosYa ($11.50) deben ser detectados como gastos hormiga: $16.35
  assert.strictEqual(rawAnalysis.gastosHormiga.totalMicroAmount, 16.35);
  assert.strictEqual(rawAnalysis.gastosHormiga.microExpenseCount, 2);
  
  // Super 99 + Naturgy deben ser Necesidades: $140.20 + $55.00 = $195.20
  assert.strictEqual(rawAnalysis.rule60_25_15.actual.necesidades, 195.20);
  
  // Unido + PedidosYa deben ser Deseos: $16.35
  assert.strictEqual(rawAnalysis.rule60_25_15.actual.deseos, 16.35);

  console.log("  ✅ Transacciones en bruto clasificadas automáticamente en Necesidades, Deseos y Gastos Hormiga.");

  console.log("\n[6/7] Probando Proyección Quincenal Día a Día (Pista de Aterrizaje)...");
  assert.ok(rawAnalysis.quincenaRunway, "Debe incluir objeto de proyección quincenal");
  assert.ok(rawAnalysis.quincenaRunway.daysRemaining > 0, "Días hasta quincena deben ser mayores a cero");
  assert.ok(rawAnalysis.quincenaRunway.safeDailySpend > 0, "Gasto diario seguro debe ser positivo");
  assert.ok(Array.isArray(rawAnalysis.quincenaRunway.dayByDay), "Curva día a día debe ser un array");
  console.log(`  ✅ Proyección quincenal validada: ${rawAnalysis.quincenaRunway.daysRemaining} días restantes, Gasto seguro: $${rawAnalysis.quincenaRunway.safeDailySpend}/día.`);

  console.log("\n[7/7] Probando Simulador de Escenarios de Ahorro What-If...");
  assert.ok(rawAnalysis.savingsScenarios, "Debe incluir escenarios de ahorro");
  assert.ok(rawAnalysis.savingsScenarios.escenarios.moderado.monthlySavings > 0, "Escenario moderado debe tener ahorro");
  assert.ok(rawAnalysis.savingsScenarios.escenarios.optimo.monthlySavings > 0, "Escenario óptimo debe tener ahorro");
  assert.ok(rawAnalysis.savingsScenarios.escenarios.intenso.monthlySavings > 0, "Escenario intenso debe tener ahorro");
  console.log("  ✅ Escenarios de ahorro simulados y vinculados a metas de Caja de Ahorros.");

  console.log("\n============================================================");
  console.log("🎉 TODAS LAS PRUEBAS DE REGLAS FINANCIERAS PASARON EXITOSAMENTE");
  console.log("============================================================\n");
}

try {
  runFinancialTests();
} catch (e) {
  console.error("❌ Falló prueba financiera:", e.message);
  process.exit(1);
}
