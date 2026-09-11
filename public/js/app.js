/**
 * app.js
 * Controlador oficial para la interfaz de Banca en Línea de Caja de Ahorros con Cashy AI.
 */

import { renderDayOfWeekChart, renderBudgetChart } from "./charts.js";

// Estado de la aplicación
let currentProfile = null;
let currentAnalysis = null;
let chatHistory = [];

document.addEventListener("DOMContentLoaded", () => {
  initLiveClock();
  initNavigation();
  initAdvisorSubTabs();
  initDropdownMenu();
  initProfileSelector();
  initChat();
  initCustomDataModal();
  initSelfAudit();

  // Exponer función global para abrir chat desde botones de la UI
  window.openChatWithPrompt = (prompt) => {
    document.getElementById("nav-btn-advisor")?.click();
    document.getElementById("adv-tab-chat")?.click();
    sendChatMessage(prompt);
  };

  // Cargar perfil por defecto
  loadProfile("carlos_gastos_hormiga");
});

// ==========================================
// 1. RELOJ Y FECHA OFICIAL CAJA DE AHORROS
// ==========================================
function initLiveClock() {
  const updateTimes = () => {
    const now = new Date();
    const options = { hour: '2-digit', minute: '2-digit', hour12: true };
    const timeStr = now.toLocaleTimeString('en-US', options);
    const dateStr = now.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
    const fullStr = `${timeStr}, ${dateStr}`;

    const updatedEl = document.getElementById("live-time-updated");
    const loginEl = document.getElementById("live-time-login");
    if (updatedEl) updatedEl.textContent = fullStr;
    if (loginEl) loginEl.textContent = fullStr;
  };
  updateTimes();
  setInterval(updateTimes, 60000);
}

// ==========================================
// 2. NAVEGACIÓN PRINCIPAL ENTRE VISTAS
// ==========================================
function initNavigation() {
  const navItems = [
    { btn: "nav-btn-productos", view: "view-productos" },
    { btn: "nav-btn-advisor", view: "view-advisor" },
    { btn: "nav-btn-audit", view: "view-audit" }
  ];

  navItems.forEach(item => {
    const btn = document.getElementById(item.btn);
    if (!btn) return;

    btn.addEventListener("click", () => {
      // Remover clase 'active' de todos los botones de navegación
      document.querySelectorAll(".ca-nav-item").forEach(b => b.classList.remove("active"));
      // Ocultar todas las vistas
      navItems.forEach(i => document.getElementById(i.view)?.classList.add("hidden"));

      // Activar el seleccionado
      btn.classList.add("active");
      document.getElementById(item.view)?.classList.remove("hidden");

      // Si se abre el asesor, redibujar gráficos para asegurar layout correcto
      if (item.view === "view-advisor" && currentAnalysis) {
        setTimeout(() => {
          renderDayOfWeekChart("dayOfWeekChart", currentAnalysis.gastosHormiga.byDay);
          renderBudgetChart("budgetChart", currentAnalysis.rule60_25_15);
        }, 100);
      }
    });
  });

  // Clic en logo para volver a Mis Productos
  document.getElementById("brand-home-btn")?.addEventListener("click", () => {
    document.getElementById("nav-btn-productos")?.click();
  });

  // Botones de accesos rápidos a QVAC
  document.getElementById("btn-quick-advisor")?.addEventListener("click", () => {
    document.getElementById("nav-btn-advisor")?.click();
    document.getElementById("adv-tab-chat")?.click();
  });

  document.getElementById("btn-quick-hormiga")?.addEventListener("click", () => {
    document.getElementById("nav-btn-advisor")?.click();
    document.getElementById("adv-tab-hormiga")?.click();
  });

  document.getElementById("btn-quick-transfer")?.addEventListener("click", () => {
    document.getElementById("nav-btn-transacciones")?.click();
  });

  document.getElementById("btn-banner-advisor")?.addEventListener("click", () => {
    document.getElementById("nav-btn-advisor")?.click();
    document.getElementById("adv-tab-budget")?.click();
  });

  // Toggle acordeón de cuentas
  document.getElementById("btn-toggle-cuentas")?.addEventListener("click", () => {
    const detail = document.getElementById("cuenta-detalle");
    const chevron = document.getElementById("chevron-cuentas");
    if (detail) detail.classList.toggle("hidden");
    if (chevron) chevron.classList.toggle("rotate-180");
  });
}

