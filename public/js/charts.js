/**
 * charts.js
 * Módulo de visualizaciones interactivas con Chart.js para CajaLocal AI.
 */

let categoryChartInstance = null;
let dayOfWeekChartInstance = null;
let budgetChartInstance = null;

/**
 * Renderiza el gráfico de dona de gastos por categoría.
 */
export function renderCategoryChart(canvasId, expensesByCategory) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  if (categoryChartInstance) {
    categoryChartInstance.destroy();
  }

  const labels = Object.keys(expensesByCategory);
  const data = Object.values(expensesByCategory);

  const colors = [
    "#059669", "#10b981", "#3b82f6", "#6366f1", "#f59e0b",
    "#ef4444", "#ec4899", "#8b5cf6", "#14b8a6", "#f97316"
  ];

  categoryChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 2,
        borderColor: "#ffffff"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: {
            boxWidth: 12,
            font: { size: 10, family: "sans-serif" }
          }
        },
        tooltip: {
          callbacks: {
            label: (item) => ` ${item.label}: $${item.raw.toFixed(2)}`
          }
        }
      },
      cutout: "68%"
    }
  });
}

/**
 * Renderiza el gráfico de barras de Gastos Hormiga por Día de la Semana.
 */
export function renderDayOfWeekChart(canvasId, byDayData) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  if (dayOfWeekChartInstance) {
    dayOfWeekChartInstance.destroy();
  }

  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const values = days.map(d => byDayData[d] || 0);

  // Colores: Lunes a Jueves (Rutina laboral / fugas) en naranja/rojo, Fin de semana en esmeralda
  const barColors = [
    "#f97316", "#f97316", "#f97316", "#f97316", // Lun-Jue
    "#10b981", "#059669", "#047857"             // Vie-Dom
  ];

  dayOfWeekChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: days,
      datasets: [{
        label: "Gasto Hormiga Acumulado ($)",
        data: values,
        backgroundColor: barColors,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (item) => ` $${item.raw.toFixed(2)} en microgastos`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (v) => `$${v}`,
            font: { size: 10 }
          },
          grid: { color: "#f1f5f9" }
        },
        x: {
          ticks: { font: { size: 10 } },
          grid: { display: false }
        }
      }
    }
  });
}

/**
 * Renderiza el gráfico comparativo de la Regla 60-25-15 (Actual vs Ideal).
 */
export function renderBudgetChart(canvasId, ruleData) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;

  if (budgetChartInstance) {
    budgetChartInstance.destroy();
  }

  const categories = ["Necesidades (60%)", "Deseos (25%)", "Ahorro (15%)"];
  const actualValues = [
    ruleData.actual.necesidades,
    ruleData.actual.deseos,
    ruleData.actual.ahorro
  ];
  const idealValues = [
    ruleData.idealBudget.necesidades,
    ruleData.idealBudget.deseos,
    ruleData.idealBudget.ahorro
  ];

  budgetChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: categories,
      datasets: [
        {
          label: "Presupuesto Real Actual ($)",
          data: actualValues,
          backgroundColor: "#f59e0b",
          borderRadius: 6
        },
        {
          label: "Meta Caja de Ahorros ($)",
          data: idealValues,
          backgroundColor: "#059669",
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: { font: { size: 10 } }
        },
        tooltip: {
          callbacks: {
            label: (item) => ` ${item.dataset.label}: $${item.raw.toFixed(2)}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (v) => `$${v}`,
            font: { size: 10 }
          },
          grid: { color: "#f1f5f9" }
        },
        x: {
          ticks: { font: { size: 10 } },
          grid: { display: false }
        }
      }
    }
  });
}
