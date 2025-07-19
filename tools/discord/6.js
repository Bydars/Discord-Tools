const h = require("axios");
const c = require("chalk");
const r = require("inquirer");

const name = "🚫 Ban All";
const description = "Banea a todos los usuarios del servidor";

const run = async () => {
  const { t } = await r.prompt([{ type: "input", name: "t", message: "🔑 Token con permisos:" }]);
  const { s } = await r.prompt([{ type: "input", name: "s", message: "🧭 Server ID:" }]);

  const { ok } = await r.prompt([
    {
      type: "confirm",
      name: "ok",
      message: c.red.bold("⚠️ ¿Estás seguro que deseas banear a TODOS?"),
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
      const a = m.data?.retry_after || 0;
      console.log(c.red(`⛔ Ratelimit. Espera sugerida: ${a}s`));
      if (a > 50) return console.log(c.red("🛑 Demasiado alto. Cancelando."));
      console.log(c.yellow("⏳ Esperando antes de continuar..."));
      await new Promise(v => setTimeout(v, a * 1000));
    }

    if (!Array.isArray(m.data)) {
      return console.log(c.red("❌ Token inválido, sin permisos, o server ID incorrecto."));
    }

    for (const u of m.data) {
      try {
        const b = await x.put(
          `https://discord.com/api/v10/guilds/${s}/bans/${u.user.id}`,
          {},
          {
            headers: { Authorization: t },
            validateStatus: () => true,
          }
        );

        if (b.status === 429) {
          const r = b.data?.retry_after || 0;
          console.log(c.red(`⏳ Ratelimit (${r}s).`));
          if (r > 50) {
            console.log(c.red("🛑 Espera excedida. Abortando."));
            break;
          }
          await new Promise(v => setTimeout(v, r * 1000));
          continue;
        }

        if (b.status >= 200 && b.status < 300) {
          console.log(c.green("✅ Baneado:"), u.user.username);
        } else {
          console.log(c.red("❌ Falló:"), u.user.username, c.gray(`(${b.status})`));
        }
      } catch {
        console.log(c.red("❌ Error de red al intentar banear:"), u.user.username);
      }
    }

    console.log(c.cyan("\n🏁 Terminado. Todos los baneos posibles fueron procesados.\n"));
  } catch (err) {
    console.log(c.red("❌ Error global."), err?.message || "");
  }
};

module.exports = { name, description, run };
