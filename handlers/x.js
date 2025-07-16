const f = require("fs");
const p = require("path");

const g = async () => {
  const a = [];

  const h = d => {
    const x = p.join(__dirname, "..", "tools", d);
    const y = f.readdirSync(x, { withFileTypes: true });

    for (const z of y) {
      if (z.isDirectory()) h(p.join(d, z.name));
      else if (z.name.endsWith(".js")) {
        const m = require(p.join(x, z.name));
        const s = d.split(p.sep).filter(Boolean).pop() || "root";

        a.push({
          n: m.name || z.name,
          d: m.description || "sin desc",
          e: m.run,
          f: s,
        });
      }
    }
  };

  h("");
  return a;
};

module.exports = { g };
