# 🏦 Cashy AI: Inteligencia Financiera Local y Descentralizada para Caja de Ahorros

[![QVAC SDK](https://img.shields.io/badge/Powered%20by-QVAC%20SDK-00A86B?style=for-the-badge)](https://qvac.tether.io)
[![Inferencia](https://img.shields.io/badge/Inferencia-100%25%20On--Device-0A2540?style=for-the-badge)](#)
[![Zero Cloud Leakage](https://img.shields.io/badge/Zero%20Data%20Leakage-0%20Bytes%20Cloud-10B981?style=for-the-badge)](#)
[![Licencia](https://img.shields.io/badge/Licencia-MIT-blue?style=for-the-badge)](LICENSE)

> **Solución presentada para el Reto Corporativo de Caja de Ahorros**  
> *"Desafío Caja de Ahorros: Inteligencia local para la banca"* (ISD Hackathon)  
> **Premio:** 1,500 USDT | **Evaluador:** Jurado de Caja de Ahorros & ISD  

---

## 📌 1. Declaración Obligatoria de Bases Preexistentes
*Conforme a los términos y condiciones del reto ("Toda base preexistente debe declararse en el README. Omitirla descalifica"), se declaran las siguientes herramientas y bibliotecas de código abierto utilizadas en este proyecto:*

1. **`@qvac/sdk` (v0.19.0)**: SDK de código abierto desarrollado por Tether (`qvac.tether.io`) para la ejecución e inferencia de modelos de inteligencia artificial de forma local y descentralizada en el dispositivo.
2. **`express` (v4.21.2)** & **`cors` (v2.8.5)**: Servidor web HTTP y middleware en Node.js para exponer la interfaz web y la API local en localhost.
3. **`Chart.js` (v4.4.1)**: Biblioteca de visualización interactiva de gráficos en JavaScript para renderizar el desglose de gastos y presupuestos.
4. **`Tailwind CSS` (v3.x CDN)** & **`FontAwesome` (v6.5.1 CDN)**: Framework de estilos y conjunto de iconos para la interfaz de usuario con la identidad visual corporativa de Caja de Ahorros.

*Toda la lógica de análisis financiero (detección de gastos hormiga, regla conductual de 2 días de gasto, motor de presupuesto 60-25-15, prompts bancarios de Caja de Ahorros y datasets sintéticos panameños) ha sido creada desde cero para este desafío.*

---

## 🎯 2. El Problema que Resolvemos para Caja de Ahorros

**Caja de Ahorros**, *"El Banco de la Familia Panameña"*, tiene como misión histórica promover la inclusión y el hábito del ahorro. Sin embargo, la banca en línea tradicional enfrenta dos barreras críticas:

1. **Riesgo de Privacidad y Secreto Bancario con la IA en la Nube:**  
   Enviar transacciones detalladas (supermercados, farmacias, salidas, salarios) a APIs de nube de terceros (OpenAI, Google, Anthropic) viola la privacidad de los clientes, las regulaciones de la Superintendencia de Bancos de Panamá y el secreto bancario.
2. **La Fuga Invisible de los "Gastos Hormiga":**  
   Los clientes pierden entre el **10% y el 15% de sus ingresos** en compras impulsivas de menos de $15 (cafés diarios, servicios de delivery repetitivos, compras en kioscos), impidiéndoles ahorrar para metas mayores (vivienda propia, fondo de emergencia o navidad).
3. **Falta de Presupuestación Práctica (Regla 60-25-15):**  
   Los usuarios no saben cómo equilibrar sus ingresos quincenales entre Necesidades (60%), Deseos (25%) y Ahorro (15%).

---

## 💡 3. La Solución: Cashy AI con QVAC SDK

**Cashy AI** es un asesor financiero personal autónomo integrado en la banca en línea que **corre 100% en el dispositivo del cliente** mediante el **SDK de QVAC** (`@qvac/sdk`).

```
┌──────────────────────────────────────────────────────────────────────────┐
│                   DISPOSITIVO DEL CLIENTE (100% PRIVADO)                 │
│                                                                          │
│   ┌─────────────────────┐     Transacciones      ┌───────────────────┐   │
│   │  Banca en Línea     │ ─────────────────────> │ Motor Analítico   │   │
│   │  (Caja de Ahorros)  │                        │ (Gastos Hormiga & │   │
│   │                     │ <───────────────────── │  Regla 60-25-15)  │   │
│   └──────────┬──────────┘      Diagnóstico       └─────────┬─────────┘   │
│              │                                             │             │
│              │ Pregunta/Chat                    Contexto   │             │
│              ▼                                  Financiero ▼             │
│   ┌──────────────────────────────────────────────────────────────────┐   │
│   │                     QVAC SDK (@qvac/sdk)                         │   │
│   │           Inferencia Local (Llama-3.2-1B / Qwen)                 │   │
│   │        [0 BYTES TRANSMITIDOS A LA NUBE • ZERO LEAKAGE]           │   │
│   └──────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ✕ (CONEXIÓN BLOQUEADA / INEXISTENTE)
                                     ▼
                   ┌───────────────────────────────────┐
                   │    Nube Externa / APIs de IA      │
                   │    (OpenAI, Anthropic, Gemini)    │
                   └───────────────────────────────────┘
```

### Funcionalidades Clave:
* **🔍 Detector Inteligente de Gastos Hormiga:** Agrupa y audita compras menores a $15, proyecta la fuga anual y calcula el impacto en el patrimonio familiar.
* **💡 Regla Conductual de los 2 Días de Gasto:** Recomienda concentrar los antojos y gastos de ocio únicamente en 2 días a la semana (ej. viernes y sábado), eliminando las fugas de lunes a jueves y ahorrando hasta un 65% de estos microgastos.
* **⚖️ Optimizador de Presupuesto 60-25-15:** Evalúa en tiempo real si el cliente cumple la distribución sana (60% Necesidades Básicas, 25% Deseos y Estilo de Vida, 15% Ahorro e Inversión).
* **🏦 Sinergia con Productos de Caja de Ahorros:** Convierte el ahorro rescatado en metas tangibles en productos reales del banco:
  * **Cuenta de Ahorro Navideño:** Proyección del aguinaldo acumulado a fin de año.
  * **Depósito a Plazo Fijo:** Rendimiento proyectado a 3 años con interés compuesto.
  * **Abono Inicial Hipotecario:** Estimación del tiempo para alcanzar la cuota inicial de una primera vivienda con Caja de Ahorros.
* **🤖 Asesor Conversacional On-Device:** Diálogo fluido e interactivo en lenguaje natural que razona sobre el historial del cliente sin que ningún dato salga a internet.
* **🛡️ Monitor de Auditoría y Soberanía:** Panel en tiempo real para el jurado con telemetría que comprueba que 0 bytes han sido enviados a la nube.

---

## ⚡ 4. Arquitectura Multi-Modelo y Rendimiento (Edge AI 1B, 2B y 3B)
Una de las mayores preocupaciones al ejecutar IA local en dispositivos bancarios es el equilibrio entre **calidad de razonamiento** y **consumo de hardware**. **Cashy AI** resuelve esto integrando soporte dinámico para modelos de 1B, 2B y 3B parámetros a través de QVAC:

1. **🧠 Salamandra 2B (2 Billones de Parámetros - Modelo Principal):**
   * Desarrollado específicamente con enfoque nativo en español por el Barcelona Supercomputing Center (BSC).
   * **Ventaja crítica:** Supera las limitaciones léxicas de los modelos anglosajones pequeños (evitando alucinaciones de traducción como confundir *"aumento"* con *"ahorro"*).
   * Mayor capacidad de razonamiento para explicar diversas metodologías presupuestarias (Regla 60-25-15, 50-30-20, Kakebo, sobres) y productos de Caja de Ahorros.
   * Tamaño optimizado en memoria: ~1.4 GB RAM mediante cuantización 4-bit (`Q4`).
2. **🚀 BitNet 3B (3 Billones de Parámetros):**
   * Configurado para terminales de sucursal o dispositivos de gama alta que buscan la máxima profundidad analítica on-device.
3. **⚡ Llama 3.2 1B (1 Billón de Parámetros - Modo Ultraligero / Respaldo):**
   * Modelo ultra-compacto (<750 MB RAM) diseñado por Meta para smartphones de gama de entrada o modo offline de ultra-bajo consumo de batería.
4. **Delegación Peer-to-Peer (Tethering):**
   * Aprovechando la cláusula *"delegada entre pares"* del reto, si un teléfono carece de recursos, QVAC delega el cómputo de la inferencia a un nodo cercano (como un kiosco de sucursal de Caja de Ahorros) en la misma red local. Los datos jamás van a la nube.
5. **Ejecución On-Demand:**
   * La IA no corre en segundo plano; solo utiliza ciclos de GPU/NPU cuando el usuario interactúa activamente en el chat, preservando la batería.

---

## 🇵🇦 5. Datos Sintéticos Panameños
*Cumpliendo la regla del reto sobre no utilizar datos reales de clientes de ninguna entidad:*
El proyecto incluye un generador y perfiles sintéticos realistas con comercios y transacciones típicas de Panamá:
* **Supermercados:** Super 99, Riba Smith, El Machetazo.
* **Servicios Públicos:** Naturgy (Luz), IDAAN (Agua), Tigo Panamá (Internet/Móvil), Ensa.
* **Transporte:** Metro de Panamá, MetroBus, Panapass (Corredores), Estaciones Terpel.
* **Gastos Hormiga Habituales:** Cafetería Unido, Kotowa Coffee, PedidosYa, Dulcería Momi, máquinas expendedoras.
* **Perfiles Pre-configurados:**
  1. *Carlos Méndez (Joven Profesional):* Fuga de más de $210/mes en café diario y delivery; ahorra apenas 2%.
  2. *Familia Gómez (Meta Primera Vivienda):* Buscan reunir el abono inicial para su hipoteca en Caja de Ahorros.
  3. *Valeria Ríos (Optimizando 60-25-15):* Rebalanceando su presupuesto mensual.
  4. *Carga Personalizada:* El jurado puede subir cualquier archivo JSON con sus propios casos de prueba.

---

## 🚀 6. Guía de Instalación y Ejecución "De 1 Clic" para el Jurado

Hemos facilitado el despliegue para que el jurado de Caja de Ahorros no necesite ejecutar configuraciones complejas.

### Requisitos Previos:
* Node.js v18 o superior.
* Git.

### Paso 1: Clonar e Instalar Dependencias
```bash
git clone https://github.com/tu-usuario/cashy.git
cd cashy
npm install
```

### Paso 2: Iniciar Servidor (1 Clic)
En Windows, simplemente haz doble clic en el archivo **`start.bat`**. 
Este script levantará simultáneamente:
1. El servidor local de inteligencia artificial QVAC (Cargando el modelo Llama 3.2 1B de forma privada en el puerto 11434).
2. El servidor web de la aplicación (Banca en Línea en el puerto 3000).

Abre tu navegador en: **`http://localhost:3000`**

---

## 🧪 7. Suite de Auditoría Automatizada para el Jurado

Para verificar de forma programática el cumplimiento técnico del reto, ejecuta:

```bash
npm test
```

Este comando ejecuta dos suites de auditoría:
1. **`npm run test:audit` (Auditoría de Privacidad y Aislamiento de Red):**
   * Escanea recursivamente todo el código fuente garantizando que **no existe ningún endpoint a APIs externas de IA** (OpenAI, Gemini, Anthropic, etc.).
   * Confirma la integración de `@qvac/sdk`.
   * Verifica la telemetría de `0 Bytes Cloud`.
2. **`npm run test:financial` (Validación Matemática de Reglas Financieras):**
   * Comprueba que los algoritmos de detección de gastos hormiga detectan con exactitud compras < $15.
   * Valida la fórmula de la Regla 60-25-15 y los cálculos de las cuentas de Caja de Ahorros.

---

## 🎬 8. Video Demostrativo (Máximo 5 Minutos)
El guion detallado y la estructura para el video de presentación del jurado se encuentra disponible en:  
👉 **[PITCH_AND_DEMO_SCRIPT.md](PITCH_AND_DEMO_SCRIPT.md)**

---

## ⚖️ 9. Licencia
Este proyecto está bajo la licencia [MIT](LICENSE).
Propiedad intelectual y desarrollo original por el equipo participante del Reto Caja de Ahorros 2026.
