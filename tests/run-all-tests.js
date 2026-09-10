/**
 * run-all-tests.js
 * Runner unificado para npm test.
 */

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    const p = spawn("node", [scriptPath], { stdio: "inherit" });
    p.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Test falló con código ${code}`));
    });
  });
}

async function main() {
  console.log("🚀 INICIANDO SUITE DE EVALUACIÓN PARA EL JURADO...");
  await runScript(path.join(__dirname, "audit-privacy.test.js"));
  await runScript(path.join(__dirname, "financial-rules.test.js"));
  console.log("✨ EVALUACIÓN COMPLETADA SATISFACTORIAMENTE ✨\n");
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
