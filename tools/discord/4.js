const a = require("inquirer");
const b = require("axios");

const name = "🗑️ Delete Webhook";
const description = "Eliminar un webhook de Discord";

const c = (d) => new Promise((e) => setTimeout(e, d));

async function run() {
  const { f } = await a.prompt([
    { type: "input", name: "f", message: "🔗 URL del webhook a eliminar:" }
  ]);

  let g;
  try {
    const h = await b.get(f);
    g = h.data;
    console.log(`\n🧷 Webhook encontrado:`);
    console.log(`📛 Nombre: ${g.name}`);
    console.log(`📍 Canal ID: ${g.channel_id}`);
    console.log(`🆔 ID: ${g.id}`);
  } catch (i) {
    if (i.response?.status === 404) {
      console.log("❌ Webhook no existe o ya fue eliminado.");
      return;
    } else if (i.response?.status === 401) {
      console.log("❌ Webhook inválido o sin acceso.");
      return;
    } else {
      console.log("❌ Error al verificar:", i.message || i.response?.data);
      return;
    }
  }

  const { j } = await a.prompt([
    { type: "confirm", name: "j", message: "❓ ¿Eliminar este webhook?", default: false }
  ]);

  if (!j) return console.log("❌ Cancelado.");

  try {
    await b.delete(f);
    console.log("✅ Webhook eliminado correctamente.");
  } catch (k) {
    const l = k.response?.data?.retry_after || 0;

    if (k.response?.status === 429 && l <= 30000) {
      console.log(`⏳ Ratelimit. Esperando ${l} ms...`);
      await c(l);
      try {
        await b.delete(f);
        console.log("✅ Webhook eliminado después del ratelimit.");
      } catch {
        console.log("❌ Falló incluso después de esperar.");
      }
    } else if (l > 30000) {
      console.log("🛑 Ratelimit demasiado largo. Abortando.");
    } else {
      console.log("❌ Error al eliminar:", k.message || k.response?.data);
    }
  }
}

module.exports = { name, description, run };
