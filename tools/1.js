const r = require("inquirer");
const a = require("axios");
const c = require("chalk");
const os = require("os");

const name = "🧪 1";
const description = "Ver detalles completos de un token de Discord";

function decodeSnowflake(id) {
  const discordEpoch = 1420070400000;
  const timestamp = BigInt(id) >> 22n;
  return new Date(Number(timestamp) + discordEpoch).toISOString();
}

function flagsToText(flags) {
  const f = {
    1: "Staff",
    2: "Partner",
    4: "HypeSquad Events",
    8: "Bug Hunter Lv1",
    64: "HypeSquad Bravery",
    128: "HypeSquad Brilliance",
    256: "HypeSquad Balance",
    512: "Early Supporter",
    1024: "Team User",
    4096: "System",
    16384: "Bug Hunter Lv2",
    131072: "Verified Bot",
    262144: "Early Verified Bot Developer"
  };
  return Object.entries(f)
    .filter(([bit]) => (flags & bit) != 0)
    .map(([, name]) => name)
    .join(", ") || "Ninguna";
}

function premiumToText(type) {
  return {
    1: "Nitro Classic",
    2: "Nitro",
    3: "Nitro Basic"
  }[type] || "Sin Nitro";
}

function getAvatarURL(user) {
  if (!user.avatar) return "No tiene avatar";
  const format = user.avatar.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${format}?size=256`;
}

function getBannerURL(user) {
  if (!user.banner) return null;
  const format = user.banner.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${format}?size=512`;
}

async function run() {
  const { t } = await r.prompt([{ type: "input", name: "t", message: "Token:" }]);

  const headers = {
    Authorization: t,
    "Content-Type": "application/json",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
  };

  try {
    const u = (await a.get("https://discord.com/api/v10/users/@me", { headers })).data;

    console.log(c.green("\n✅ Token válido\n"));
    console.log(`${c.cyan("👤 Usuario:")} ${u.username}#${u.discriminator}`);
    console.log(`${c.cyan("🆔 ID:")} ${u.id}`);
    console.log(`${c.cyan("📅 Creado en:")} ${decodeSnowflake(u.id)}`);
    console.log(`${c.cyan("📧 Email:")} ${u.email || "No disponible"}`);
    console.log(`${c.cyan("📱 Teléfono:")} ${u.phone || "No disponible"}`);
    console.log(`${c.cyan("🔐 2FA:")} ${u.mfa_enabled ? "Sí" : "No"}`);
    console.log(`${c.cyan("✅ Verificado:")} ${u.verified ? "Sí" : "No"}`);
    console.log(`${c.cyan("🌍 Idioma:")} ${u.locale || "Desconocido"}`);
    console.log(`${c.cyan("🏷️ Flags:")} ${flagsToText(u.flags || 0)}`);
    console.log(`${c.cyan("💎 Nitro:")} ${premiumToText(u.premium_type)}`);
    if (u.bio) console.log(`${c.cyan("📝 Bio:")} ${u.bio}`);
    if (u.accent_color !== null)
      console.log(`${c.cyan("🎨 Color de acento:")} #${u.accent_color.toString(16)}`);
    if (u.avatar) console.log(`${c.cyan("🖼️ Avatar URL:")} ${getAvatarURL(u)}`);
    if (u.banner) console.log(`${c.cyan("📸 Banner URL:")} ${getBannerURL(u)}`);

    try {
      const ip = await a.get("https://api.ipify.org?format=json");
      console.log(`${c.cyan("🌐 IP actual:")} ${ip.data.ip}`);
    } catch {}
    console.log(`${c.cyan("🖥️ Sistema local:")} ${os.type()} ${os.release()} (${os.platform()})`);
    console.log(`${c.cyan("🧠 CPU:")} ${os.cpus()[0].model}`);
    console.log(`${c.cyan("🧠 RAM:")} ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(1)} GB`);
    try {
      const boosts = await a.get("https://discord.com/api/v10/users/@me/guilds/premium/subscriptions", { headers });
      console.log(`${c.cyan("🚀 Boosts activos:")} ${boosts.data.length}`);
    } catch {
      console.log(`${c.cyan("🚀 Boosts activos:")} No detectados`);
    }

    try {
      const billing = await a.get("https://discord.com/api/v10/users/@me/billing/payment-sources", { headers });
      console.log(`${c.cyan("💳 Métodos de pago:")} ${billing.data.length}`);
      billing.data.forEach((m, i) => {
        console.log(`  - ${c.gray(i + 1)}: ${m.brand || m.type || "Desconocido"} (${m.invalid ? "Inválido" : "Válido"})`);
      });
    } catch {
      console.log(`${c.cyan("💳 Métodos de pago:")} No detectables`);
    }
    try {
      const gifts = await a.get("https://discord.com/api/v10/users/@me/outbound-promotions/codes", { headers });
      console.log(`${c.cyan("🎁 Regalos enviados:")} ${gifts.data.length}`);
    } catch {
      console.log(`${c.cyan("🎁 Regalos enviados:")} No detectables`);
    }

    console.log();
  } catch (err) {
    console.log(c.red("❌ Token inválido o no autorizado."));
  }
}

module.exports = { name, description, run };
