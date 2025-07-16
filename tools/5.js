const a = require("inquirer");
const b = require("axios");
const c = require("dns").promises;
const d = require("chalk");
const e = require("fs");
const f = require("path");

async function g(h) {
  try {
    const i = await b.get(`https://crt.sh/?q=%25.${h}&output=json`, { timeout: 10000 });
    const j = new Set();
    for (let k of i.data) {
      const l = k.name_value.split("\n").map(x => x.trim().toLowerCase());
      for (let m of l) if (m.endsWith(`.${h}`) && !m.includes("*")) j.add(m);
    }
    return Array.from(j);
  } catch {
    return [];
  }
}

async function n(o) {
  try {
    const p = await b.get(`https://api.certspotter.com/v1/issuances?domain=${o}&include_subdomains=true&expand=dns_names`, { timeout: 10000 });
    const q = new Set();
    for (let r of p.data) {
      for (let s of r.dns_names)
        if (s.endsWith(`.${o}`) && !s.includes("*")) q.add(s.toLowerCase());
    }
    return Array.from(q);
  } catch {
    return [];
  }
}

async function t(u) {
  try {
    const v = await b.get(`https://rapiddns.io/subdomain/${u}?full=1`, {
      timeout: 10000,
      headers: { "User-Agent": "Mozilla" }
    });
    const w = new Set();
    const x = v.data.match(/<td>([a-z0-9.-]+)\.${u}<\/td>/gi);
    if (x) for (let y of x) w.add(y.replace(/<[^>]+>/g, ""));
    return Array.from(w);
  } catch {
    return [];
  }
}

async function z(dom) {
  const A = [];
  try { const B = await c.resolve4(dom); A.push("A → " + B.join(", ")); } catch {}
  try { const C = await c.resolve6(dom); A.push("AAAA → " + C.join(", ")); } catch {}
  try {
    const D = await c.resolveMx(dom);
    if (D.length) A.push("MX → " + D.map(x => `${x.exchange} (prio ${x.priority})`).join(", "));
  } catch {}
  try {
    const E = await c.resolveTxt(dom);
    if (E.length) A.push("TXT → " + E.map(x => x.join("")).join(" | "));
  } catch {}
  try {
    const F = await c.resolveCname(dom);
    if (F.length) A.push("CNAME → " + F.join(", "));
  } catch {}
  try {
    const G = await c.resolveNs(dom);
    if (G.length) A.push("NS → " + G.join(", "));
  } catch {}
  try {
    const H = await c.resolveSoa(dom);
    A.push(`SOA → ns: ${H.nsname}, email: ${H.hostmaster}`);
  } catch {}
  return A;
}

const name = "🔗 5";
const description = "Scanner de subdominios";

async function run() {
  const { I } = await a.prompt([
    { type: "input", name: "I", message: "🌐 Dominio objetivo (ej: ejemplo.com):" }
  ]);

  console.log(d.cyan("\n🔍 Recolectando subdominios desde fuentes públicas...\n"));

  const J = await Promise.all([g(I), n(I), t(I)]);
  const K = Array.from(new Set(J.flat().filter(x => x.endsWith(`.${I}`)))).sort();

  if (!K.length) return console.log(d.red("❌ No se encontró ningún subdominio público."));

  console.log(d.gray(`🔢 ${K.length} subdominios únicos encontrados. Iniciando resolución...\n`));

  const L = [];

  for (let M of K) {
    const N = await z(M);
    if (N.length) {
      console.log(d.green(`✅ ${M}`));
      for (let O of N) console.log("   " + d.gray(O));
      L.push(`${M}\n${N.map(x => "  " + x).join("\n")}`);
    } else {
      console.log(d.gray(`❌ ${M}`));
    }
  }

  if (L.length) {
    const P = `subdomains_${I.replace(/\./g, "_")}_${Date.now()}.txt`;
    const Q = f.join(__dirname, "..", "informes");
    if (!e.existsSync(Q)) e.mkdirSync(Q);
    const R = f.join(Q, P);
    e.writeFileSync(R, L.join("\n\n"));
    console.log(d.cyanBright(`\n📁 Informe guardado en:`));
    console.log(d.whiteBright(`→ ${R}\n`));
  } else {
    console.log(d.yellow("\n⚠️ Ningún subdominio pudo resolverse con registros útiles.\n"));
  }
}

module.exports = { name, description, run };