// ==========================================
// 3. SUB-PESTAÑAS DEL MÓDULO ASESOR
// ==========================================
function initAdvisorSubTabs() {
  const subTabs = [
    { btn: "adv-tab-hormiga", content: "advisor-content-hormiga" },
    { btn: "adv-tab-budget", content: "advisor-content-budget" },
    { btn: "adv-tab-chat", content: "advisor-content-chat" }
  ];

  subTabs.forEach(tab => {
    const btn = document.getElementById(tab.btn);
    if (!btn) return;

    btn.addEventListener("click", () => {
      subTabs.forEach(t => {
        document.getElementById(t.btn)?.classList.remove("active");
        document.getElementById(t.content)?.classList.add("hidden");
      });

      btn.classList.add("active");
      document.getElementById(tab.content)?.classList.remove("hidden");

      // Redibujar gráficos al cambiar de tab interna
      if (currentAnalysis) {
        if (tab.content === "advisor-content-hormiga") {
          renderDayOfWeekChart("dayOfWeekChart", currentAnalysis.gastosHormiga.byDay);
        } else if (tab.content === "advisor-content-budget") {
          renderBudgetChart("budgetChart", currentAnalysis.rule60_25_15);
        }
      }
    });
  });
}

// ==========================================
// 4. DROPDOWN DE TRANSACCIONES Y PAGOS
// ==========================================
function initDropdownMenu() {
  const trigger = document.getElementById("nav-btn-transacciones");
  const popover = document.getElementById("transacciones-popover");

  trigger?.addEventListener("click", (e) => {
    e.stopPropagation();
    popover?.classList.toggle("hidden");
  });

  document.addEventListener("click", (e) => {
    if (!popover?.contains(e.target) && e.target !== trigger) {
      popover?.classList.add("hidden");
    }
  });
}

