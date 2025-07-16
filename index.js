const r = require("inquirer");
const d = require("dotenv");
const c = require("chalk");
const { g } = require("./handlers/x");

d.config();
console.clear();

console.log(
  c.magenta(`

▓█████▄  ██▓  ██████  ▄████▄   ▒█████   ██▀███  ▓█████▄    ▄▄▄█████▓ ▒█████   ▒█████   ██▓      ██████ 
▒██▀ ██▌▓██▒▒██    ▒ ▒██▀ ▀█  ▒██▒  ██▒▓██ ▒ ██▒▒██▀ ██▌   ▓  ██▒ ▓▒▒██▒  ██▒▒██▒  ██▒▓██▒    ▒██    ▒ 
░██   █▌▒██▒░ ▓██▄   ▒▓█    ▄ ▒██░  ██▒▓██ ░▄█ ▒░██   █▌   ▒ ▓██░ ▒░▒██░  ██▒▒██░  ██▒▒██░    ░ ▓██▄   
░▓█▄   ▌░██░  ▒   ██▒▒▓▓▄ ▄██▒▒██   ██░▒██▀▀█▄  ░▓█▄   ▌   ░ ▓██▓ ░ ▒██   ██░▒██   ██░▒██░      ▒   ██▒
░▒████▓ ░██░▒██████▒▒▒ ▓███▀ ░░ ████▓▒░░██▓ ▒██▒░▒████▓      ▒██▒ ░ ░ ████▓▒░░ ████▓▒░░██████▒▒██████▒▒
 ▒▒▓  ▒ ░▓  ▒ ▒▓▒ ▒ ░░ ░▒ ▒  ░░ ▒░▒░▒░ ░ ▒▓ ░▒▓░ ▒▒▓  ▒      ▒ ░░   ░ ▒░▒░▒░ ░ ▒░▒░▒░ ░ ▒░▓  ░▒ ▒▓▒ ▒ ░
 ░ ▒  ▒  ▒ ░░ ░▒  ░ ░  ░  ▒     ░ ▒ ▒░   ░▒ ░ ▒░ ░ ▒  ▒        ░      ░ ▒ ▒░   ░ ▒ ▒░ ░ ░ ▒  ░░ ░▒  ░ ░
 ░ ░  ░  ▒ ░░  ░  ░  ░        ░ ░ ░ ▒    ░░   ░  ░ ░  ░      ░      ░ ░ ░ ▒  ░ ░ ░ ▒    ░ ░   ░  ░  ░  
   ░     ░        ░  ░ ░          ░ ░     ░        ░                    ░ ░      ░ ░      ░  ░      ░  
 ░                   ░                           ░                                                     
`)
);

console.log(c.blueBright.bold("┌─────────────────────────────────────────────┐"));
console.log(c.gray("  🧠  Powered by WAND | 🔐  Made by Dars"));
console.log(c.blueBright.bold("└─────────────────────────────────────────────┘"));
console.log();

(async () => {
  const a = await g();
  if (!a.length) return console.log(c.red("❌ Nada disponible."));

  const q = a.reduce((acc, cur) => {
    if (!acc[cur.f]) acc[cur.f] = [];
    acc[cur.f].push(cur);
    return acc;
  }, {});

  while (true) {
    const { cat } = await r.prompt([
      {
        type: "list",
        name: "cat",
        message: c.cyan.bold("📁 Elige una categoría:"),
        choices: [
          ...Object.keys(q).map(k => ({ name: `📂 ${k}`, value: k })),
          new r.Separator(),
          { name: c.red("❌ Exit"), value: null },
        ],
      },
    ]);

    if (!cat) {
      console.log(c.red("\n👋 Saliendo..."));
      process.exit(0);
    }

    const z = q[cat];

    const { t } = await r.prompt([
      {
        type: "list",
        name: "t",
        message: c.cyan.bold(`🧩 Tools en ${cat}:`),
        choices: [
          ...z.map(o => ({
            name: c.white(o.n) + " " + c.gray("–") + " " + c.gray(o.d),
            value: o,
          })),
          new r.Separator(),
          { name: c.red("⬅️ Volver a categorías"), value: null },
        ],
        pageSize: 15,
      },
    ]);

    if (!t) continue;

    console.log();
    try {
      await t.e();
    } catch (e) {
      console.log(c.red("❌ Error al ejecutar la tool."));
    }

    console.log(c.gray("\n↩️ Volviendo al menú de categorías...\n"));
  }
})();
