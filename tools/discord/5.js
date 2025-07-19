const h = require("axios");
const f = require("fs");
const p = require("path");
const c = require("chalk");
const { default: x } = h;

const name = "😂 Emoji";
const description = "Descarga todos los emojis del servidor";

const run = async () => {
  const r = require("inquirer");
  const { t } = await r.prompt([{ type: "input", name: "t", message: "🔑 Token:" }]);
  const { s } = await r.prompt([{ type: "input", name: "s", message: "🧭 Server ID:" }]);

  const u = `https://discord.com/api/v10/guilds/${s}/emojis`;

  try {
    const z = await x.get(u, {
      headers: { Authorization: t },
      validateStatus: () => true,
    });

    if (z.status === 429) {
      const r = z.data["retry_after"];
      console.log(c.red(`⛔ Ratelimit. Espera sugerida: ${r}s`));
      if (r > 50) {
        console.log(c.red("🛑 Ratelimit mayor a 50s. Abortando."));
        return;
      } else {
        console.log(c.yellow("⏳ Esperando antes de continuar..."));
        await new Promise(v => setTimeout(v, r * 1000));
      }
    }

    if (!Array.isArray(z.data)) {
      console.log(c.red("❌ Error. Token inválido o sin permisos."));
      return;
    }

    const d = p.join(__dirname, "..", "..", "emojis");
    if (!f.existsSync(d)) f.mkdirSync(d, { recursive: true });

    for (const i of z.data) {
      const l = `https://cdn.discordapp.com/emojis/${i.id}.${i.animated ? "gif" : "png"}`;
      try {
        const m = await x.get(l, { responseType: "arraybuffer" });
        const w = p.join(d, `${i.name}_${i.id}.${i.animated ? "gif" : "png"}`);
        f.writeFileSync(w, m.data);
        console.log(c.green("✅ Guardado:"), i.name);
      } catch {
        console.log(c.red("❌ Falló al descargar:"), i.name);
      }
    }

    console.log(c.cyan("\n🏁 Terminado. Emojis guardados en /emojis\n"));
  } catch (err) {
    console.log(c.red("❌ Error inesperado."), err?.message || "");
  }
};

module.exports = { name, description, run };
