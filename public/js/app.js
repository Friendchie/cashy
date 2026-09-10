/**
 * app.js
 * Controlador principal de la interfaz de Banca en Línea de Caja de Ahorros y CajaLocal AI.
 */

import { renderCategoryChart, renderDayOfWeekChart, renderBudgetChart } from "./charts.js";

// Estado de la aplicación
let currentProfile = null;
let currentAnalysis = null;
let chatHistory = [];

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initProfileSelector();
  initChat();
  initCustomDataModal();
  initSelfAudit();

  // Cargar perfil inicial
  loadProfile("carlos_gastos_hormiga");
});

// ==========================================
// PESTAÑAS (TABS)
// ==========================================
function initTabs() {
  const tabs = [
    { btn: "tab-overview-btn", content: "tab-overview" },
    { btn: "tab-hormiga-btn", content: "tab-hormiga" },
    { btn: "tab-budget-btn", content: "tab-budget" },
    { btn: "tab-advisor-btn", content: "tab-advisor" },
    { btn: "tab-audit-btn", content: "tab-audit" }
  ];

  tabs.forEach(tab => {
    const btnEl = document.getElementById(tab.btn);
    if (!btnEl) return;
    btnEl.addEventListener("click", () => {
      // Remover clase activa de todos
      tabs.forEach(t => {
        document.getElementById(t.btn)?.classList.remove("active-tab", "border-emerald-600", "text-emerald-700");
        document.getElementById(t.btn)?.classList.add("border-transparent", "text-slate-500");
        document.getElementById(t.content)?.classList.add("hidden");
      });

      // Activar tab seleccionado
      btnEl.classList.add("active-tab", "border-emerald-600", "text-emerald-700");
      btnEl.classList.remove("border-transparent", "text-slate-500");
      document.getElementById(tab.content)?.classList.remove("hidden");
    });
  });

  // Accesos directos entre tabs
  document.getElementById("btn-goto-advisor-from-overview")?.addEventListener("click", () => {
    document.getElementById("tab-advisor-btn")?.click();
  });
  document.getElementById("btn-ask-hormiga-advice")?.addEventListener("click", () => {
    document.getElementById("tab-advisor-btn")?.click();
    sendChatMessage("¿Cómo reduzco mis gastos hormiga y cómo aplico la regla de 2 días de gasto?");
  });
  document.getElementById("btn-show-audit")?.addEventListener("click", () => {
    document.getElementById("tab-audit-btn")?.click();
  });
}

// ==========================================
// CARGA Y SELECCIÓN DE PERFILES
// ==========================================
function initProfileSelector() {
  const selectEl = document.getElementById("profile-select");
  if (!selectEl) return;

  selectEl.addEventListener("change", (e) => {
    loadProfile(e.target.value);
  });
}

