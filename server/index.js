/**
 * index.js
 * Servidor local de banca en línea de Cashy AI impulsado por QVAC SDK.
 * Proporciona los servicios locales de análisis financiero, inferencia on-device y telemetría de auditoría.
 */

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { PROFILES, getAvailableProfiles, getProfileData } from "./synthetic-data.js";
import { analyzeFinancialHealth } from "./financial-analyzer.js";
import { qvacAgent } from "./qvac-agent.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.static(path.join(__dirname, "../public")));

// Cache en memoria local de la sesión activa
let currentProfileId = "carlos_gastos_hormiga";
let currentTransactions = PROFILES[currentProfileId].transactions;
let currentMonthlyIncome = PROFILES[currentProfileId].monthlyIncome;

// ==========================================
// RUTAS DE LA API BANCARIA LOCAL
// ==========================================

/**
 * GET /api/profiles
 * Lista los perfiles sintéticos disponibles para evaluación.
 */
app.get("/api/profiles", (req, res) => {
  res.json({
    success: true,
    profiles: getAvailableProfiles()
  });
});

/**
 * GET /api/profile/:id
 * Carga un perfil específico y ejecuta el diagnóstico financiero on-device.
 */
app.get("/api/profile/:id", (req, res) => {
  const profileId = req.params.id;
  const profile = getProfileData(profileId);
  currentProfileId = profile.id;
  currentTransactions = profile.transactions;
  currentMonthlyIncome = profile.monthlyIncome;

  const analysis = analyzeFinancialHealth(currentTransactions, currentMonthlyIncome);

  res.json({
    success: true,
    profile: {
      id: profile.id,
      name: profile.name,
      description: profile.description,
      avatar: profile.avatar,
      accountNumber: profile.accountNumber,
      accountType: profile.accountType,
      monthlyIncome: profile.monthlyIncome,
      targetGoal: profile.targetGoal,
      transactions: currentTransactions
    },
    analysis
  });
});

/**
 * POST /api/analyze-custom
 * Permite al usuario o jurado subir transacciones personalizadas (CSV o JSON).
 */
app.post("/api/analyze-custom", (req, res) => {
  const { transactions, monthlyIncome, profileName } = req.body;

  if (!Array.isArray(transactions) || transactions.length === 0) {
    return res.status(400).json({ success: false, error: "Formato de transacciones inválido o lista vacía." });
  }

  const analysis = analyzeFinancialHealth(transactions, Number(monthlyIncome) || null);
  currentTransactions = analysis.normalizedTransactions;
  currentMonthlyIncome = Number(monthlyIncome) || analysis.summary.effectiveIncome;

  res.json({
    success: true,
    profile: {
      id: "custom_uploaded",
      name: profileName || "Perfil Personalizado (Auditoría)",
      accountNumber: "CA-LOCAL-AUDIT-01",
      accountType: "Cuenta Local de Pruebas",
      monthlyIncome: currentMonthlyIncome,
      transactions: currentTransactions
    },
    analysis
  });
});

/**
 * POST /api/chat
 * Consulta al Asesor Financiero QVAC ejecutado 100% de forma local.
 */
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, model } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, error: "El mensaje no puede estar vacío." });
    }

    const currentProfile = PROFILES[currentProfileId] || { name: "Cliente Caja de Ahorros" };
    const analysis = analyzeFinancialHealth(currentTransactions, currentMonthlyIncome);

    const result = await qvacAgent.askAdvisor(
      message,
      analysis,
      currentProfile.name,
      history || [],
      model || null
    );

    res.json({
      success: true,
      reply: result.reply,
      telemetry: result.telemetry
    });
  } catch (err) {
    console.error("[API Chat Error]:", err);
    res.status(500).json({
      success: false,
      error: "Error en el procesamiento local del agente QVAC.",
      details: err.message
    });
  }
});

/**
 * POST /api/diagnostico-ia
 * Genera un dictamen cualitativo y empático con el LLM QVAC en tiempo real.
 */
app.post("/api/diagnostico-ia", async (req, res) => {
  try {
    const { model } = req.body || {};
    const currentProfile = PROFILES[currentProfileId] || { name: "Cliente Caja de Ahorros" };
    const analysis = analyzeFinancialHealth(currentTransactions, currentMonthlyIncome);

    const result = await qvacAgent.generateDiagnosticSummary(analysis, currentProfile.name, model);
    res.json({
      success: true,
      diagnostic: result.reply,
      telemetry: result.telemetry
    });
  } catch (err) {
    console.error("[API Diagnostico Error]:", err);
    res.status(500).json({
      success: false,
      error: "Error al generar dictamen con el modelo local QVAC.",
      details: err.message
    });
  }
});

/**
 * GET /api/models
 * Retorna los modelos disponibles en el runtime local QVAC.
 */
app.get("/api/models", (req, res) => {
  res.json({
    success: true,
    activeModel: qvacAgent.modelName,
    availableModels: [
      { id: "salamandra-2b", name: "Salamandra 2B (Nativo en Español)", params: "2B", recommended: true },
      { id: "bitnet-3b", name: "BitNet 3B (Alta Capacidad)", params: "3B", recommended: false },
      { id: "llama-3.2-1b", name: "Llama 3.2 1B (Ultraligero Móvil)", params: "1B", recommended: false }
    ]
  });
});

/**
 * GET /api/telemetry
 * Retorna telemetría de soberanía de datos y estado del SDK QVAC para el jurado.
 */
app.get("/api/telemetry", (req, res) => {
  res.json({
    success: true,
    telemetry: qvacAgent.getTelemetryStatus()
  });
});

/**
 * POST /api/qvac/load-model
 * Dispara la carga o verificación del modelo en QVAC.
 */
app.post("/api/qvac/load-model", async (req, res) => {
  try {
    const status = await qvacAgent.initializeModel();
    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Iniciar servidor local
app.listen(PORT, async () => {
  console.log(`\n======================================================`);
  console.log(`🏦 Cashy AI - Banca en Línea & Asesor Inteligente QVAC`);
  console.log(`🔒 Inferencia 100% On-Device | Zero Data Leakage`);
  console.log(`🌐 Servidor iniciado en: http://localhost:${PORT}`);
  console.log(`======================================================\n`);

  // Intento de precarga en segundo plano de QVAC
  try {
    qvacAgent.initializeModel().catch(e => console.log("[QVAC Async Init Notice]:", e.message));
  } catch (e) {
    // Ignorado, el fallback semántico garantiza disponibilidad total
  }
});
