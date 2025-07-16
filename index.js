const r = require("inquirer");
const d = require("dotenv");
const c = require("chalk");
const { g } = require("./handlers/x");

d.config();

console.clear();


console.log(c.magenta(`

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
`));


console.log(
  c.blueBright.bold("┌──────────────────────────────────────────┐")
);
console.log();
console.log(c.gray("      🧠 Powered by WAND"));
console.log(c.gray("      🔒 Made by Dars"));
console.log();
console.log(
  c.blueBright.bold("└──────────────────────────────────────────┘")
);
(async () => {
  const t = await g();
  if (!t.length) return console.log(c.red("❌ No hay tools disponibles."));

  const { x } = await r.prompt([
    {
      type: "list",
      name: "x",
      message: c.bold.cyan("👉 Elige una herramienta:"),
      choices: t.map(e => `${e.n} - ${e.d}`),
      pageSize: 15
    },
  ]);

  const y = t.find(e => `${e.n} - ${e.d}` === x);
  if (!y) return console.log(c.red("❌ Nada seleccionado."));
  console.log();
  await y.e();
})();
