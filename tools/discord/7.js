const h = require("axios");
const r = require("inquirer");
const c = require("chalk");

const name = "👞 Kick All";
const description = "Expulsa a todos los usuarios del servidor";

const run = async () => {
  const { t } = await r.prompt([{ type: "input", name: "t", message: "🔑 Token con permisos:" }]);
  const { s } = await r.prompt([{ type: "input", name: "s", message: "🧭 Server ID:" }]);

  const { ok } = await r.prompt([
    {
      type: "confirm",
      name: "ok",
      message: c.red.bold("⚠️ ¿Seguro que quieres expulsar a TODOS?"),
    },
  ]);
  if (!ok) return console.log(c.yellow("⏹️ Cancelado."));

  const x = h.default;

  try {
    const m = await x.get(`https://discord.com/api/v10/guilds/${s}/members?limit=1000`, {
      headers: { Authorization: t },
      validateStatus: () => true,
    });

    if (m.status === 429) {
      const d = m.data?.retry_after || 0;
      console.log(c.red(`⛔ Ratelimit. Espera sugerida: ${d}s`));
      if (d > 50) return console.log(c.red("🛑 Ratelimit excesivo. Abortando."));
      console.log(c.yellow("⏳ Esperando..."));
      await new Promise(v => setTimeout(v, d * 1000));
    }

    if (!Array.isArray(m.data)) {
      return console.log(c.red("❌ Token inválido, sin permisos o Server ID incorrecto."));
    }

    for (const u of m.data) {
      try {
        const k = await x.delete(
          `https://discord.com/api/v10/guilds/${s}/members/${u.user.id}`,
          {
            headers: { Authorization: t },
            validateStatus: () => true,
          }
        );

        if (k.status === 429) {
          const r = k.data?.retry_after || 0;
          console.log(c.red(`⏳ Ratelimit (${r}s)`));
          if (r > 50) {
            console.log(c.red("🛑 Espera excedida. Abortando."));
            break;
          }
          await new Promise(v => setTimeout(v, r * 1000));
          continue;
        }

        if (k.status >= 200 && k.status < 300) {
          console.log(c.green("✅ Expulsado:"), u.user.username);
        } else {
          console.log(c.red("❌ Falló:"), u.user.username, c.gray(`(${k.status})`));
        }
      } catch {
        console.log(c.red("❌ Error de red al expulsar:"), u.user.username);
      }
    }

    console.log(c.cyan("\n🏁 Terminado. Todos los expulsables fueron procesados.\n"));
  } catch (err) {
    console.log(c.red("❌ Error global."), err?.message || "");
  }
};

module.exports = { name, description, run };