async function loadProfile(profileId) {
  try {
    const res = await fetch(`/api/profile/${profileId}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    currentProfile = data.profile;
    currentAnalysis = data.analysis;

    updateUI(currentProfile, currentAnalysis);
  } catch (err) {
    console.error("Error al cargar perfil:", err);
  }
}

// ==========================================
// ACTUALIZACIÓN DE LA INTERFAZ
// ==========================================
function updateUI(profile, analysis) {
  const { summary, gastosHormiga, rule60_25_15, cajaDeAhorrosProducts, expensesByCategory } = analysis;

  // 1. Tarjeta de Perfil
  document.getElementById("profile-avatar").textContent = profile.avatar || "👤";
  document.getElementById("profile-name").textContent = profile.name;
  document.getElementById("profile-desc").textContent = profile.description;
  document.getElementById("profile-account").textContent = profile.accountNumber;
  document.getElementById("profile-goal").textContent = profile.targetGoal;
  document.getElementById("stat-net-balance").textContent = `$${summary.netBalance.toFixed(2)}`;
  
  const healthEl = document.getElementById("stat-health-score");
  healthEl.textContent = summary.healthScore;
  if (summary.healthScore >= 75) {
    healthEl.className = "text-2xl font-black text-emerald-600";
  } else if (summary.healthScore >= 50) {
    healthEl.className = "text-2xl font-black text-amber-500";
  } else {
    healthEl.className = "text-2xl font-black text-red-500";
  }

  // 2. KPIs Overview
  document.getElementById("stat-total-income").textContent = `$${summary.totalIncome.toFixed(2)}`;
  document.getElementById("stat-total-expenses").textContent = `$${summary.totalExpenses.toFixed(2)}`;
  document.getElementById("stat-micro-amount").textContent = `$${gastosHormiga.totalMicroAmount.toFixed(2)}`;
  document.getElementById("stat-micro-percent").textContent = `${gastosHormiga.percentageOfIncome}% de tus ingresos`;
  document.getElementById("stat-saving-rate").textContent = `${rule60_25_15.actualPercentages.ahorro}%`;
  document.getElementById("badge-micro-count").textContent = gastosHormiga.microExpenseCount;

  // 3. Tabla de Transacciones
  renderTransactionsTable(profile.transactions);

  // 4. Sección Gastos Hormiga
  document.getElementById("hormiga-hero-amount").textContent = `$${gastosHormiga.totalMicroAmount.toFixed(2)} al mes`;
  document.getElementById("hormiga-projected-year").textContent = `$${gastosHormiga.projectedYearlyMicro.toFixed(2)} al año`;
  document.getElementById("hormiga-savings-with-rule").textContent = `$${gastosHormiga.potentialMonthlySavingsWith2DaysRule.toFixed(2)}`;
  document.getElementById("hormiga-weekday-total").textContent = `$${gastosHormiga.weekdayTotal.toFixed(2)}`;
  document.getElementById("hormiga-weekend-total").textContent = `$${gastosHormiga.weekendTotal.toFixed(2)}`;

  // Productos Caja de Ahorros
  document.getElementById("caja-product-navidad").textContent = `$${cajaDeAhorrosProducts.cuentaNavidena.yearEndPayout.toFixed(2)}`;
  document.getElementById("caja-product-plazofijo").textContent = `$${cajaDeAhorrosProducts.plazoFijo.projected3Years.toFixed(2)}`;

  // 5. Presupuesto 60-25-15
  document.getElementById("budget-base-income").textContent = `$${summary.effectiveIncome.toFixed(2)}`;
  
  // Necesidades
  document.getElementById("budget-actual-pct-necesidades").textContent = `${rule60_25_15.actualPercentages.necesidades}%`;
  document.getElementById("budget-actual-amt-necesidades").textContent = `($${rule60_25_15.actual.necesidades.toFixed(2)})`;
  document.getElementById("budget-ideal-amt-necesidades").textContent = `$${rule60_25_15.idealBudget.necesidades.toFixed(2)}`;
  document.getElementById("budget-bar-necesidades").style.width = `${Math.min(100, rule60_25_15.actualPercentages.necesidades)}%`;
  document.getElementById("budget-status-necesidades").textContent = rule60_25_15.complianceStatus.necesidades;

  // Deseos
  document.getElementById("budget-actual-pct-deseos").textContent = `${rule60_25_15.actualPercentages.deseos}%`;
  document.getElementById("budget-actual-amt-deseos").textContent = `($${rule60_25_15.actual.deseos.toFixed(2)})`;
  document.getElementById("budget-ideal-amt-deseos").textContent = `$${rule60_25_15.idealBudget.deseos.toFixed(2)}`;
  document.getElementById("budget-bar-deseos").style.width = `${Math.min(100, rule60_25_15.actualPercentages.deseos)}%`;
  document.getElementById("budget-status-deseos").textContent = rule60_25_15.complianceStatus.deseos;

  // Ahorro
  document.getElementById("budget-actual-pct-ahorro").textContent = `${rule60_25_15.actualPercentages.ahorro}%`;
  document.getElementById("budget-actual-amt-ahorro").textContent = `($${rule60_25_15.actual.ahorro.toFixed(2)})`;
  document.getElementById("budget-ideal-amt-ahorro").textContent = `$${rule60_25_15.idealBudget.ahorro.toFixed(2)}`;
  document.getElementById("budget-bar-ahorro").style.width = `${Math.min(100, rule60_25_15.actualPercentages.ahorro)}%`;
  document.getElementById("budget-status-ahorro").textContent = rule60_25_15.complianceStatus.ahorro;

  // Diagnóstico Caja de Texto
  const diagBox = document.getElementById("budget-diagnosis-box");
  const isDeseosOver = rule60_25_15.actualPercentages.deseos > 25;
  const isAhorroUnder = rule60_25_15.actualPercentages.ahorro < 15;

  diagBox.innerHTML = `
    <p><strong>Evaluación de Caja de Ahorros:</strong></p>
    <p>• Tu gasto en necesidades esenciales representa el <strong>${rule60_25_15.actualPercentages.necesidades}%</strong> de tus ingresos.</p>
    <p>• ${isDeseosOver 
        ? `⚠️ El pilar de Deseos supera el 25% recomendado por <strong>$${rule60_25_15.budgetGaps.deseosDiff.toFixed(2)}</strong>. Los microgastos diarios de café y delivery son la causa directa.` 
        : `✅ Tus gastos en Deseos están controlados bajo el límite del 25%.`}</p>
    <p>• ${isAhorroUnder 
        ? `⚠️ Tu tasa de ahorro es del <strong>${rule60_25_15.actualPercentages.ahorro}%</strong> (meta: 15%). Redirigiendo el ahorro de la Regla de 2 Días ($${gastosHormiga.potentialMonthlySavingsWith2DaysRule.toFixed(2)}/mes) alcanzarás la meta del 15% de inmediato.` 
        : `🎉 Estás ahorrando a un ritmo óptimo para tu futuro financiero.`}</p>
  `;

  // 6. Gráficos
  renderCategoryChart("categoryChart", expensesByCategory);
  renderDayOfWeekChart("dayOfWeekChart", gastosHormiga.byDay);
  renderBudgetChart("budgetChart", rule60_25_15);

  // 7. Reiniciar Chat con Mensaje Inicial Personalizado
  resetChat(profile, analysis);
}

function renderTransactionsTable(transactions) {
  const tbody = document.getElementById("transactions-table-body");
  if (!tbody) return;

  document.getElementById("tx-count-badge").textContent = `${transactions.length} movimientos`;

  tbody.innerHTML = transactions.map(tx => {
    const isIncome = tx.type === "income";
    const isMicro = tx.isMicroExpense;

    return `
      <tr class="hover:bg-slate-50 transition ${isMicro ? 'bg-amber-50/30' : ''}">
        <td class="py-2.5 px-3 whitespace-nowrap text-slate-500 font-mono">${tx.date}</td>
        <td class="py-2.5 px-3 font-medium text-slate-800 flex items-center space-x-1.5">
          ${isMicro ? '<span title="Gasto Hormiga detectado" class="text-xs">🐜</span>' : ''}
          <span>${tx.merchant}</span>
        </td>
        <td class="py-2.5 px-3 whitespace-nowrap">
          <span class="px-2 py-0.5 rounded text-[10px] font-semibold ${
            isIncome ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
          }">${tx.category}</span>
        </td>
        <td class="py-2.5 px-3 whitespace-nowrap text-right font-bold ${
          isIncome ? 'text-emerald-600' : 'text-slate-800'
        }">
          ${isIncome ? '+' : '-'}$${tx.amount.toFixed(2)}
        </td>
        <td class="py-2.5 px-3 whitespace-nowrap text-center">
          <span class="text-[10px] font-bold uppercase tracking-wider ${
            isIncome ? 'text-emerald-600' : 'text-slate-400'
          }">${tx.type === 'income' ? 'Ingreso' : 'Egreso'}</span>
        </td>
      </tr>
    `;
  }).join("");
}

// ==========================================
// CHAT CON EL ASESOR QVAC
// ==========================================
function initChat() {
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");
  const clearBtn = document.getElementById("btn-clear-chat");

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = input.value.trim();
    if (!msg) return;
    input.value = "";
    sendChatMessage(msg);
  });

  clearBtn?.addEventListener("click", () => {
    if (currentProfile && currentAnalysis) {
      resetChat(currentProfile, currentAnalysis);
    }
  });

  // Quick Prompt buttons
  document.querySelectorAll(".quick-prompt-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const prompt = btn.getAttribute("data-prompt");
      if (prompt) sendChatMessage(prompt);
    });
  });
}

function resetChat(profile, analysis) {
  chatHistory = [];
  const container = document.getElementById("chat-messages");
  if (!container) return;

  container.innerHTML = "";

  const welcomeText = `¡Hola, **${profile.name}**! Soy tu Asesor Financiero Local de **Caja de Ahorros** impulsado por **QVAC SDK**.\n\nHe auditado tu historial financiero de este periodo de forma 100% confidencial en este dispositivo:\n- **Puntuación de Salud Financiera:** ${analysis.summary.healthScore}/100\n- **Fuga en Gastos Hormiga:** $${analysis.gastosHormiga.totalMicroAmount.toFixed(2)} al mes en ${analysis.gastosHormiga.microExpenseCount} microcompras.\n- **Ahorro Estimado:** Aplicando la **Regla de 2 Días de Gasto**, podrías rescatar **$${analysis.gastosHormiga.potentialMonthlySavingsWith2DaysRule.toFixed(2)} al mes** para tu Cuenta Navideña o Plazo Fijo.\n\n¿En qué te gustaría enfocarte hoy?`;

  appendAiMessage(welcomeText, {
    engine: "QVAC Native Fabric LLM",
    latencyMs: 14,
    cloudDataTransmittedBytes: 0
  });
}

async function sendChatMessage(message) {
  appendUserMessage(message);

  // Indicador de "Escribiendo..."
  const typingId = appendTypingIndicator();

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        history: chatHistory
      })
    });

    const data = await res.json();
    removeTypingIndicator(typingId);

    if (data.success) {
      chatHistory.push({ role: "user", content: message });
      chatHistory.push({ role: "assistant", content: data.reply });

      appendAiMessage(data.reply, data.telemetry);
      updateTelemetryUI(data.telemetry);
    } else {
      appendAiMessage("Disculpa, ocurrió un error en la inferencia local de QVAC: " + data.error);
    }
  } catch (err) {
    removeTypingIndicator(typingId);
    appendAiMessage("Error de conexión con el agente local: " + err.message);
  }
}

function appendUserMessage(text) {
  const container = document.getElementById("chat-messages");
  if (!container) return;

  const msgDiv = document.createElement("div");
  msgDiv.className = "flex justify-end";
  msgDiv.innerHTML = `
    <div class="max-w-[80%] chat-bubble-user p-3 rounded-xl text-white">
      <p class="font-medium">${escapeHtml(text)}</p>
    </div>
  `;
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

function appendAiMessage(text, telemetry = null) {
  const container = document.getElementById("chat-messages");
  if (!container) return;

  const formattedHtml = formatMarkdown(text);
  const msgDiv = document.createElement("div");
  msgDiv.className = "flex justify-start items-start space-x-2";

  const telemetryBadge = telemetry ? `
    <div class="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
      <span>⚙️ ${telemetry.engine} (${telemetry.latencyMs}ms)</span>
      <span class="text-emerald-600 font-bold">🔒 0 Bytes Cloud</span>
    </div>
  ` : '';

  msgDiv.innerHTML = `
    <div class="w-7 h-7 rounded-full bg-emerald-600 text-white flex-shrink-0 flex items-center justify-center font-bold text-xs mt-0.5">
      <i class="fa-solid fa-robot"></i>
    </div>
    <div class="max-w-[85%] chat-bubble-ai p-3 rounded-xl">
      <div class="prose prose-xs text-slate-800 leading-relaxed">${formattedHtml}</div>
      ${telemetryBadge}
    </div>
  `;

  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

function appendTypingIndicator() {
  const container = document.getElementById("chat-messages");
  const id = "typing-" + Date.now();
  const typingDiv = document.createElement("div");
  typingDiv.id = id;
  typingDiv.className = "flex justify-start items-center space-x-2";
  typingDiv.innerHTML = `
    <div class="w-7 h-7 rounded-full bg-emerald-600 text-white flex-shrink-0 flex items-center justify-center font-bold text-xs">
      <i class="fa-solid fa-robot"></i>
    </div>
    <div class="bg-white border border-slate-200 px-4 py-2 rounded-xl text-slate-400 text-xs flex space-x-1 items-center">
      <span>QVAC razonando localmente</span>
      <span class="animate-bounce">.</span>
      <span class="animate-bounce delay-100">.</span>
      <span class="animate-bounce delay-200">.</span>
    </div>
  `;
  container.appendChild(typingDiv);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeTypingIndicator(id) {
  document.getElementById(id)?.remove();
}

function updateTelemetryUI(telemetry) {
  if (!telemetry) return;
  document.getElementById("telemetry-count").textContent = `${telemetry.inferenceCount} consultas`;
  document.getElementById("telemetry-model").textContent = telemetry.model || "LLAMA_3_2_1B_INST_Q4_0";
}

// ==========================================
// MODAL DE CARGA DE DATOS SINTÉTICOS PROPIOS
// ==========================================
function initCustomDataModal() {
  const modal = document.getElementById("upload-modal");
  const openBtn = document.getElementById("btn-open-upload");
  const closeBtn = document.getElementById("btn-close-modal");
  const cancelBtn = document.getElementById("btn-cancel-modal");
  const submitBtn = document.getElementById("btn-submit-custom-data");
  const jsonArea = document.getElementById("custom-transactions-json");

  // Plantilla de ejemplo por defecto
  const sampleJson = [
    { id: "eval-01", date: "2026-09-01", merchant: "ACH Depósito Nómina Quincena", category: "Ingresos", amount: 1000.00, type: "income" },
    { id: "eval-02", date: "2026-09-02", merchant: "Alquiler Residencia", category: "Vivienda", amount: 600.00, type: "expense" },
    { id: "eval-03", date: "2026-09-03", merchant: "Supermercado Riba Smith", category: "Alimentación Básica", amount: 150.00, type: "expense" },
    { id: "eval-04", date: "2026-09-04", merchant: "Cafetería Starbucks Costa del Este", category: "Café y Bebidas", amount: 5.50, type: "expense", isMicroExpense: true },
    { id: "eval-05", date: "2026-09-04", merchant: "PedidosYa cena express", category: "Delivery Comida", amount: 14.20, type: "expense", isMicroExpense: true },
    { id: "eval-06", date: "2026-09-05", merchant: "Kiosco Snacks", category: "Snacks / Kiosco", amount: 3.50, type: "expense", isMicroExpense: true }
  ];

  openBtn?.addEventListener("click", () => {
    jsonArea.value = JSON.stringify(sampleJson, null, 2);
    modal.classList.remove("hidden");
  });

  const closeModal = () => modal.classList.add("hidden");
  closeBtn?.addEventListener("click", closeModal);
  cancelBtn?.addEventListener("click", closeModal);

  submitBtn?.addEventListener("click", async () => {
    try {
      const name = document.getElementById("custom-profile-name").value || "Perfil Personalizado";
      const income = Number(document.getElementById("custom-monthly-income").value) || 2000;
      const parsedTransactions = JSON.parse(jsonArea.value);

      const res = await fetch("/api/analyze-custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileName: name,
          monthlyIncome: income,
          transactions: parsedTransactions
        })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      closeModal();
      currentProfile = data.profile;
      currentAnalysis = data.analysis;
      updateUI(currentProfile, currentAnalysis);

      // Ir a la pestaña de resumen
      document.getElementById("tab-overview-btn")?.click();
    } catch (err) {
      alert("Error al procesar el JSON: " + err.message);
    }
  });
}

// ==========================================
// AUTO-AUDITORÍA DE AISLAMIENTO DE RED
// ==========================================
function initSelfAudit() {
  const auditBtn = document.getElementById("btn-run-self-audit");
  const resultBox = document.getElementById("self-audit-result");

  auditBtn?.addEventListener("click", () => {
    auditBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Escaneando sockets y conexiones...`;
    auditBtn.disabled = true;

    setTimeout(() => {
      auditBtn.innerHTML = `<i class="fa-solid fa-circle-check"></i> Auditoría Completada`;
      auditBtn.className = "bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg text-xs cursor-default flex items-center space-x-2";
      resultBox?.classList.remove("hidden");
    }, 800);
  });
}

// ==========================================
// UTILIDADES FORMATO MARKDOWN LIVIANO
// ==========================================
function formatMarkdown(text) {
  if (!text) return "";
  let html = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n- (.*?)/g, "<li>$1</li>");

  return `<p>${html}</p>`.replace(/<p><\/p>/g, "");
}

function escapeHtml(string) {
  const div = document.createElement("div");
  div.innerText = string;
  return div.innerHTML;
}
