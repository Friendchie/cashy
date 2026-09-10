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

  console.log("\n[4/4] Probando integración de Productos de Caja de Ahorros...");
  assert.ok(analysis.cajaDeAhorrosProducts.cuentaNavidena, "Debe existir opción de Cuenta Navideña");
  assert.ok(analysis.cajaDeAhorrosProducts.plazoFijo, "Debe existir opción de Plazo Fijo");
  assert.ok(analysis.cajaDeAhorrosProducts.metaHipotecaria, "Debe existir opción de Hipoteca Familiar");
  console.log("  ✅ Productos de Caja de Ahorros vinculados a la capacidad de ahorro rescatada.");

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
