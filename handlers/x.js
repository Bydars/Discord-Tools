const fs = require("fs");
const path = require("path");

const p = path.join(__dirname, "..", "tools");

async function g() {
  const a = fs.readdirSync(p).filter(f => f.endsWith(".js"));
  const b = a.map(f => {
    const z = require(path.join(p, f));
    return {
      n: z.name || f,
      d: z.description || "sin desc",
      e: z.run,
    };
  });
  return b;
}

module.exports = { g };
