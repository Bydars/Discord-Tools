const a = require("axios");
const b = require("inquirer");
const c = require("chalk");

const name = "🧱 Server Clonner";
const description = "Clonador profesional de servidor Discord";

const w = ms => new Promise(r => setTimeout(r, ms));
const s = async (fn, label = "") => {
  let tries = 0;
  while (true) {
    try {
      const res = await fn();
      return res;
    } catch (e) {
      const r = e?.response;
      if (r?.status === 429) {
        const t = r.data?.retry_after || 1000;
        if (t > 50000) console.log(c.red("⛔ Ratelimit elevado. Esperando..."));
        await w(t);
      } else {
        if (++tries >= 5) {
          console.log(c.red(`❌ Fallo crítico en ${label}.`), e.message);
          return null;
        }
        await w(2000);
      }
    }
  }
};

const run = async () => {
  const { t, x, y } = await b.prompt([
    { type: "input", name: "t", message: "🔑 Token del bot:" },
    { type: "input", name: "x", message: "📥 Server origen:" },
    { type: "input", name: "y", message: "📤 Server destino:" },
  ]);

  const h = { Authorization: `Bot ${t}`, "Content-Type": "application/json" };
  const map = { roles: {}, cats: {}, chans: {} };

  const api = a.create({ headers: h });

  console.log(c.blue("🧹 Limpiando servidor destino..."));
  const [ch, rl, em] = await Promise.all([
    s(() => api.get(`/guilds/${y}/channels`), "canales"),
    s(() => api.get(`/guilds/${y}/roles`), "roles"),
    s(() => api.get(`/guilds/${y}/emojis`), "emojis"),
  ]);
  for (const i of ch.data) await s(() => api.delete(`/channels/${i.id}`), "delete channel");
  for (const i of rl.data) if (!i.managed && i.name !== "@everyone")
    await s(() => api.delete(`/guilds/${y}/roles/${i.id}`), "delete role");
  for (const i of em.data) await s(() => api.delete(`/guilds/${y}/emojis/${i.id}`), "delete emoji");

  console.log(c.blue("🎭 Clonando roles..."));
  const rsrc = (await s(() => api.get(`/guilds/${x}/roles`), "get source roles")).data.reverse();
  for (const r of rsrc) {
    if (r.managed || r.name === "@everyone") continue;
    const z = await s(() =>
      api.post(`/guilds/${y}/roles`, {
        name: r.name,
        color: r.color,
        hoist: r.hoist,
        mentionable: r.mentionable,
        permissions: r.permissions,
      }), `crear rol ${r.name}`
    );
    if (z) map.roles[r.id] = z.data.id;
  }

  console.log(c.blue("📁 Clonando categorías..."));
  const csrc = (await s(() => api.get(`/guilds/${x}/channels`), "get source channels")).data;
  for (const cat of csrc.filter(c => c.type === 4)) {
    const z = await s(() =>
      api.post(`/guilds/${y}/channels`, {
        name: cat.name,
        type: 4,
        position: cat.position,
        permission_overwrites: cat.permission_overwrites?.map(po => ({
          id: map.roles[po.id] || po.id,
          type: po.type,
          allow: po.allow,
          deny: po.deny,
        })),
      }), `crear categoría ${cat.name}`
    );
    if (z) map.cats[cat.id] = z.data.id;
  }

  console.log(c.blue("💬 Clonando canales..."));
  for (const c1 of csrc.filter(c => c.type !== 4 && ![1, 3].includes(c.type))) {
    const d = {
      name: c1.name,
      type: c1.type,
      parent_id: map.cats[c1.parent_id] || null,
      position: c1.position,
      permission_overwrites: c1.permission_overwrites?.map(po => ({
        id: map.roles[po.id] || po.id,
        type: po.type,
        allow: po.allow,
        deny: po.deny,
      })),
    };
    if (c1.topic) d.topic = c1.topic;
    if (typeof c1.nsfw === "boolean") d.nsfw = c1.nsfw;
    if (c1.type === 2) { d.bitrate = c1.bitrate; d.user_limit = c1.user_limit; }
    if ([5, 15, 16].includes(c1.type)) d.default_auto_archive_duration = c1.default_auto_archive_duration || 60;
    if (c1.type === 13) d.rtc_region = c1.rtc_region || null;
    if (c1.type === 0) d.rate_limit_per_user = c1.rate_limit_per_user || 0;

    const z = await s(() => api.post(`/guilds/${y}/channels`, d), `crear canal ${c1.name}`);
    if (z) map.chans[c1.id] = z.data.id;
  }

  console.log(c.blue("😄 Clonando emojis..."));
  const ems = (await s(() => api.get(`/guilds/${x}/emojis`), "get emojis")).data;
  for (const e of ems) {
    try {
      const img = await s(() => a.get(`https://cdn.discordapp.com/emojis/${e.id}.${e.animated ? "gif" : "png"}`, { responseType: "arraybuffer" }));
      const b64 = `data:image/${e.animated ? "gif" : "png"};base64,${Buffer.from(img.data).toString("base64")}`;
      await s(() => api.post(`/guilds/${y}/emojis`, {
        name: e.name,
        image: b64,
        roles: e.roles.map(r => map.roles[r] || r),
      }), `crear emoji ${e.name}`);
    } catch (err) {
      console.log(c.red("❌ Emoji:"), e.name, err.message);
    }
  }

  console.log(c.blue("📜 Clonando mensajes..."));
  const destText = Object.entries(map.chans)
    .map(([oid, nid]) => {
      const orig = csrc.find(c => c.id === oid);
      return orig?.type === 0 ? { o: oid, n: nid, name: orig.name } : null;
    })
    .filter(Boolean);

  for (const { o, n, name } of destText) {
    try {
      const msgs = await s(() => api.get(`/channels/${o}/messages?limit=50`), `get mensajes ${name}`);
      for (const m of msgs.data.reverse()) {
        const content = `**${m.author.username}#${m.author.discriminator}**: ${m.content || "[vacío]"}`;
        await s(() => api.post(`/channels/${n}/messages`, {
          content,
          embeds: m.embeds?.slice(0, 10),
          components: m.components || [],
        }), `mensaje ${name}`);
      }
    } catch (err) {
      console.log(c.red("❌ Fallo en mensajes de:"), name, err.message);
    }
  }

  console.log(c.green.bold("\n✅ Clonación completa sin errores fatales.\n"));
};

module.exports = { name, description, run };
