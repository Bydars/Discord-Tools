const inquirer = require("inquirer");
const axios = require("axios");

const name = "🧱 2";
const description = "Clonador de servidores, metodo: bot discord";

const wait = ms => new Promise(res => setTimeout(res, ms));

async function safeRequest(requestFn, retryMsg = "") {
  while (true) {
    try {
      return await requestFn();
    } catch (err) {
      if (err.response?.status === 429) {
        const retryAfter = err.response.data.retry_after || 1000;
        console.warn(`⏳ Ratelimit detectado. Esperando ${retryAfter} ms ${retryMsg}`);
        await wait(retryAfter);
      } else throw err;
    }
  }
} 

async function run() {
  const { t, x, y } = await inquirer.prompt([
    { type: "input", name: "t", message: "Token del bot:" },
    { type: "input", name: "x", message: "ID servidor origen:" },
    { type: "input", name: "y", message: "ID servidor destino:" }
  ]);

  const headers = {
    Authorization: `Bot ${t}`,
    "Content-Type": "application/json"
  };

  console.log("🧹 Limpiando servidor destino...");
  const [destChannels, destRoles, destEmojis] = await Promise.all([
    safeRequest(() => axios.get(`https://discord.com/api/v10/guilds/${y}/channels`, { headers })),
    safeRequest(() => axios.get(`https://discord.com/api/v10/guilds/${y}/roles`, { headers })),
    safeRequest(() => axios.get(`https://discord.com/api/v10/guilds/${y}/emojis`, { headers }))
  ]);

  for (const ch of destChannels.data) {
    await safeRequest(() => axios.delete(`https://discord.com/api/v10/channels/${ch.id}`, { headers }));
  }

  for (const role of destRoles.data) {
    if (!role.managed && role.name !== "@everyone") {
      await safeRequest(() => axios.delete(`https://discord.com/api/v10/guilds/${y}/roles/${role.id}`, { headers }));
    }
  }

  for (const emoji of destEmojis.data) {
    await safeRequest(() => axios.delete(`https://discord.com/api/v10/guilds/${y}/emojis/${emoji.id}`, { headers }));
  }

  console.log("✅ Limpieza completada.");

  console.log("🎭 Clonando roles...");
  const sourceRoles = await safeRequest(() => axios.get(`https://discord.com/api/v10/guilds/${x}/roles`, { headers }));
  const roleMap = [];
  for (const r of sourceRoles.data.reverse()) {
    if (r.managed || r.name === "@everyone") continue;
    const newRole = await safeRequest(() =>
      axios.post(`https://discord.com/api/v10/guilds/${y}/roles`, {
        name: r.name,
        color: r.color,
        hoist: r.hoist,
        mentionable: r.mentionable,
        permissions: r.permissions
      }, { headers })
    );
    roleMap.push({ old: r.id, new: newRole.data.id });
  }
  const mapRole = id => roleMap.find(r => r.old === id)?.new || id;

  console.log("📂 Clonando categorías...");
  const sourceChannels = (await safeRequest(() => axios.get(`https://discord.com/api/v10/guilds/${x}/channels`, { headers }))).data;
  const categoryMap = [];
  for (const c of sourceChannels.filter(c => c.type === 4)) {
    const newCat = await safeRequest(() =>
      axios.post(`https://discord.com/api/v10/guilds/${y}/channels`, {
        name: c.name,
        type: 4,
        position: c.position,
        permission_overwrites: c.permission_overwrites?.map(po => ({
          id: mapRole(po.id),
          type: po.type,
          allow: po.allow,
          deny: po.deny
        }))
      }, { headers })
    );
    categoryMap.push({ old: c.id, new: newCat.data.id });
  }
  const mapCategory = id => categoryMap.find(c => c.old === id)?.new || null;

  console.log("📨 Clonando canales...");
  for (const c of sourceChannels.filter(c => c.type !== 4 && ![1, 3].includes(c.type))) {
    const data = {
      name: c.name,
      type: c.type,
      parent_id: mapCategory(c.parent_id),
      position: c.position,
      permission_overwrites: c.permission_overwrites?.map(po => ({
        id: mapRole(po.id),
        type: po.type,
        allow: po.allow,
        deny: po.deny
      }))
    };

    if (c.topic) data.topic = c.topic;
    if (typeof c.nsfw === "boolean") data.nsfw = c.nsfw;
    if (c.type === 2) {
      data.bitrate = c.bitrate;
      data.user_limit = c.user_limit;
    }
    if ([5, 15, 16].includes(c.type)) data.default_auto_archive_duration = c.default_auto_archive_duration || 60;
    if (c.type === 13) data.rtc_region = c.rtc_region || null;
    if (c.type === 0) data.rate_limit_per_user = c.rate_limit_per_user || 0;

    try {
      await safeRequest(() => axios.post(`https://discord.com/api/v10/guilds/${y}/channels`, data, { headers }));
    } catch (err) {
      console.error(`❌ Error clonando canal ${c.name}:`, err.response?.data || err.message);
    }
  }

  console.log("📁 Canales y categorías clonados.");

  console.log("😀 Clonando emojis...");
  const sourceEmojis = await safeRequest(() => axios.get(`https://discord.com/api/v10/guilds/${x}/emojis`, { headers }));
  for (const e of sourceEmojis.data) {
    try {
      const img = await safeRequest(() => axios.get(`https://cdn.discordapp.com/emojis/${e.id}.${e.animated ? "gif" : "png"}`, { responseType: "arraybuffer" }));
      const b64 = `data:image/${e.animated ? "gif" : "png"};base64,${Buffer.from(img.data).toString("base64")}`;
      await safeRequest(() => axios.post(`https://discord.com/api/v10/guilds/${y}/emojis`, {
        name: e.name,
        image: b64,
        roles: e.roles.map(mapRole)
      }, { headers }));
    } catch (err) {
      console.error(`❌ Error clonando emoji ${e.name}:`, err.response?.data || err.message);
    }
  }

  console.log("😀 Emojis clonados.");

  console.log("💬 Clonando mensajes...");
  const destText = (await safeRequest(() => axios.get(`https://discord.com/api/v10/guilds/${y}/channels`, { headers }))).data.filter(c => c.type === 0);
  for (const newChan of destText) {
    const oldChan = sourceChannels.find(c => c.name === newChan.name && c.type === 0);
    if (!oldChan) continue;

    try {
      const msgs = await safeRequest(() => axios.get(`https://discord.com/api/v10/channels/${oldChan.id}/messages?limit=50`, { headers }));
      for (const msg of msgs.data.reverse()) {
        const content = `**${msg.author.username}#${msg.author.discriminator}**: ${msg.content || "[mensaje vacío]"}`;
        await safeRequest(() => axios.post(`https://discord.com/api/v10/channels/${newChan.id}/messages`, {
          content,
          embeds: msg.embeds?.slice(0, 10),
          components: msg.components || []
        }, { headers }));
      }
    } catch (err) {
      console.error(`❌ Error clonando mensajes de canal ${newChan.name}:`, err.response?.data || err.message);
    }
  }

  console.log("✅ Clonado total finalizado.");
}

module.exports = { name, description, run };
