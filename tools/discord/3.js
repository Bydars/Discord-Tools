const a = require("inquirer");
const b = require("axios");

const name = "📡 3";
const description = "Spammer para webhooks (texto o embed)";

const c = (d) => new Promise((e) => setTimeout(e, d));

async function run() {
  const { f, g, h, i } = await a.prompt([
    { type: "input", name: "f", message: "🔗 URL del webhook:" },
    { type: "list", name: "g", message: "📦 Tipo:", choices: ["Texto", "Embed"] },
    { type: "input", name: "h", message: "✍️ Contenido del mensaje:" },
    { type: "number", name: "i", message: "🔁 Cantidad de mensajes:" }
  ]);

  console.log(`🚀 Enviando ${i} mensajes...\n`);

  for (let j = 0; j < i; j++) {
    const k =
      g === "Texto"
        ? { content: h }
        : {
            embeds: [
              {
                title: "🚨 Mensaje Automático",
                description: h,
                color: Math.floor(Math.random() * 0xffffff)
              }
            ]
          };

    let l = false;
    while (!l) {
      try {
        await b.post(f, k);
        console.log(`✔️ (${j + 1}/${i}) enviado`);
        l = true;
      } catch (m) {
        const n = m.response?.data?.retry_after || 0;

        if (m.response?.status === 429) {
          if (n > 30000) {
            console.log(`🛑 Ratelimit de ${n} ms demasiado largo. Deteniendo...`);
            return;
          }
          console.log(`⏳ Ratelimit. Esperando ${n} ms...`);
          await c(n);
        } else {
          console.log(`❌ (${j + 1}/${i}) falló`);
          l = true;
        }
      }
    }
  }

  console.log("\n✅ Finalizado.");
}

module.exports = { name, description, run };