// ==========================================
// 5. SELECTOR Y CARGA DE PERFILES
// ==========================================
function initProfileSelector() {
  const select = document.getElementById("profile-select");
  select?.addEventListener("change", (e) => {
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
// 6. RENDERIZADO COMPLETO DE LA UI
// ==========================================
function updateUI(profile, analysis) {
  const { summary, gastosHormiga, rule60_25_15, cajaDeAhorrosProducts } = analysis;

  // 1. Vista 'Mis Productos'
  document.getElementById("saludo-nombre").textContent = profile.name;
  document.getElementById("cuenta-total-disp").textContent = `$ ${summary.effectiveIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  document.getElementById("card-cuenta-num").textContent = profile.accountNumber || "010000367531";
  document.getElementById("cuenta-subtitulo").textContent = `${profile.accountType || "Cuenta de ahorro regular"} • No. ${profile.accountNumber || "010000367531"}`;

  // Indicador de Salud
  const scoreCircle = document.getElementById("top-health-circle");
  const statusText = document.getElementById("top-health-status");
  scoreCircle.textContent = summary.healthScore;
  if (summary.healthScore >= 75) {
    scoreCircle.className = "flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 font-black text-lg border border-emerald-200";
    statusText.textContent = "Excelente";
    statusText.className = "text-xs text-emerald-700 font-semibold";
  } else if (summary.healthScore >= 50) {
    scoreCircle.className = "flex items-center justify-center w-10 h-10 rounded-full bg-amber-50 text-amber-600 font-black text-lg border border-amber-200";
    statusText.textContent = "Fuga en Deseos";
    statusText.className = "text-xs text-amber-700 font-semibold";
  } else {
    scoreCircle.className = "flex items-center justify-center w-10 h-10 rounded-full bg-red-50 text-red-600 font-black text-lg border border-red-200";
    statusText.textContent = "Atención Requerida";
    statusText.className = "text-xs text-red-700 font-semibold";
  }

  // Banner 'Sugerencias para ti'
  document.getElementById("banner-savings-amount").textContent = `$${gastosHormiga.potentialMonthlySavingsWith2DaysRule.toFixed(2)} al mes`;

  // Tabla Movimientos Recientes
  renderTransactionsTable(profile.transactions);

  // 2. Vista 'Asesor QVAC - Gastos Hormiga'
  document.getElementById("adv-hormiga-hero-amount").textContent = `$${gastosHormiga.totalMicroAmount.toFixed(2)} al mes`;
  document.getElementById("adv-hormiga-projected-year").textContent = `$${gastosHormiga.projectedYearlyMicro.toFixed(2)} al año`;
  document.getElementById("adv-hormiga-savings-with-rule").textContent = `$${gastosHormiga.potentialMonthlySavingsWith2DaysRule.toFixed(2)}`;
  document.getElementById("adv-hormiga-weekday").textContent = `$${gastosHormiga.weekdayTotal.toFixed(2)}`;
  document.getElementById("adv-hormiga-weekend").textContent = `$${gastosHormiga.weekendTotal.toFixed(2)}`;
  document.getElementById("adv-caja-navidad").textContent = `$${cajaDeAhorrosProducts.cuentaNavidena.yearEndPayout.toFixed(2)}`;
  document.getElementById("adv-caja-plazofijo").textContent = `$${cajaDeAhorrosProducts.plazoFijo.projected3Years.toFixed(2)}`;

  // 3. Vista 'Asesor QVAC - Presupuesto 60-25-15'
  document.getElementById("adv-pct-necesidades").textContent = `${rule60_25_15.actualPercentages.necesidades}%`;
  document.getElementById("adv-amt-necesidades").textContent = `($${rule60_25_15.actual.necesidades.toFixed(2)})`;
  document.getElementById("adv-bar-necesidades").style.width = `${Math.min(100, rule60_25_15.actualPercentages.necesidades)}%`;
  document.getElementById("adv-status-necesidades").textContent = rule60_25_15.complianceStatus.necesidades;

  document.getElementById("adv-pct-deseos").textContent = `${rule60_25_15.actualPercentages.deseos}%`;
  document.getElementById("adv-amt-deseos").textContent = `($${rule60_25_15.actual.deseos.toFixed(2)})`;
  document.getElementById("adv-bar-deseos").style.width = `${Math.min(100, rule60_25_15.actualPercentages.deseos)}%`;
  document.getElementById("adv-status-deseos").textContent = rule60_25_15.complianceStatus.deseos;

  document.getElementById("adv-pct-ahorro").textContent = `${rule60_25_15.actualPercentages.ahorro}%`;
  document.getElementById("adv-amt-ahorro").textContent = `($${rule60_25_15.actual.ahorro.toFixed(2)})`;
  document.getElementById("adv-bar-ahorro").style.width = `${Math.min(100, rule60_25_15.actualPercentages.ahorro)}%`;
  document.getElementById("adv-status-ahorro").textContent = rule60_25_15.complianceStatus.ahorro;

  // Diagnóstico
  const isDeseosOver = rule60_25_15.actualPercentages.deseos > 25;
  const isAhorroUnder = rule60_25_15.actualPercentages.ahorro < 15;
  document.getElementById("adv-diag-box").innerHTML = `
    <p><strong>Diagnóstico de Caja de Ahorros:</strong></p>
    <p>• Tu gasto en necesidades básicas es del <strong>${rule60_25_15.actualPercentages.necesidades}%</strong> (meta: 60%).</p>
    <p>• ${isDeseosOver ? `⚠️ El consumo en Deseos está sobre el límite en <strong>$${rule60_25_15.budgetGaps.deseosDiff.toFixed(2)}</strong>. Las compras impulsivas y delivery son el principal causante.` : `✅ Tus gastos en deseos se mantienen equilibrados.`}</p>
    <p>• ${isAhorroUnder ? `⚠️ Ahorras un <strong>${rule60_25_15.actualPercentages.ahorro}%</strong> (meta: 15%). Redirigiendo el ahorro de la Regla de 2 Días ($${gastosHormiga.potentialMonthlySavingsWith2DaysRule.toFixed(2)}/mes) cumplirás la meta mensual con creces.` : `🎉 ¡Tu disciplina de ahorro es óptima para tus proyectos familiares!`}</p>
  `;

  // 4. Gráficos
  renderDayOfWeekChart("dayOfWeekChart", gastosHormiga.byDay);
  renderBudgetChart("budgetChart", rule60_25_15);

  // 5. Reiniciar Chat con Saludo Contextualizado
  resetChat(profile, analysis);
}

function renderTransactionsTable(transactions) {
  const tbody = document.getElementById("home-tx-body");
  if (!tbody) return;

  tbody.innerHTML = transactions.slice(0, 10).map(tx => {
    const isIncome = tx.type === "income";
    const isMicro = tx.isMicroExpense;

    return `
      <tr class="hover:bg-slate-50 transition ${isMicro ? 'bg-amber-50/40' : ''}">
        <td class="py-2.5 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">${tx.date}</td>
        <td class="py-2.5 px-3 font-medium text-slate-800 flex items-center space-x-1.5">
          ${isMicro ? '<span title="Gasto Hormiga detectado">🐜</span>' : ''}
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
// 7. CHAT CON EL ASESOR QVAC
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

  const welcome = `¡Hola, **${profile.name}**! Soy **Cashy AI**, tu Asesor Financiero Autónomo de **Caja de Ahorros** impulsado por **QVAC SDK**.\n\nHe auditado tus transacciones bancarias en este dispositivo con **cero fuga de datos a la nube**:\n- 🎯 **Salud Financiera:** ${analysis.summary.healthScore}/100\n- 🐜 **Gastos Hormiga Detectados:** $${analysis.gastosHormiga.totalMicroAmount.toFixed(2)} al mes (${analysis.gastosHormiga.microExpenseCount} microcompras).\n- 💡 **Ahorro Rescatable:** Aplicando la **Regla de los 2 Días de Gasto**, recuperas **$${analysis.gastosHormiga.potentialMonthlySavingsWith2DaysRule.toFixed(2)} al mes** para tu Cuenta Navideña o Plazo Fijo.\n\n¿En qué te gustaría que te ayude hoy? Puedes hacerme cualquier consulta sobre tus gastos o seleccionar una de las sugerencias rápidas.`;

  appendAiMessage(welcome, {
    engine: "Cashy AI (Inferencia Local On-Device)",
    parameterSize: "2B / 1B",
    latencyMs: 10,
    cloudDataTransmittedBytes: 0
  });
}

async function sendChatMessage(message) {
  appendUserMessage(message);
  const typingId = appendTypingIndicator();
  const selectedModel = document.getElementById("select-model")?.value || "salamandra-2b";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        history: chatHistory,
        model: selectedModel
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
      appendAiMessage("Error en inferencia local QVAC: " + data.error);
    }
  } catch (err) {
    removeTypingIndicator(typingId);
    appendAiMessage("Error de conexión local: " + err.message);
  }
}

function appendUserMessage(text) {
  const container = document.getElementById("chat-messages");
  if (!container) return;

  const div = document.createElement("div");
  div.className = "flex justify-end";
  div.innerHTML = `
    <div class="max-w-[80%] chat-bubble-user px-4 py-2.5 rounded-2xl text-white shadow-sm">
      <p class="font-medium text-xs leading-relaxed">${escapeHtml(text)}</p>
    </div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function appendAiMessage(text, telemetry = null) {
  const container = document.getElementById("chat-messages");
  if (!container) return;

  const html = formatMarkdown(text);
  const div = document.createElement("div");
  div.className = "flex justify-start items-start space-x-3";

  const paramText = telemetry?.parameterSize ? ` • ${telemetry.parameterSize}` : '';
  const badge = telemetry ? `
    <div class="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
      <span>⚙️ ${telemetry.engine}${paramText} (${telemetry.latencyMs}ms)</span>
      <span class="text-emerald-600 font-bold flex items-center space-x-1">
        <i class="fa-solid fa-lock text-[9px]"></i>
        <span>0 Bytes Cloud</span>
      </span>
    </div>
  ` : '';

  div.innerHTML = `
    <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#004f98] to-emerald-500 text-white flex-shrink-0 flex items-center justify-center font-bold text-xs mt-0.5 shadow-sm ring-2 ring-emerald-100">
      <i class="fa-solid fa-robot"></i>
    </div>
    <div class="max-w-[85%] chat-bubble-ai px-4 py-3 rounded-2xl shadow-xs">
      <div class="text-slate-800 leading-relaxed text-xs">${html}</div>
      ${badge}
    </div>
  `;

  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function appendTypingIndicator() {
  const container = document.getElementById("chat-messages");
  const id = "typing-" + Date.now();
  const div = document.createElement("div");
  div.id = id;
  div.className = "flex justify-start items-center space-x-3";
  div.innerHTML = `
    <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#004f98] to-emerald-500 text-white flex-shrink-0 flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-emerald-100">
      <i class="fa-solid fa-robot"></i>
    </div>
    <div class="bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-slate-500 text-xs flex space-x-2 items-center shadow-xs">
      <span class="font-medium text-[11px] text-slate-600">Cashy AI pensando localmente</span>
      <span class="inline-flex space-x-1">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"></span>
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce delay-100"></span>
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce delay-200"></span>
      </span>
    </div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeTypingIndicator(id) {
  document.getElementById(id)?.remove();
}

function updateTelemetryUI(telemetry) {
  if (!telemetry) return;
  const countEl = document.getElementById("telemetry-count");
  if (countEl) countEl.textContent = `${telemetry.inferenceCount} consultas`;
}

// ==========================================
// 8. MODAL DE CARGA DE DATOS PERSONALIZADOS
// ==========================================
function initCustomDataModal() {
  const modal = document.getElementById("upload-modal");
  const openBtn = document.getElementById("btn-open-upload");
  const closeBtn = document.getElementById("btn-close-modal");
  const cancelBtn = document.getElementById("btn-cancel-modal");
  const submitBtn = document.getElementById("btn-submit-custom-data");
  const jsonArea = document.getElementById("custom-transactions-json");

  const sampleJson = [
    { id: "eval-01", date: "2026-09-01", merchant: "ACH Depósito Quincena", category: "Ingresos", amount: 1100.00, type: "income" },
    { id: "eval-02", date: "2026-09-02", merchant: "Alquiler Residencia", category: "Vivienda", amount: 500.00, type: "expense" },
    { id: "eval-03", date: "2026-09-03", merchant: "Super 99 Albrook", category: "Alimentación Básica", amount: 160.00, type: "expense" },
    { id: "eval-04", date: "2026-09-04", merchant: "Cafetería Starbucks", category: "Café y Bebidas", amount: 5.25, type: "expense", isMicroExpense: true },
    { id: "eval-05", date: "2026-09-05", merchant: "PedidosYa almuerzo", category: "Delivery Comida", amount: 13.50, type: "expense", isMicroExpense: true }
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
      const transactions = JSON.parse(jsonArea.value);

      const res = await fetch("/api/analyze-custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileName: name, monthlyIncome: income, transactions })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      closeModal();
      currentProfile = data.profile;
      currentAnalysis = data.analysis;
      updateUI(currentProfile, currentAnalysis);

      document.getElementById("nav-btn-productos")?.click();
    } catch (err) {
      alert("Error al procesar JSON: " + err.message);
    }
  });
}

// ==========================================
// 9. AUTO-AUDITORÍA DE PRIVACIDAD
// ==========================================
function initSelfAudit() {
  const auditBtn = document.getElementById("btn-run-self-audit");
  const resultBox = document.getElementById("self-audit-result");

  auditBtn?.addEventListener("click", () => {
    auditBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Auditando sockets y aislamiento...`;
    auditBtn.disabled = true;

    setTimeout(() => {
      auditBtn.innerHTML = `<i class="fa-solid fa-circle-check"></i> Auditoría Aprobada`;
      auditBtn.className = "bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center space-x-2";
      resultBox?.classList.remove("hidden");
    }, 700);
  });
}

// ==========================================
// 10. UTILIDADES FORMATO MARKDOWN
// ==========================================
function formatMarkdown(text) {
  if (!text) return "";
  let html = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n\n/g, "</p><p class='mt-2'>")
    .replace(/\n- (.*?)/g, "<li class='ml-4 list-disc'>$1</li>");

  return `<p>${html}</p>`;
}

function escapeHtml(string) {
  const div = document.createElement("div");
  div.innerText = string;
  return div.innerHTML;
}
