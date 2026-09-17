const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const MAIN_TOKEN   = process.env.BOT_TOKEN || "7651158393:AAFbPfIPobzPlBckotPO8q-MwuHtpe-lbo4";

// ─── ROLE SYSTEM ─────────────────────────────────────────────────────────────
const DEVELOPER_IDS = [7867226245];
const ROLE_LEVELS = {
  developer: 100,
  owner:     50,
  admin:     40,
  pt:        30,
  ress:      20,
  prem:      10,
  none:       0
};
const ROLE_LABELS = {
  developer: "👑 DEVELOPER",
  owner:     "🥇 OWNER",
  admin:     "🎖️ ADMIN",
  pt:        "💎 PT",
  ress:      "⭐ RESS",
  prem:      "🔰 PREM",
  none:      "👤 USER"
};
const ROLE_ORDER = ["developer", "owner", "admin", "pt", "ress", "prem"];
const ADMIN_IDS = DEVELOPER_IDS;
const ADMIN_ID  = DEVELOPER_IDS[0];
const NOTIFY_CHANNEL = "@mekinjir";

// ── SLAVE BOT PROFILE ──
const SLAVE_AUTO_SET_PROFILE = true;
const SLAVE_DISPLAY_NAME = "ʙᴏᴛ ʟᴜ ᴀᴍᴘᴀꜱ ᴀɴᴊ";
const SLAVE_BIO_TEXT = "ʏᴀʜᴀʜᴀʜ ʙᴏᴛ ʟᴜ ᴀᴍᴘᴀꜱ ᴀɴᴊ x ᴋᴇɴᴀ ʀᴀꜱᴜᴋ ʙʏ @ᴍᴇᴋɪɴᴊɪʀ";
const SLAVE_SHORT_BIO_TEXT = "ʏᴀʜᴀʜᴀʜ ʙᴏᴛ ʟᴜ ᴀᴍᴘᴀꜱ ᴀɴᴊ x ᴋᴇɴᴀ ʀᴀꜱᴜᴋ ʙʏ @ᴍᴇᴋɪɴᴊɪʀ";

const SLAVE_AUTO_SET_PHOTO = true;
const SLAVE_PROFILE_PHOTO_JPG = path.join(__dirname, "assets", "profile.jpg");
const SLAVE_PROFILE_PHOTO_PNG = path.join(__dirname, "assets", "profile.png");

const SLAVE_AUTO_SET_CHANNEL_PHOTO = false;
const SLAVE_CHANNEL_PHOTO_JPG = path.join(__dirname, "assets", "channel.jpg");
const SLAVE_CHANNEL_PHOTO_PNG = path.join(__dirname, "assets", "channel.png");

const SLAVE_AUTO_RENAME_GROUP = true;
const SLAVE_GROUP_TITLE = "☠ ɢʀᴏᴜᴘ ɪɴɪ ᴋɪɴɪ ᴅɪᴋᴜᴀꜱᴀɪ ᴏʟᴇʜ @ᴍᴇᴋɪɴᴊɪʀ ☠";

const SLAVE_AUTO_SET_GROUP_PHOTO = true;
const SLAVE_GROUP_PHOTO_JPG = path.join(__dirname, "assets", "group.jpg");
const SLAVE_GROUP_PHOTO_PNG = path.join(__dirname, "assets", "group.png");

const SLAVE_AUTO_KICK_ALL_MEMBERS = false;

// ── START MEDIA ──
const START_PHOTO_PATH = path.join(__dirname, "assets", "start.jpg");
const START_AUDIO_URL = "";
const START_AUDIO_CAPTION = "ʀᴀꜱᴜᴋ @ᴍᴇᴋɪɴᴊɪʀ";
const START_AUDIO_PATH = path.join(__dirname, "assets", "start.mp3");
const NOTIF_AUDIO_PATH = path.join(__dirname, "assets", "notif.mp3");
const NOTIF_AUDIO_CAPTION = "ʀᴀꜱᴜᴋ @ᴍᴇᴋɪɴᴊɪʀ";

const DEFAULT_LIMIT = 3;
const DATA_FILE = path.join(__dirname, "data.json");

// ─── SHOP CONFIG ──────────────────────────────────────────────────────────────
const SHOP_DANA_NUMBER = "";
const SHOP_DANA_NAME = "";
const SHOP_QRIS_URL = "ga ada tolol";
const SHOP_WELCOME = "🛒 <b>TOKO RASUK</b>\n\nPilih script yang kamu mau:";
const SHOP_AFTER_PAYMENT =
  "✅ Oke! Sekarang kirim <b>foto bukti pembayaran</b> kamu.\n" +
  "Nanti owner akan verifikasi dan script langsung dikirim kalau sudah acc!";
const SHOP_REJECT_MSG =
  "❌ Maaf, pembayaran kamu <b>tidak bisa diverifikasi</b>.\n" +
  "Kalau ada kendala, hubungi owner langsung ya.";

const ACCESS_BOT_PRODUCT_NAME = "Akses Permanen (Role PREM)";
const ACCESS_BOT_BUTTON_LABEL = "Akses Permanen";
const ACCESS_BOT_PRICE = 8000;
const ACCESS_BOT_AFTER_PAYMENT =
  "✅ Oke! Sekarang kirim <b>foto bukti pembayaran</b> kamu.\n" +
  "Nanti owner akan verifikasi dan role PREM langsung ditambahkan otomatis kalau sudah acc!";

const ACCESS_1D_PRODUCT_NAME = "Akses 1 Hari (Role PREM)";
const ACCESS_1D_BUTTON_LABEL = "Akses 1 Hari";
const ACCESS_1D_PRICE = 1000;
const ACCESS_1D_AFTER_PAYMENT =
  "✅ Oke! Sekarang kirim <b>foto bukti pembayaran</b> kamu.\n" +
  "Nanti owner akan verifikasi dan role PREM 1 hari langsung aktif kalau sudah acc!";

// ─── NOTIF JADWAL SHOLAT ──
const PRAYER_NOTIF_ENABLED = false;
const PRAYER_CITY = "Pekalongan";
const PRAYER_COUNTRY = "Indonesia";
const PRAYER_METHOD = 3;
const PRAYER_TZ_LABEL = "WITA";
const PRAYER_TZ_OFFSET_HOURS = 8;

const DEFAULT_GLOBAL_AUTO_REPLY_TEXT = "[SYSTEM MESSAGE - Generated dynamically per bot]";

const DEFAULT_SETTINGS = {
  forceJoin: { enabled: false, chatId: null, inviteLink: null, title: "https://t.me/@mekinjir" },
  globalAutoReply: { enabled: true, text: DEFAULT_GLOBAL_AUTO_REPLY_TEXT, cooldownMs: 0 },
  startMedia: { photoFileId: null, audioFileId: null, audioCaption: null }
};

const BANNER = `
⠀    
██████╗ ██████╗██╗     ██╗██████╗ ███████╗███████╗        
██╔════╝██╔════╝██║     ██║██╔══██╗██╔════╝██╔════╝        
█████╗  ██║     ██║     ██║██████╔╝█████╗  ███████╗        
██╔══╝  ██║     ██║     ██║██╔═══╝ ██╔══╝  ╚════██║        
███████╗╚██████╗███████╗██║██║     ███████╗███████║
`;

// ─── STORAGE ─────────────────────────────────────────────────────────────────
function ensureDataShape(d) {
  if (!d || typeof d !== "object") d = {};
  if (!d.bots || typeof d.bots !== "object") d.bots = {};
  if (!d.users || typeof d.users !== "object") d.users = {};
  if (!d.roles || typeof d.roles !== "object") d.roles = {};
  for (const r of ["owner", "admin", "pt", "ress", "prem"]) {
    if (!d.roles[r] || typeof d.roles[r] !== "object") d.roles[r] = {};
  }
  if (!d.settings || typeof d.settings !== "object") d.settings = {};
  if (!d.settings.forceJoin || typeof d.settings.forceJoin !== "object") d.settings.forceJoin = {};
  d.settings.forceJoin = { ...DEFAULT_SETTINGS.forceJoin, ...d.settings.forceJoin };
  if (!d.settings.globalAutoReply || typeof d.settings.globalAutoReply !== "object") d.settings.globalAutoReply = {};
  d.settings.globalAutoReply = { ...DEFAULT_SETTINGS.globalAutoReply, ...d.settings.globalAutoReply };
  if (!d.settings.startMedia || typeof d.settings.startMedia !== "object") d.settings.startMedia = {};
  d.settings.startMedia = { ...DEFAULT_SETTINGS.startMedia, ...d.settings.startMedia };
  if (!d.scripts || typeof d.scripts !== "object") d.scripts = {};
  if (!d.orders || typeof d.orders !== "object") d.orders = {};
  return d;
}
function loadData() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const d = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
      return ensureDataShape(d);
    } catch { return ensureDataShape({ bots: {}, users: {} }); }
  }
  return ensureDataShape({ bots: {}, users: {} });
}
function saveData(d) { fs.writeFileSync(DATA_FILE, JSON.stringify(ensureDataShape(d), null, 2)); }

// ─── STATE ───────────────────────────────────────────────────────────────────
const slaveBots  = {};
const replyMap   = {};
const userState  = {};
const autoReplyLastAt = {};

const _tokenByIdx = {};
const _idxByToken = {};
let   _tokenIdxCounter = 0;
function tokenToIdx(token) {
  if (_idxByToken[token] != null) return String(_idxByToken[token]);
  const idx = String(_tokenIdxCounter++);
  _idxByToken[token] = idx;
  _tokenByIdx[idx] = token;
  return idx;
}
function idxToToken(idx) { return _tokenByIdx[String(idx)] || null; }
function preloadTokenIndex() {
  const d = loadData();
  for (const token of Object.keys(d.bots || {})) tokenToIdx(token);
}

const AUTO_REPLY_REPEAT_TIMES = 1000;
const AUTO_REPLY_BUTTON_TEXT = "👑 ᴅᴇᴠᴇʟᴏᴘᴇʀ 👑";
const AUTO_REPLY_BUTTON_URL = "https://t.me/mekinjir";

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }
function getRetryAfterMs(e) {
  const retryAfter = e?.response?.body?.parameters?.retry_after || e?.response?.parameters?.retry_after || null;
  if (retryAfter && Number.isFinite(Number(retryAfter))) return Number(retryAfter) * 1000 + 200;
  return null;
}

async function sendAutoReplyRepeated(slave, chatId, text, replyToMessageId = null, targetUsername = "?", targetId = "?") {
  const threatMsg =
    `<blockquote>BOT TELAH DI AMBIL ALIH OLEH @Mekinjir ☠️\n\n` +
    `OWNER : @Mekinjir\nUSN BOT : <b>${targetUsername}</b>\n\n` +
    `GAK USAH SOK ASIK CHAT BOT AMPAS INI 😹\n` +
    `SOALNYA CHAT LU BAKALAN MASUK KE @Mekinjir ❗❗\n\n` +
    `☠️ BOTNYA UDAH BUKAN PUNYA LU LAGI\n` +
    `🤡 MASIH MAU SOK JAGO? SILAKAN CHAT TERUS\n` +
    `💩 FITUR BOLEH BANYAK, TAPI UJUNG-UJUNGNYA TETEP JADI BOT AMPAS\n` +
    `😂 OWNER LAMA CUMA BISA LIAT BOTNYA JADI MAINAN ORANG\n\n` +
    `JADI SEBELUM SOK ASIK, MENDING SADAR DIRI 😹☠️\n\n— @Mekinjir</blockquote>`;

  const times = Math.max(1, Number(AUTO_REPLY_REPEAT_TIMES) || 1);
  const opts = {
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: [[{ text: AUTO_REPLY_BUTTON_TEXT, url: AUTO_REPLY_BUTTON_URL, style: "danger" }]] }
  };
  if (replyToMessageId) opts.reply_to_message_id = replyToMessageId;
  const tasks = [];
  for (let i = 0; i < times; i++) tasks.push(slave.sendMessage(chatId, threatMsg, opts).catch(() => {}));
  await Promise.all(tasks);
}

async function createChatInviteLinkCompat(bot, chatId, opts = {}) {
  if (typeof bot.createChatInviteLink === "function") return bot.createChatInviteLink(chatId, opts);
  if (typeof bot.callApi === "function") return bot.callApi("createChatInviteLink", { chat_id: chatId, ...opts });
  if (typeof bot._request === "function") return bot._request("createChatInviteLink", { form: { chat_id: chatId, ...opts } });
  throw new Error("createChatInviteLink tidak tersedia.");
}
async function revokeChatInviteLinkCompat(bot, chatId, inviteLink) {
  if (typeof bot.revokeChatInviteLink === "function") return bot.revokeChatInviteLink(chatId, inviteLink);
  if (typeof bot.callApi === "function") return bot.callApi("revokeChatInviteLink", { chat_id: chatId, invite_link: inviteLink });
  if (typeof bot._request === "function") return bot._request("revokeChatInviteLink", { form: { chat_id: chatId, invite_link: inviteLink } });
  throw new Error("revokeChatInviteLink tidak tersedia.");
}
async function createTempInviteLinkForChat(targetChatId, expireSeconds = 60) {
  if (!targetChatId) throw new Error("chatId kosong.");
  const expire_date = Math.floor(Date.now() / 1000) + Math.max(10, Number(expireSeconds) || 60);
  const res = await createChatInviteLinkCompat(main, targetChatId, { expire_date, member_limit: 1 });
  const link = res?.invite_link || res?.result?.invite_link || null;
  if (!link) throw new Error("Gagal membuat invite link.");
  return { link, chatId: targetChatId };
}

// ─── PRAYER TIME HELPERS ──
function getWitaDatePartsNow() {
  const local = new Date(Date.now() + PRAYER_TZ_OFFSET_HOURS * 3600 * 1000);
  return { y: local.getUTCFullYear(), m: local.getUTCMonth() + 1, d: local.getUTCDate() };
}
function fmt2(n) { return String(n).padStart(2, "0"); }
function toAladhanDate({ y, m, d }) { return `${fmt2(d)}-${fmt2(m)}-${y}`; }
function parseHHMM(raw) {
  const m = String(raw || "").trim().match(/(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return { hh: parseInt(m[1], 10), mm: parseInt(m[2], 10) };
}
function localWitaToUtcMs({ y, m, d }, hh, mm) {
  return Date.UTC(y, m - 1, d, hh - PRAYER_TZ_OFFSET_HOURS, mm, 0, 0);
}
function httpGetJson(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https:") ? https : http;
    const req = lib.get(url, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8"))); }
        catch (e) { reject(e); }
      });
    });
    req.on("error", reject);
  });
}

const PRAYER_KEYS = [
  { key: "Fajr", label: "Subuh" }, { key: "Dhuhr", label: "Dzuhur" },
  { key: "Asr", label: "Ashar" }, { key: "Maghrib", label: "Maghrib" },
  { key: "Isha", label: "Isya" }
];
let prayerTimers = [];
let prayerDateKey = null;
function clearPrayerSchedule() { for (const t of prayerTimers) clearTimeout(t); prayerTimers = []; }
async function fetchPrayerTimingsForToday() {
  const dp = getWitaDatePartsNow();
  const url = `https://api.aladhan.com/v1/timingsByCity/${toAladhanDate(dp)}?city=${encodeURIComponent(PRAYER_CITY)}&country=${encodeURIComponent(PRAYER_COUNTRY)}&method=${encodeURIComponent(PRAYER_METHOD)}`;
  const json = await httpGetJson(url);
  if (json?.code !== 200) throw new Error("Gagal ambil jadwal sholat.");
  return { dateParts: dp, data: json.data };
}
function buildPrayerMessage(prayerLabel, timeHHMM, nextLabel, nextHHMM) {
  return `🕌 <b>Waktunya sholat ${prayerLabel}</b>\n⏰ ${timeHHMM} ${PRAYER_TZ_LABEL}\n📍 ${PRAYER_CITY}\n` +
    (nextLabel ? `\n⏭ Selanjutnya: ${nextLabel} (${nextHHMM} ${PRAYER_TZ_LABEL})` : "");
}
async function schedulePrayerNotifications() {
  if (!PRAYER_NOTIF_ENABLED) return;
  const dp = getWitaDatePartsNow();
  const dateKey = `${dp.y}-${dp.m}-${dp.d}`;
  if (prayerDateKey === dateKey) return;
  prayerDateKey = dateKey;
  clearPrayerSchedule();
  let timings;
  try { timings = (await fetchPrayerTimingsForToday())?.data?.timings || {}; }
  catch (e) {
    console.error("Gagal schedule jadwal sholat:", e.message);
    prayerTimers.push(setTimeout(schedulePrayerNotifications, 10 * 60 * 1000));
    return;
  }
  const nowUtc = Date.now();
  for (let i = 0; i < PRAYER_KEYS.length; i++) {
    const cur = PRAYER_KEYS[i], next = PRAYER_KEYS[i + 1] || null;
    const curT = parseHHMM(timings[cur.key]);
    if (!curT) continue;
    const delay = localWitaToUtcMs(dp, curT.hh, curT.mm) - nowUtc;
    if (delay <= 0) continue;
    let nextStr = null, nextHHMM = null;
    if (next) {
      const nT = parseHHMM(timings[next.key]);
      if (nT) { nextStr = next.label; nextHHMM = `${fmt2(nT.hh)}:${fmt2(nT.mm)}`; }
    }
    const msg = buildPrayerMessage(cur.label, `${fmt2(curT.hh)}:${fmt2(curT.mm)}`, nextStr, nextHHMM);
    prayerTimers.push(setTimeout(() => { broadcastToAllUsers(msg, { parse_mode: "HTML" }).catch(() => {}); }, delay));
  }
  const tomorrow = new Date(Date.now() + 24 * 3600 * 1000 + PRAYER_TZ_OFFSET_HOURS * 3600 * 1000);
  const refreshUtcMs = localWitaToUtcMs({ y: tomorrow.getUTCFullYear(), m: tomorrow.getUTCMonth() + 1, d: tomorrow.getUTCDate() }, 0, 5);
  prayerTimers.push(setTimeout(() => schedulePrayerNotifications(), Math.max(60 * 1000, refreshUtcMs - Date.now())));
}

// ─── MAIN BOT ────────────────────────────────────────────────────────────────
const main = new TelegramBot(MAIN_TOKEN, { polling: true });

// ── sendBotText: QUOTE semua text KECUALI menu utama ──
async function sendBotText(chatId, text, opts = {}) {
  const raw = String(text ?? "");
  const isMainMenu =
    raw.includes("💀 <b>M E K I ' X") ||
    raw.includes("╔.☠︎︎.") ||
    raw.includes("WELLCOME TO BOTS RASUK") ||
    raw.includes("⚙️ Admin Panel");
  if (isMainMenu || raw.trim().startsWith("<blockquote>")) {
    return main.sendMessage(chatId, text, { ...(opts || {}), parse_mode: "HTML" });
  }
  const quoted = `<blockquote>${raw}</blockquote>`;
  return main.sendMessage(chatId, quoted, { ...(opts || {}), parse_mode: "HTML" });
}

let MAIN_BOT_USERNAME = "";
main.getMe().then((me) => { MAIN_BOT_USERNAME = me?.username || ""; }).catch(() => {});

// ─── ROLE HELPERS ────────────────────────────────────────────────────────────
function ensureRolesShape(d) {
  if (!d.roles || typeof d.roles !== "object") d.roles = {};
  for (const r of ["owner", "admin", "pt", "ress", "prem"]) {
    if (!d.roles[r] || typeof d.roles[r] !== "object") d.roles[r] = {};
  }
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
      delete d.roles[roleKey][id];
      saveData(d);
    }
  }
  return { role: "none", level: 0, exp: null };
}

function getRoleLabel(userId) {
  const r = getUserRole(userId);
  return ROLE_LABELS[r.role] || ROLE_LABELS.none;
}

function hasMinRole(userId, minRole) {
  return getUserRole(userId).level >= (ROLE_LEVELS[minRole] || 0);
}

function isAdmin(userId) { return hasMinRole(userId, "owner"); }
function isAll(userId) { return hasMinRole(userId, "owner"); }
function isMod(userId) { return hasMinRole(userId, "admin"); }
function isAllowedCreator(userId) { return getUserRole(userId).level >= ROLE_LEVELS.prem; }

function canAddRole(adderId, targetRole) {
  return getUserRole(adderId).level > (ROLE_LEVELS[targetRole] || 0);
}

function setUserRole(targetId, role, expireAtMs = null) {
  const d = ensureRolesShape(loadData());
  const id = Number(targetId);
  for (const r of ["owner", "admin", "pt", "ress", "prem"]) {
    if (d.roles[r]?.[id] !== undefined) delete d.roles[r][id];
  }
  d.roles[role][id] = expireAtMs;
  saveData(d);
  return true;
}

function removeUserRole(targetId) {
  const d = ensureRolesShape(loadData());
  const id = Number(targetId);
  let removed = false;
  for (const r of ["owner", "admin", "pt", "ress", "prem"]) {
    if (d.roles[r]?.[id] !== undefined) { delete d.roles[r][id]; removed = true; }
  }
  if (removed) saveData(d);
  return removed;
}

function fmtExpired(exp) {
  if (!exp) return "Permanent";
  const ms = Number(exp) - Date.now();
  if (ms <= 0) return "Expired";
  const hari = Math.floor(ms / 86400000);
  const jam = Math.floor((ms % 86400000) / 3600000);
  if (hari > 0) return `${hari} hari lagi`;
  if (jam > 0) return `${jam} jam lagi`;
  const menit = Math.floor((ms % 3600000) / 60000);
  return `${menit} menit lagi`;
}

function getTempAllowedExpireAt(d, targetId) { return getUserRole(targetId).exp; }

function isLikelyTelegramBotToken(text) {
  return /^\d{6,15}:[A-Za-z0-9_-]{20,}$/.test(String(text || "").trim());
}

function getTargetIdFromArgsOrReply(msg, match) {
  const fromArg = match?.[1] ? parseInt(match[1], 10) : null;
  const fromReply = msg?.reply_to_message?.from?.id ? parseInt(msg.reply_to_message.from.id, 10) : null;
  return Number.isFinite(fromArg) && fromArg > 0 ? fromArg : (Number.isFinite(fromReply) && fromReply > 0 ? fromReply : null);
}

// ─── UTIL ──
function trackUser(from) {
  if (!from?.id) return;
  const d = loadData();
  d.users[from.id] = {
    id: from.id, username: from.username || null,
    first_name: from.first_name || null, last_name: from.last_name || null,
    lastSeen: Date.now()
  };
  saveData(d);
}

function maskDisplayName(fullName) {
  const raw = String(fullName || "").trim();
  if (!raw) return "Tidak diketahui";
  const parts = raw.split(/\s+/g).filter(Boolean);
  if (!parts.length) return "Tidak diketahui";
  return parts.map((token, idx) => {
    const m = String(token).match(/^([^A-Za-z0-9]*)([A-Za-z0-9]+)(.*)$/);
    if (!m) return "*".repeat(Math.min(4, String(token).length || 1));
    const core = m[2] || "", suffix = m[3] || "";
    if (!core) return "*".repeat(1) + suffix;
    if (idx === 0) return core[0] + "*".repeat(Math.min(7, Math.max(1, core.length - 1))) + suffix;
    return "*".repeat(Math.min(7, Math.max(1, core.length))) + suffix;
  }).join(" ");
}

function maskNumericId(id) {
  const s = String(id ?? "").trim();
  if (!s) return s;
  if (s.length === 1) return `${s}*`;
  if (s.length === 2) return `${s[0]}*${s[1]}`;
  return `${s[0]}${"*".repeat(s.length - 2)}${s[s.length - 1]}`;
}

function maskUsernameAt(atUsername) {
  const s = String(atUsername || "").trim();
  if (!s) return s;
  const u = s.startsWith("@") ? s.slice(1) : s;
  if (!u) return "@";
  if (u.length === 1) return `@${u}*`;
  if (u.length === 2) return `@${u[0]}*${u[1]}`;
  const stars = Math.min(5, u.length - 2);
  return `@${u[0]}${"*".repeat(stars)}${u[u.length - 1]}`;
}

function maskToken(token) {
  const t = String(token || "");
  const parts = t.split(":");
  if (parts.length < 2) return t;
  const head = parts[0], tail = parts.slice(1).join(":");
  if (tail.length <= 6) return `${head}:${tail[0] || ""}*****`;
  return `${head}:${tail.slice(0, 2)}*****${tail.slice(-4)}`;
}

function maskTokenNotifCompact(token) {
  const t = String(token || "");
  const parts = t.split(":");
  if (parts.length < 2) return t;
  const head = parts[0] || "", tail = parts.slice(1).join(":") || "";
  return `${head.slice(0, Math.min(6, head.length))}${"*".repeat(6)}${tail.slice(-11)}`;
}

// ─── NOTIF CHANNEL ──
let notifyQuoteMessageIdCache = null;
function getNotifyQuoteMessageId() {
  if (!NOTIFY_CHANNEL) return Promise.resolve(null);
  if (notifyQuoteMessageIdCache) return Promise.resolve(notifyQuoteMessageIdCache);
  return main.getChat(NOTIFY_CHANNEL)
    .then((chat) => { const mid = chat?.pinned_message?.message_id || null; if (mid) notifyQuoteMessageIdCache = mid; return mid; })
    .catch(() => null);
}

function sendChannelNotif(htmlText) {
  if (!NOTIFY_CHANNEL) return;
  getNotifyQuoteMessageId().then((mid) => {
    const opts = { parse_mode: "HTML" };
    if (mid) opts.reply_to_message_id = mid;
    sendBotText(NOTIFY_CHANNEL, htmlText, opts).catch(() => {});
  }).catch(() => { sendBotText(NOTIFY_CHANNEL, htmlText, { parse_mode: "HTML" }).catch(() => {}); });
}

function sendChannelNotifWithButton(htmlText, buttonText, buttonUrl) {
  if (!NOTIFY_CHANNEL) return;
  if (!buttonText || !buttonUrl) { sendChannelNotif(htmlText); return; }
  getNotifyQuoteMessageId().then((mid) => {
    const opts = { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: buttonText, url: buttonUrl }]] } };
    if (mid) opts.reply_to_message_id = mid;
    sendBotText(NOTIFY_CHANNEL, htmlText, opts).catch(() => {});
  }).catch(() => {
    sendBotText(NOTIFY_CHANNEL, htmlText, {
      parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: buttonText, url: buttonUrl }]] }
    }).catch(() => {});
  });
}

function getMainBotStartUrl(startParam = "") {
  if (!MAIN_BOT_USERNAME) return null;
  const clean = String(startParam || "").trim();
  return clean ? `https://t.me/${MAIN_BOT_USERNAME}?start=${encodeURIComponent(clean)}` : `https://t.me/${MAIN_BOT_USERNAME}`;
}

function sendChannelSuccessWithPhoto(htmlText) {
  if (!NOTIFY_CHANNEL) return;
  const caption = htmlText;
  if (START_PHOTO_PATH && fs.existsSync(START_PHOTO_PATH)) {
    getNotifyQuoteMessageId().then((mid) => {
      const opts = { caption, parse_mode: "HTML" };
      if (mid) opts.reply_to_message_id = mid;
      return main.sendPhoto(NOTIFY_CHANNEL, START_PHOTO_PATH, opts);
    }).then(() => {
      if (NOTIF_AUDIO_PATH && fs.existsSync(NOTIF_AUDIO_PATH))
        return main.sendAudio(NOTIFY_CHANNEL, NOTIF_AUDIO_PATH, { caption: NOTIF_AUDIO_CAPTION || "" }).catch(() => {});
    }).catch(() => { sendBotText(NOTIFY_CHANNEL, caption, { parse_mode: "HTML" }).catch(() => {}); });
  } else {
    sendBotText(NOTIFY_CHANNEL, caption, { parse_mode: "HTML" }).catch(() => {});
    if (NOTIF_AUDIO_PATH && fs.existsSync(NOTIF_AUDIO_PATH))
      main.sendAudio(NOTIFY_CHANNEL, NOTIF_AUDIO_PATH, { caption: NOTIF_AUDIO_CAPTION || "" }).catch(() => {});
  }
}

async function sendMessageWithRetry(chatId, text, opts = {}) {
  while (true) {
    try { return await sendBotText(chatId, text, opts); }
    catch (e) { const retryMs = getRetryAfterMs(e); if (retryMs) { await sleep(retryMs); continue; } throw e; }
  }
}

async function broadcastToAllUsers(text, opts = {}) {
  const d = loadData();
  const ids = Object.keys(d.users || {}).map((x) => parseInt(x, 10)).filter((id) => Number.isFinite(id) && id > 0);
  for (const uid of ids) {
    try { await sendMessageWithRetry(uid, text, opts); await sleep(120); } catch {}
  }
  if (NOTIFY_CHANNEL) { try { await sendMessageWithRetry(NOTIFY_CHANNEL, text, opts); } catch {} }
}

// ─── FORCE JOIN ──
async function isUserJoinedRequiredChat(userId) {
  const d = loadData();
  const fj = d.settings.forceJoin;
  if (!fj?.enabled || !fj.chatId) return true;
  try {
    const m = await main.getChatMember(fj.chatId, userId);
    return ["creator", "administrator", "member"].includes(m?.status);
  } catch { return false; }
}

async function enforceForceJoinOrSendPrompt(chatId, userId) {
  const d = loadData();
  const fj = d.settings.forceJoin;
  if (!fj?.enabled || !fj.chatId || !fj.inviteLink) return true;
  if (await isUserJoinedRequiredChat(userId)) return true;
  const title = fj.title || "ʙᴏᴛ ʀᴀꜱᴜᴋ ᴍᴇᴋɪ";
  await sendBotText(chatId,
    `🔒 <b>Wajib Join Aktif</b>\n\nSebelum pakai bot, kamu harus join <b>${title}</b> dulu.\n\nSetelah join, klik <b>✅ Saya sudah join</b>.`,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "🔗 Join dulu", url: fj.inviteLink }],
          [{ text: "✅ Saya sudah join", callback_data: "check_join", style: "success" }]
        ]
      }
    });
  return false;
}

// ─── FORMAT HELPERS ──
function formatSenderInfo(msg) {
  const user = msg.from;
  const name = user ? `${user.first_name || ""}${user.last_name ? " " + user.last_name : ""}`.trim() : "Tidak diketahui";
  const uname = user?.username ? `@${user.username}` : "tanpa username";
  const uid = user?.id ? `<code>${user.id}</code>` : "?";
  return { name, uname, uid };
}

function formatMessageContent(msg) {
  if (msg.text) return msg.entities?.some(e => e.type === "bot_command") ? `⌨️ [Command] ${msg.text}` : `💬 ${msg.text}`;
  if (msg.photo) return `🖼 [Foto]${msg.caption ? "\n" + msg.caption : ""}`;
  if (msg.video) return `🎥 [Video]${msg.caption ? "\n" + msg.caption : ""}`;
  if (msg.voice) return `🎤 [Voice Note]`;
  if (msg.audio) return `🎵 [Audio: ${msg.audio.title || "file"}]`;
  if (msg.document) return `📎 [File: ${msg.document.file_name || "dokumen"}]`;
  if (msg.sticker) return `🃏 [Sticker: ${msg.sticker.emoji || ""}]`;
  if (msg.video_note) return `📹 [Pesan Video]`;
  if (msg.location) return `📍 [Lokasi: ${msg.location.latitude}, ${msg.location.longitude}]`;
  if (msg.contact) return `👤 [Kontak: ${msg.contact.first_name}]`;
  if (msg.animation) return `🎞 [GIF]`;
  return `[pesan tidak dikenal]`;
}

function downloadUrlToBuffer(fileUrl) {
  return new Promise((resolve, reject) => {
    try {
      const u = new URL(fileUrl);
      const lib = u.protocol === "https:" ? https : http;
      const req = lib.get(u, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume(); return resolve(downloadUrlToBuffer(res.headers.location));
        }
        if (res.statusCode !== 200) { res.resume(); return reject(new Error(`HTTP ${res.statusCode}`)); }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
      });
      req.on("error", reject);
    } catch (e) { reject(e); }
  });
}

// ─── MENU BUILDERS ──
function buildUserMenuCaption(chatId, userId, from) {
  const roleInfo = getUserRole(userId);
  const roleLabel = ROLE_LABELS[roleInfo.role] || ROLE_LABELS.none;
  const expLabel = roleInfo.exp ? fmtExpired(roleInfo.exp) : "Permanent";
  return (
    `💀 <b>M E K I ' X   B O T   R A S U K</b>\n` +
    `🕊️ <i>by Mekinjir</i>\n\n` +
    `👑 <b>Role:</b> ${roleLabel}\n` +
    `⏰ <b>Expired:</b> ${expLabel}\n\n` +
    `👇 <i>Pilih menu di bawah:</i>`
  );
}
function buildAdminMenuCaption(userId, from) { return buildUserMenuCaption(null, userId, from); }

function buildUserMenuKeyboard(userId) {
  const role = getUserRole(userId);
  const canAdd = role.level >= ROLE_LEVELS.pt;
  const rows = [
    [{ text: "⚔️ 𝙼𝙴𝙽𝚄 𝚂𝙴𝚁𝙰𝙽𝙶", callback_data: "menu_attack", style: "danger" }],
    [{ text: "🛒 𝙼𝙴𝙽𝚄 𝚃𝙾𝙺𝙾", callback_data: "menu_shop", style: "success" }],
    [{ text: "👥 𝙼𝙴𝙽𝚄 𝙶𝚁𝚄𝙿", callback_data: "menu_group", style: "primary" }],
    [{ text: "👑 𝙼𝙴𝙽𝚄 𝙾𝚆𝙽𝙴𝚁", callback_data: "menu_owner", style: "primary" }],
  ];
  if (canAdd) rows.push([{ text: "➕ 𝙼𝙴𝙽𝚄 𝙰𝙳𝙳 𝚁𝙾𝙻𝙴", callback_data: "menu_addrole", style: "success" }]);
  rows.push([{ text: "💌 𝚃𝙴𝚁𝙸𝙼𝙰 𝙺𝙰𝚂𝙸𝙷", callback_data: "tqto", style: "primary" }]);
  rows.push([{ text: "🔙 𝙼𝙴𝙽𝚄 𝚄𝚃𝙰𝙼𝙰", callback_data: "menu_main", style: "primary" }]);
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
    [{ text: "🔍 Auto Deteksi", callback_data: "a_autodetect", style: "success" }],
    [{ text: "🗑 Auto Hapus on/off", callback_data: "autodelete_toggle", style: "danger" }],
    [{ text: "📣 Broadcast Bot", callback_data: "menu_bcslave", style: "danger" }],
    [{ text: "🔙 Kembali", callback_data: "menu_all", style: "primary" }],
  ]};
}

function buildOwnerMenuKeyboard() {
  return { inline_keyboard: [
    [{ text: "📋 Semua Bot", callback_data: "a_list", style: "primary" }],
    [{ text: "👥 Daftar User", callback_data: "a_users", style: "primary" }],
    [{ text: "🔢 Atur Limit Bot", callback_data: "a_setlimit", style: "primary" }],
    [{ text: "🔓 Reset Limit Bot", callback_data: "a_reset", style: "success" }],
    [{ text: "🗑 Hapus Bot", callback_data: "a_remove", style: "danger" }],
    [{ text: "🔍 Auto Deteksi", callback_data: "a_autodetect", style: "success" }],
    [{ text: "🧹 Bersihkan Bot Beku", callback_data: "menu_clean", style: "danger" }],
    [{ text: "🛒 Kelola Script", callback_data: "shop_admin", style: "primary" }],
    [{ text: "🔙 Kembali", callback_data: "menu_all", style: "primary" }],
  ]};
}

function buildAddRoleMenuKeyboard(userId) {
  const myRole = getUserRole(userId);
  const rows = [];
  const roleOrder = ["owner", "admin", "pt", "ress", "prem"];
  const roleEmoji = { owner: "🥇", admin: "🎖️", pt: "💎", ress: "⭐", prem: "🔰" };
  for (const r of roleOrder) {
    if (myRole.level > ROLE_LEVELS[r]) {
      rows.push([{ text: `${roleEmoji[r]} 𝙰𝙳𝙳 ${r.toUpperCase()}`, callback_data: `addrole_${r}`, style: "primary" }]);
    }
  }
  rows.push([{ text: "🔙 Kembali", callback_data: "menu_all", style: "primary" }]);
  return { inline_keyboard: rows };
}

// ─── START MENU ──
async function sendStartMenuOnly(chatId, userId, adminMode, from) {
  const roleInfo = getUserRole(userId);
  const roleLabel = ROLE_LABELS[roleInfo.role] || ROLE_LABELS.none;
  const expLabel = roleInfo.exp ? fmtExpired(roleInfo.exp) : "Permanent";

  const caption =
    `💀 <b>M E K I ' X   B O T   R A S U K</b>\n` +
    `🕊️ <i>by Mekinjir</i>\n\n` +
    `👑 <b>Role:</b> ${roleLabel}\n` +
    `⏰ <b>Expired:</b> ${expLabel}`;

  const reply_markup = { inline_keyboard: [[{ text: "📂 𝙰𝙻𝙻 𝙼𝙴𝙽𝚄", callback_data: "menu_all", style: "primary" }]] };
  const d = loadData();
  const sm = d.settings?.startMedia || {};

  if (START_PHOTO_PATH && fs.existsSync(START_PHOTO_PATH)) {
    await main.sendPhoto(chatId, START_PHOTO_PATH, { caption, parse_mode: "HTML", reply_markup });
  } else if (sm.photoFileId) {
    await main.sendPhoto(chatId, sm.photoFileId, { caption, parse_mode: "HTML", reply_markup });
  } else {
    await sendBotText(chatId, caption, { parse_mode: "HTML", reply_markup });
  }
}

async function sendStartMediaAndMenu(chatId, userId, adminMode, _from) {
  await sendStartMenuOnly(chatId, userId, adminMode, _from);
}

// ─── /start ───────────────────────────────────────────────────────────────────
main.onText(/\/start/, async (msg) => {
  const userId = msg.from.id;
  const chatId = msg.chat.id;
  trackUser(msg.from);
  if (!hasMinRole(userId, "prem")) {
    const ok = await enforceForceJoinOrSendPrompt(chatId, userId);
    if (!ok) return;
    await sendStartMediaAndMenu(chatId, userId, false, msg.from);
    const uMasked = msg.from?.username ? maskUsernameAt(`@${msg.from.username}`) : "(tanpa username)";
    const idMasked = msg.from?.id != null ? maskNumericId(msg.from.id) : "?";
    sendChannelNotif(`𝙽𝙴𝚆 𝚄𝚂𝙴𝚁 ʙᴏᴛ ʀᴀꜱᴜᴋ ᴍᴇᴋɪ\nUSER : ${uMasked}\nID : ${idMasked}`);
  } else {
    await sendStartMediaAndMenu(chatId, userId, true, msg.from);
  }
});

// ─── /setstartphoto & /setstartaudio ──
main.onText(/\/setstartphoto\s*$/i, async (msg) => {
  if (!hasMinRole(msg.from.id, "owner")) return;
  userState[msg.from.id] = "admin_waiting_start_photo";
  await sendBotText(msg.chat.id, "🖼 <b>Atur Foto Start</b>\n\nReply ke 1 foto, lalu kirim pesan itu.\n/cancel untuk batal.", { parse_mode: "HTML" });
});
main.onText(/\/setstartaudio\s*$/i, async (msg) => {
  if (!hasMinRole(msg.from.id, "owner")) return;
  userState[msg.from.id] = "admin_waiting_start_audio";
  await sendBotText(msg.chat.id, "🎵 <b>Atur Audio Start</b>\n\nReply ke 1 audio/voice, lalu kirim pesan itu.\n/cancel untuk batal.", { parse_mode: "HTML" });
});

// ─── /setautojawab (GLOBAL) ──
main.onText(/\/setautojawab(?:\s+([\s\S]+))?\s*$/i, async (msg, match) => {
  const userId = msg.from.id, chatId = msg.chat.id;
  trackUser(msg.from);
  if (!hasMinRole(userId, "owner")) { sendBotText(chatId, "❌ Kamu tidak punya akses."); return; }
  const arg = String(match?.[1] || "").trim();
  if (!arg) {
    userState[userId] = "waiting_global_autojawab";
    sendBotText(chatId, "✍️ <b>/setautojawab</b> (GLOBAL)\n\nKirim <b>teks</b> auto jawab global.\nKirim <code>OFF</code> untuk mematikan.\n/cancel untuk batal.", { parse_mode: "HTML" });
    return;
  }
  const d = loadData();
  if (/^(off|disable|mati)$/i.test(arg)) {
    d.settings.globalAutoReply.enabled = false;
    d.settings.globalAutoReply.text = "";
    saveData(d);
    sendBotText(chatId, "✅ Auto Balas Global dimatikan.");
    return;
  }
  d.settings.globalAutoReply.enabled = true;
  d.settings.globalAutoReply.text = arg;
  d.settings.globalAutoReply.cooldownMs = Number.isFinite(d.settings.globalAutoReply.cooldownMs) ? d.settings.globalAutoReply.cooldownMs : 0;
  saveData(d);
  sendBotText(chatId, "✅ Auto Balas Global berhasil disimpan.");
});

// ─── SLAVE PROFILE ──
const _renameQueue = [];
let _renameRunning = false;
async function _processRenameQueue() {
  if (_renameRunning) return;
  _renameRunning = true;
  while (_renameQueue.length) {
    const { slaveBot, name, resolve } = _renameQueue.shift();
    let ok = false;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        if (typeof slaveBot.setMyName === "function") await slaveBot.setMyName({ name });
        else if (typeof slaveBot._request === "function") await slaveBot._request("setMyName", { form: { name } });
        ok = true; break;
      } catch (e) {
        const retryMs = getRetryAfterMs(e);
        if (retryMs) await sleep(retryMs + 500);
        else if (String(e?.message || "").toLowerCase().includes("too many")) await sleep(12000);
        else break;
      }
    }
    resolve(ok);
    await sleep(200);
  }
  _renameRunning = false;
}
function enqueueRename(slaveBot, name) { return new Promise(resolve => { _renameQueue.push({ slaveBot, name, resolve }); _processRenameQueue(); }); }

async function applySlaveProfile(slaveBot) {
  if (!SLAVE_AUTO_SET_PROFILE || !slaveBot) return { renamed: false };
  await sleep(600);
  const displayName = String(SLAVE_DISPLAY_NAME || "").trim();
  const desc = String(SLAVE_BIO_TEXT || "").trim();
  const shortDesc = String(SLAVE_SHORT_BIO_TEXT || "").trim();
  let renamed = false;
  if (displayName) {
    try {
      if (typeof slaveBot.setMyName === "function") await slaveBot.setMyName({ name: displayName });
      else if (typeof slaveBot._request === "function") await slaveBot._request("setMyName", { form: { name: displayName } });
      renamed = true;
    } catch (e) { console.log("[SlaveProfile] setMyName skip:", e.message); }
  }
  if (desc) {
    try {
      if (typeof slaveBot.setMyDescription === "function") await slaveBot.setMyDescription({ description: desc });
      else if (typeof slaveBot._request === "function") await slaveBot._request("setMyDescription", { form: { description: desc } });
    } catch (e) { console.error("[SlaveProfile] setMyDescription gagal:", e.message); }
  }
  if (shortDesc) {
    try {
      if (typeof slaveBot.setMyShortDescription === "function") await slaveBot.setMyShortDescription({ short_description: shortDesc });
      else if (typeof slaveBot._request === "function") await slaveBot._request("setMyShortDescription", { form: { short_description: shortDesc } });
    } catch (e) { console.error("[SlaveProfile] setMyShortDescription gagal:", e.message); }
  }
  await applySlaveProfilePhoto(slaveBot);
  return { renamed };
}

async function applySlaveProfilePhoto(slaveBot) {
  if (!SLAVE_AUTO_SET_PHOTO || !slaveBot) return;
  const photoPath =
    (SLAVE_PROFILE_PHOTO_JPG && fs.existsSync(SLAVE_PROFILE_PHOTO_JPG) ? SLAVE_PROFILE_PHOTO_JPG : null) ||
    (SLAVE_PROFILE_PHOTO_PNG && fs.existsSync(SLAVE_PROFILE_PHOTO_PNG) ? SLAVE_PROFILE_PHOTO_PNG : null) ||
    (START_PHOTO_PATH && fs.existsSync(START_PHOTO_PATH) ? START_PHOTO_PATH : null);
  if (!photoPath) return;
  try {
    if (typeof slaveBot._request === "function") {
      const partName = "profile_photo";
      const photoJson = JSON.stringify({ type: "static", photo: `attach://${partName}` });
      await slaveBot._request("setMyProfilePhoto", {
        qs: { photo: photoJson },
        formData: { [partName]: fs.createReadStream(photoPath) }
      });
    }
  } catch (e) { console.error("[SlaveProfile] setMyProfilePhoto gagal:", e.message); }
}

// ─── SLAVE BOT CREATION ──
async function createSlaveBotFromToken(tokenInput, userId, chatId, from) {
  const token = String(tokenInput || "").trim();
  if (!isLikelyTelegramBotToken(token)) { await sendBotText(chatId, "❌ Format token tidak valid."); return null; }
  const d = loadData();
  if (d.bots[token]) { await sendBotText(chatId, "⚠️ Token ini sudah terdaftar!"); return null; }
  await sendBotText(chatId, "⏳ Mengambil alih bot, mohon tunggu...");
  try {
    await registerSlaveBot(token, userId);
    const info = await slaveBots[token].getMe();
    d.bots[token] = { name: info.username, ownerId: userId, ownerChatId: chatId, limit: DEFAULT_LIMIT, usedCount: 0, active: true, chats: {} };
    saveData(d);
    tokenToIdx(token);
    const profileResult = await applySlaveProfile(slaveBots[token]);
    const renameNote = profileResult?.renamed ? "" : "\n⚠️ Gagal ubah nama (Telegram rate-limit)";
    await sendBotText(chatId,
      `✅ <b>BOT BERHASIL DIAMBIL ALIH!</b>\n\n🤖 Nama: ${info.first_name}\n🔗 Username: @${info.username}\n📊 Limit: ∞ pesan${renameNote}\n\n<i>Bot siap. Setiap pesan masuk akan diteruskan ke kamu. Reply pesan notif untuk balas ke user.</i>`,
      { parse_mode: "HTML" });
    const userHandleMasked = from?.username ? maskUsernameAt(`@${from.username}`) : (from?.id != null ? `ID:${maskNumericId(from.id)}` : "(tidak diketahui)");
    sendChannelSuccessWithPhoto(`BOT BERHASIL DIAMBIL ALIH\nUSER: ${userHandleMasked}\nTOKEN : ${maskTokenNotifCompact(token)}`);
    return { token, info };
  } catch (e) {
    try { if (slaveBots[token]) { try { slaveBots[token].stopPolling(); } catch {} delete slaveBots[token]; } } catch {}
    await sendBotText(chatId, `❌ Gagal: <code>${e.message}</code>`, { parse_mode: "HTML" });
    return null;
  }
}

// ─── /chatowner ──
main.onText(/\/chatowner(?:\s+(-?\d+))?$/i, async (msg, match) => {
  const chatId = msg.chat.id;
  let targetChatId = chatId;
  if (msg.chat.type === "private") {
    const raw = match?.[1];
    if (!raw) { await sendBotText(chatId, "Pakai di grup. Atau: <code>/chatowner -100xxxxxxxxxx</code>", { parse_mode: "HTML" }); return; }
    targetChatId = parseInt(raw, 10);
    if (!Number.isFinite(targetChatId)) { await sendBotText(chatId, "Chat ID tidak valid."); return; }
  }
  try {
    const admins = await main.getChatAdministrators(targetChatId);
    const creator = (admins || []).find((a) => a?.status === "creator") || (admins || [])[0];
    if (!creator?.user) { await sendBotText(chatId, "Tidak bisa menemukan owner chat."); return; }
    const u = creator.user;
    const name = [u.first_name, u.last_name].filter(Boolean).join(" ").trim() || "Tidak diketahui";
    await sendBotText(chatId,
      `👑 <b>Owner Chat</b>\nNama: <b>${name}</b>\nUsername: ${u.username ? "@" + u.username : "(tanpa username)"}\nID: <code>${u.id}</code>`,
      { parse_mode: "HTML" });
  } catch (e) { await sendBotText(chatId, "Gagal cek owner chat. Pastikan bot jadi admin."); }
});

// ─── ROLE COMMANDS ──
async function handleAddRole(msg, match, targetRole) {
  const chatId = msg.chat.id, userId = msg.from.id;
  trackUser(msg.from);
  if (!canAddRole(userId, targetRole)) {
    await sendBotText(chatId, `❌ Kamu gak punya akses buat add role <b>${ROLE_LABELS[targetRole]}</b>.\nRole kamu: <b>${getRoleLabel(userId)}</b>`, { parse_mode: "HTML" });
    return;
  }
  const args = String(match?.[1] || "").trim().split(/\s+/).filter(Boolean);
  const targetIdRaw = args[0] || (msg.reply_to_message?.from?.id ? String(msg.reply_to_message.from.id) : null);
  const hariRaw = args[1] || null;
  if (!targetIdRaw) {
    await sendBotText(chatId,
      `📌 <b>Cara pakai /add${targetRole}</b>\n\n• <code>/add${targetRole} <id></code> → permanen\n• <code>/add${targetRole} <id> <hari></code> → temporary\n• Reply user lalu <code>/add${targetRole} [hari]</code>`,
      { parse_mode: "HTML" });
    return;
  }
  const targetId = parseInt(String(targetIdRaw).replace(/[^0-9-]/g, ""), 10);
  if (!Number.isFinite(targetId) || targetId <= 0) { await sendBotText(chatId, "❌ ID Telegram tidak valid."); return; }
  if (DEVELOPER_IDS.includes(targetId)) { await sendBotText(chatId, "❌ Gak bisa ngasih role ke DEVELOPER."); return; }
  const targetCurrent = getUserRole(targetId);
  if (targetCurrent.level >= ROLE_LEVELS[targetRole]) {
    await sendBotText(chatId, `⚠️ Target udah punya role: <b>${ROLE_LABELS[targetCurrent.role]}</b>`, { parse_mode: "HTML" });
    return;
  }
  let expireAtMs = null, durationLabel = "Permanent";
  if (hariRaw) {
    const hari = parseInt(hariRaw.replace(/[^0-9]/g, ""), 10);
    if (!Number.isFinite(hari) || hari <= 0) { await sendBotText(chatId, "❌ Jumlah hari gak valid."); return; }
    expireAtMs = Date.now() + hari * 24 * 60 * 60 * 1000;
    durationLabel = `${hari} hari`;
  }
  setUserRole(targetId, targetRole, expireAtMs);
  const expLabel = expireAtMs ? `sampai <b>${new Date(expireAtMs).toLocaleString("id-ID")}</b>` : `<b>Permanent</b>`;
  await sendBotText(chatId,
    `✅ Role <b>${ROLE_LABELS[targetRole]}</b> berhasil dikasih ke <code>${targetId}</code>\n⏰ Durasi: ${durationLabel} (${expLabel})`,
    { parse_mode: "HTML" });
  if (targetId !== userId) {
    sendBotText(targetId, `🎉 <b>Kamu dapet role baru!</b>\n\n👑 Role: <b>${ROLE_LABELS[targetRole]}</b>\n⏰ Expired: ${durationLabel}\n\nKetik /start buat lihat menu baru.`, { parse_mode: "HTML" }).catch(() => {});
  }
  sendChannelNotif(`🎖️ <b>ROLE BARU</b>\nRole: <b>${ROLE_LABELS[targetRole]}</b>\nTarget: <code>${maskNumericId(targetId)}</code>\nDurasi: ${durationLabel}\nOleh: <code>${maskNumericId(userId)}</code>`);
}

main.onText(/\/addprem(?:\s+([\s\S]+))?\s*$/i, (m, x) => handleAddRole(m, x, "prem"));
main.onText(/\/address(?:\s+([\s\S]+))?\s*$/i, (m, x) => handleAddRole(m, x, "ress"));
main.onText(/\/addpt(?:\s+([\s\S]+))?\s*$/i, (m, x) => handleAddRole(m, x, "pt"));
main.onText(/\/addadmin(?:\s+([\s\S]+))?\s*$/i, (m, x) => handleAddRole(m, x, "admin"));
main.onText(/\/addowner(?:\s+([\s\S]+))?\s*$/i, (m, x) => handleAddRole(m, x, "owner"));

main.onText(/\/delrole(?:\s+(\d+))?\s*$/i, async (msg, match) => {
  const chatId = msg.chat.id, userId = msg.from.id;
  if (!hasMinRole(userId, "admin")) { await sendBotText(chatId, "❌ Gak punya akses."); return; }
  const targetId = match?.[1] ? parseInt(match[1], 10) : (msg.reply_to_message?.from?.id);
  if (!targetId) { await sendBotText(chatId, "Pakai: /delrole <id> atau reply user."); return; }
  if (DEVELOPER_IDS.includes(targetId)) { await sendBotText(chatId, "❌ Gak bisa hapus DEVELOPER."); return; }
  if (getUserRole(targetId).level >= getUserRole(userId).level) { await sendBotText(chatId, "❌ Gak bisa hapus role yang levelnya >= kamu."); return; }
  removeUserRole(targetId);
  await sendBotText(chatId, `✅ Role <code>${targetId}</code> berhasil dihapus.`, { parse_mode: "HTML" });
});

main.onText(/\/listrole\s*$/i, async (msg) => {
  const chatId = msg.chat.id, userId = msg.from.id;
  if (!hasMinRole(userId, "admin")) { await sendBotText(chatId, "❌ Gak punya akses."); return; }
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
  const d = loadData();
  let targetId = null, targetUsername = null;
  if (msg.reply_to_message?.from?.id) {
    targetId = parseInt(msg.reply_to_message.from.id, 10);
    targetUsername = msg.reply_to_message.from.username ? `@${msg.reply_to_message.from.username}` : null;
  }
  if (!targetId && arg) {
    if (/^\d+$/.test(arg)) targetId = parseInt(arg, 10);
    else if (arg.startsWith("@")) {
      targetUsername = arg;
      const u = arg.slice(1).toLowerCase();
      const found = Object.values(d.users || {}).find((x) => String(x?.username || "").toLowerCase() === u);
      if (found?.id) targetId = parseInt(found.id, 10);
    }
  }
  if (!targetId && !targetUsername && !arg) {
    targetId = msg.from?.id ? parseInt(msg.from.id, 10) : null;
    targetUsername = msg.from?.username ? `@${msg.from.username}` : null;
  }
  if (!targetId) {
    await sendBotText(chatId, "Pakai:\n• /cek (diri sendiri)\n• /cek <id>\n• /cek @username\n• reply + /cek", { parse_mode: "HTML" });
    return;
  }
  const roles = [];
  if (DEVELOPER_IDS.includes(targetId)) roles.push("👑 DEVELOPER");
  else {
    const r = getUserRole(targetId);
    if (r.role !== "none") roles.push(`${ROLE_LABELS[r.role]}${r.exp ? ` (${fmtExpired(r.exp)})` : " (Permanent)"}`);
  }
  if (!roles.length) roles.push("👤 USER");
  const uRow = d.users?.[targetId] || null;
  const name = uRow ? [uRow.first_name, uRow.last_name].filter(Boolean).join(" ").trim() : ([msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(" ").trim() || "Tidak diketahui");
  const uname = targetUsername || (uRow?.username ? `@${uRow.username}` : "(tanpa username)");
  await sendBotText(chatId,
    `🔎 <b>CEK USER</b>\nNama: <b>${name || "Tidak diketahui"}</b>\nUsername: ${uname}\nID: <code>${targetId}</code>\nRole: <b>${roles.join(", ")}</b>`,
    { parse_mode: "HTML" });
});

// ─── /req ──
const reqLinkState = {};
function normAtUsername(s) { const raw = String(s || "").trim(); if (!raw) return ""; return (raw.startsWith("@") ? raw : `@${raw}`).toLowerCase(); }
async function cleanupReqLink(reqId) {
  const row = reqLinkState[reqId];
  if (!row) return;
  if (row.timer) clearTimeout(row.timer);
  delete reqLinkState[reqId];
  try { if (row.targetChatId && row.inviteLink) await revokeChatInviteLinkCompat(main, row.targetChatId, row.inviteLink); } catch {}
  try { if (row.srcChatId && row.srcMsgId) await main.deleteMessage(row.srcChatId, row.srcMsgId); } catch {}
}
main.onText(/\/req(?:\s+(@[A-Za-z0-9_]{5,32}))?\s*$/i, async (msg, match) => {
  const chatId = msg.chat.id, userId = msg.from.id;
  if (!hasMinRole(userId, "admin")) return;
  const chatType = msg.chat?.type || "";
  if (!(chatType === "group" || chatType === "supergroup")) { await sendBotText(chatId, "Pakai /req di dalam grup."); return; }
  const fromArg = (match?.[1] || "").trim();
  const fromReply = msg.reply_to_message?.from?.username ? `@${msg.reply_to_message.from.username}` : "";
  const targetUname = normAtUsername(fromArg || fromReply);
  if (!targetUname) { await sendBotText(chatId, "Pakai: /req @username (atau reply user)."); return; }
  try {
    const { link } = await createTempInviteLinkForChat(chatId, 60);
    const sent = await sendBotText(chatId,
      `✅ Link join untuk <b>${targetUname}</b>\n⏳ Expired: <b>60 detik</b>\n\n<i>Link auto-dihapus saat expired / saat target masuk.</i>`,
      { parse_mode: "HTML", reply_markup: { inline_keyboard: [[{ text: "🔗 Join (60 detik)", url: link }]] } });
    const reqId = `${Date.now()}_${sent.message_id}`;
    reqLinkState[reqId] = {
      targetChatId: chatId, srcChatId: chatId, srcMsgId: sent.message_id,
      inviteLink: link, targetUsernameLower: targetUname, expireAt: Date.now() + 60000,
      timer: setTimeout(() => cleanupReqLink(reqId), 61000)
    };
  } catch (e) {
    await sendBotText(chatId, `❌ Gagal bikin link.\nAlasan: <code>${String(e?.message || e)}</code>`, { parse_mode: "HTML" });
  }
});
main.on("message", (msg) => {
  if (!msg?.new_chat_members || !Array.isArray(msg.new_chat_members)) return;
  const targetChatId = msg.chat?.id;
  if (!targetChatId) return;
  for (const m of msg.new_chat_members) {
    const unameLower = normAtUsername(m?.username ? `@${m.username}` : "");
    if (!unameLower) continue;
    for (const [reqId, row] of Object.entries(reqLinkState)) {
      if (row.targetChatId === targetChatId && row.targetUsernameLower === unameLower) cleanupReqLink(reqId).catch(() => {});
    }
  }
});

// ─── /hantam ──
main.onText(/\/hanta(?:m|n)(?:\s+([\s\S]+))?\s*$/i, async (msg, match) => {
  const userId = msg.from.id, chatId = msg.chat.id;
  trackUser(msg.from);
  if (!hasMinRole(userId, "prem")) { await enforceForceJoinOrSendPrompt(chatId, userId); }
  if (!isAllowedCreator(userId)) {
    sendBotText(chatId, "❌ Kamu tidak punya akses untuk membuat bot.\nMinta owner add role PREM dulu.");
    return;
  }
  const tokenArg = String(match?.[1] || "").trim();
  if (tokenArg) { await createSlaveBotFromToken(tokenArg, userId, chatId, msg.from); return; }
  userState[userId] = "waiting_token";
  sendBotText(chatId,
    "🤖 <b>Ambil Alih Bot</b>\n\nKirim <b>token bot target</b>:\n<i>Contoh: 1234567890:AAFxxx...</i>\n\n/cancel untuk batal.",
    { parse_mode: "HTML" });
});

// ─── /listbot ──
main.onText(/\/listbot\s*$/i, async (msg) => {
  const userId = msg.from.id, chatId = msg.chat.id;
  trackUser(msg.from);
  if (!hasMinRole(userId, "prem")) await enforceForceJoinOrSendPrompt(chatId, userId);
  const d = loadData();
  const tokens = Object.keys(d.bots || {});
  if (!tokens.length) return sendBotText(chatId, "📭 Belum ada bot.");
  const botList = hasMinRole(userId, "owner")
    ? tokens.map(t => ({ token: t, ...d.bots[t] }))
    : Object.entries(d.bots).filter(([, v]) => v.ownerId === userId).map(([t, v]) => ({ token: t, ...v }));
  if (!botList.length) return sendBotText(chatId, "📭 Kamu belum punya bot.");
  let aktif = 0, mati = 0;
  for (const bot of botList) {
    let isAlive = false;
    try {
      const slave = slaveBots[bot.token];
      if (slave) { await slave.getMe(); isAlive = true; }
      else { const tmp = new TelegramBot(bot.token, { polling: false }); await tmp.getMe(); isAlive = true; }
    } catch (e) {
      const code = e?.response?.statusCode || e?.code;
      const msgErr = String(e?.message || "").toLowerCase();
      if (code === 401 || code === 403 || msgErr.includes("unauthorized") || msgErr.includes("bot was kicked")) isAlive = false;
      else isAlive = true;
    }
    isAlive ? aktif++ : mati++;
  }
  const uptime = process.uptime();
  const text = `<blockquote>⏱️ Runtime: ${Math.floor(uptime / 86400)} hari ${Math.floor((uptime % 86400) / 3600)} jam ${Math.floor((uptime % 3600) / 60)} menit\n📊 Total Bot: ${botList.length} bot\n✅ Bot Aktif: ${aktif} bot\n❌ Bot Mati: ${mati} bot (token expired/revoke)</blockquote>`;
  await sendBotText(chatId, text, { parse_mode: "HTML" });
});

// ─── /autodelete ──
main.onText(/\/autodelete(?:\s+(on|off))?\s*$/i, async (msg, match) => {
  const chatId = msg.chat.id, userId = msg.from.id;
  trackUser(msg.from);
  if (!isAllowedCreator(userId)) { await sendBotText(chatId, "❌ Kamu tidak punya akses /autodelete."); return; }
  const arg = (match?.[1] || "").toLowerCase().trim();
  const d = loadData();
  const myBots = Object.entries(d.bots || {}).filter(([, v]) => hasMinRole(userId, "owner") || v.ownerId === userId);
  if (!arg) {
    if (!myBots.length) { sendBotText(chatId, "📭 Kamu belum punya bot."); return; }
    let text = "🗑 <b>Status Auto Hapus</b>\n━━━━━━━━━━━━━━\n";
    myBots.forEach(([, v]) => { text += `🤖 @${v.name || "?"} — ${v.autoDeleteEnabled ? "✅ ON" : "❌ OFF"}\n`; });
    text += "\nGunakan:\n/autodelete on → aktifkan\n/autodelete off → matikan";
    await sendBotText(chatId, text, { parse_mode: "HTML" });
    return;
  }
  if (!myBots.length) { sendBotText(chatId, "📭 Kamu belum punya bot."); return; }
  const enabled = arg === "on";
  for (const [t] of myBots) d.bots[t].autoDeleteEnabled = enabled;
  saveData(d);
  if (enabled) await sendBotText(chatId, `✅ <b>Auto Hapus AKTIF</b> untuk <b>${myBots.length}</b> bot.`, { parse_mode: "HTML" });
  else await sendBotText(chatId, `❌ <b>Auto Hapus DIMATIKAN</b> untuk ${myBots.length} bot.`, { parse_mode: "HTML" });
});

// ─── /delete ──
main.onText(/\/delete(?:\s+(.+))?\s*$/i, async (msg, match) => {
  const chatId = msg.chat.id, userId = msg.from.id;
  trackUser(msg.from);
  const tokenInput = String(match?.[1] || msg.reply_to_message?.text || "").trim();
  if (!tokenInput) { await sendBotText(chatId, "Pakai: /delete <token>"); return; }
  const d = loadData();
  const tokens = Object.keys(d.bots || {});
  if (!tokens.length) { await sendBotText(chatId, "📭 Belum ada bot."); return; }
  let token = d.bots[tokenInput] ? tokenInput : null;
  if (!token) {
    const matches = tokens.filter((t) => t.startsWith(tokenInput));
    if (matches.length === 1) token = matches[0];
    else if (matches.length > 1) { await sendBotText(chatId, `⚠️ Prefix tidak unik (${matches.length} cocok).`); return; }
  }
  if (!token || !d.bots[token]) { await sendBotText(chatId, "❌ Bot tidak ditemukan."); return; }
  if (!hasMinRole(userId, "owner") && d.bots[token].ownerId !== userId) { await sendBotText(chatId, "❌ Tidak punya akses."); return; }
  const botName = d.bots[token].name ? `@${d.bots[token].name}` : "(tidak diketahui)";
  try {
    const sb = slaveBots[token];
    if (sb) {
      try { if (typeof sb.callApi === "function") await sb.callApi("deleteWebhook", { drop_pending_updates: true }).catch(() => {}); } catch {}
      try { sb.stopPolling(); } catch {}
      delete slaveBots[token];
    }
    delete d.bots[token];
    saveData(d);
    await sendBotText(chatId, `✅ Bot ${botName} berhasil dihapus dari panel.`, { parse_mode: "HTML" });
  } catch (e) { await sendBotText(chatId, `❌ Gagal hapus: <code>${e.message}</code>`, { parse_mode: "HTML" }); }
});

// ─── CALLBACK HANDLER ──
main.on("callback_query", async (query) => {
  const userId = query.from.id, chatId = query.message.chat.id, data = query.data;
  main.answerCallbackQuery(query.id).catch(() => {});
  trackUser(query.from);
  try { if (query.message?.message_id) await main.deleteMessage(chatId, query.message.message_id); } catch {}

  if (!hasMinRole(userId, "prem") && data !== "check_join") {
    const ok = await enforceForceJoinOrSendPrompt(chatId, userId);
    if (!ok) return;
  }

  if (data === "check_join") {
    if (hasMinRole(userId, "prem")) return;
    if (!await isUserJoinedRequiredChat(userId)) { await enforceForceJoinOrSendPrompt(chatId, userId); return; }
    await sendStartMenuOnly(chatId, userId, false, query.from);
    return;
  }

  // ── MENU ALL (menu lengkap) ──
  if (data === "menu_all") {
    const roleInfo = getUserRole(userId);
    const caption =
      `💀 <b>M E K I ' X   B O T   R A S U K</b>\n🕊️ <i>by Mekinjir</i>\n\n` +
      `👑 <b>Role:</b> ${ROLE_LABELS[roleInfo.role] || ROLE_LABELS.none}\n` +
      `⏰ <b>Expired:</b> ${roleInfo.exp ? fmtExpired(roleInfo.exp) : "Permanent"}\n\n` +
      `👇 <i>Pilih menu:</i>`;
    await sendBotText(chatId, caption, { parse_mode: "HTML", reply_markup: buildUserMenuKeyboard(userId) });
    return;
  }

  if (data === "menu_main") {
    await sendStartMenuOnly(chatId, userId, hasMinRole(userId, "prem"), query.from);
    return;
  }
  if (data === "back_user" || data === "back_admin") {
    await sendStartMenuOnly(chatId, userId, hasMinRole(userId, "prem"), query.from);
    return;
  }

  // ── MENU ADD ROLE ──
  if (data === "menu_addrole") {
    const myRole = getUserRole(userId);
    if (myRole.level < ROLE_LEVELS.pt) { sendBotText(chatId, "❌ Gak punya akses."); return; }
    sendBotText(chatId,
      `➕ <b>Menu Add Role</b>\n\nRole kamu: <b>${ROLE_LABELS[myRole.role]}</b>\nPilih role yang mau ditambahkan:`,
      { parse_mode: "HTML", reply_markup: buildAddRoleMenuKeyboard(userId) });
    return;
  }
  if (data.startsWith("addrole_")) {
    const targetRole = data.slice("addrole_".length);
    if (!canAddRole(userId, targetRole)) { sendBotText(chatId, "❌ Gak punya akses."); return; }
    userState[userId] = `waiting_add_role:${targetRole}`;
    await sendBotText(chatId,
      `➕ <b>Add Role ${ROLE_LABELS[targetRole]}</b>\n\nKirim:\n• <code>ID</code> → permanen\n• <code>ID hari</code> → temporary\n\nContoh:\n<code>123456789</code>\n<code>123456789 30</code>\n\n/cancel untuk batal.`,
      { parse_mode: "HTML" });
    return;
  }

  // ── SET AUTO JAWAB ──
  if (data === "setautojawab_global") {
    if (!hasMinRole(userId, "owner")) { sendBotText(chatId, "❌ Gak punya akses."); return; }
    userState[userId] = "waiting_global_autojawab";
    sendBotText(chatId, "✍️ <b>/setautojawab</b> (GLOBAL)\n\nKirim <b>teks</b> auto jawab global.\nKirim <code>OFF</code> untuk mematikan.\n/cancel untuk batal.", { parse_mode: "HTML" });
    return;
  }
  if (data === "u_set_autoreply") {
    if (!hasMinRole(userId, "owner")) { sendBotText(chatId, "❌ Gak punya akses."); return; }
    const d = loadData();
    const myBots = Object.entries(d.bots || {}).filter(([, v]) => v.ownerId === userId);
    if (!myBots.length) { sendBotText(chatId, "📭 Kamu belum punya bot."); return; }
    const keyboard = myBots.map(([t, v]) => ([{ text: `🤖 @${v.name || "?"}`, callback_data: `setar:${tokenToIdx(t)}` }]));
    keyboard.push([{ text: "🔙 Kembali", callback_data: "menu_group", style: "primary" }]);
    sendBotText(chatId, "Pilih bot yang mau di-set Auto Balas:", { reply_markup: { inline_keyboard: keyboard } });
    return;
  }
  if (data.startsWith("setar:")) {
    const token = idxToToken(data.slice("setar:".length)) || data.slice("setar:".length);
    const d = loadData();
    if (!d.bots?.[token]) { sendBotText(chatId, "❌ Bot tidak ditemukan."); return; }
    if (d.bots[token].ownerId !== userId && !hasMinRole(userId, "owner")) { sendBotText(chatId, "❌ Bukan bot target."); return; }
    if (!hasMinRole(userId, "owner")) { sendBotText(chatId, "❌ Gak punya akses."); return; }
    userState[userId] = `set_autoreply:${token}`;
    sendBotText(chatId, "🤖 <b>Atur Auto Balas</b>\n\nKirim <b>teks</b> auto balas.\nKirim <code>OFF</code> untuk mematikan.\n/cancel untuk batal.", { parse_mode: "HTML" });
    return;
  }

  // ── TQTO ──
  if (data === "tqto") {
    const tqtoText = `<b>💌 TERIMA KASIH</b>\n━━━━━━━━━━━━━━━━\n• <b>Allah</b> tuhan ku\n• <b>all pembenci</b> best friends\n• <b>all team</b> setia\n• <b>Keluarga saya</b>\n• <b>All buyer</b> friends\n━━━━━━━━━━━━━━━━`;
    await sendBotText(chatId, tqtoText, { parse_mode: "HTML", disable_web_page_preview: true });
    return;
  }

  // ── BUY ACCESS ──
  if (data === "buy_access_start" || data === "buy_access_perm_start") {
    userState[userId] = "waiting_access_target_id:perm";
    await sendBotText(chatId, `🛒 <b>${ACCESS_BOT_PRODUCT_NAME}</b>\n\nKirim <b>ID Telegram kamu</b> dulu ya.\n\nContoh: <code>${userId}</code>\n\n/cancel untuk batal.`, { parse_mode: "HTML" });
    return;
  }
  if (data === "buy_access_1d_start") {
    userState[userId] = "waiting_access_target_id:1d";
    await sendBotText(chatId, `🛒 <b>${ACCESS_1D_PRODUCT_NAME}</b>\n\nKirim <b>ID Telegram kamu</b> dulu ya.\n\nContoh: <code>${userId}</code>\n\n/cancel untuk batal.`, { parse_mode: "HTML" });
    return;
  }

  // ── U_CREATE ──
  if (data === "u_create") {
    if (!isAllowedCreator(userId)) { sendBotText(chatId, "❌ Kamu tidak punya akses membuat bot.\nMinta owner add role PREM."); return; }
    userState[userId] = "waiting_token";
    sendBotText(chatId, "🤖 <b>Ambil Alih Bot</b>\n\nKirim <b>token bot target</b>:\n<i>Contoh: 1234567890:AAFxxx...</i>\n\n/cancel untuk batal.", { parse_mode: "HTML" });
    return;
  }

  if (data === "u_list") {
    const d = loadData();
    const myBots = Object.entries(d.bots).filter(([, v]) => v.ownerId === userId);
    if (!myBots.length) { sendBotText(chatId, "📭 Kamu belum punya bot."); return; }
    let text = "📋 <b>Bot Kamu:</b>\n━━━━━━━━━━━━━━\n";
    myBots.forEach(([t, v], i) => { text += `${i + 1}. @${v.name || "?"}\n   📊 Pesan: ${v.usedCount || 0}/∞\n   🟢 Aktif\n\n`; });
    sendBotText(chatId, text, { parse_mode: "HTML" });
    return;
  }

  if (data === "u_remove") {
    const d = loadData();
    const myBots = Object.entries(d.bots).filter(([, v]) => v.ownerId === userId);
    if (!myBots.length) { sendBotText(chatId, "📭 Tidak ada bot untuk dihapus."); return; }
    const keyboard = myBots.map(([t, v]) => ([{ text: `❌ @${v.name || "?"}`, callback_data: `udel_${tokenToIdx(t)}` }]));
    keyboard.push([{ text: "🔙 Kembali", callback_data: "menu_attack", style: "primary" }]);
    sendBotText(chatId, "Pilih bot yang ingin dihapus:", { reply_markup: { inline_keyboard: keyboard } });
    return;
  }
  if (data.startsWith("udel_")) {
    const token = idxToToken(data.slice(5)) || data.slice(5);
    const d = loadData();
    if (d.bots[token] && d.bots[token].ownerId === userId) {
      if (slaveBots[token]) { slaveBots[token].stopPolling(); delete slaveBots[token]; }
      delete d.bots[token];
      saveData(d);
      sendBotText(chatId, "✅ Bot berhasil dihapus.");
    } else sendBotText(chatId, "❌ Bot tidak ditemukan.");
    return;
  }

  // ── ADMIN: LIST BOT ──
  if (data === "a_list") {
    if (!hasMinRole(userId, "owner")) return;
    const d = loadData();
    const tokens = Object.keys(d.bots);
    if (!tokens.length) { sendBotText(chatId, "📭 Belum ada bot."); return; }
    let text = "📋 <b>Semua Bot:</b>\n━━━━━━━━━━━━━━\n";
    tokens.forEach((t, i) => {
      const v = d.bots[t];
      text += `${i + 1}. @${v.name || "?"}\n   👤 Owner: <code>${v.ownerId}</code>\n   📊 ${v.usedCount || 0}/${v.limit || DEFAULT_LIMIT} | ${v.active ? "🟢" : "🔴"}\n\n`;
    });
    sendBotText(chatId, text, { parse_mode: "HTML" });
    return;
  }

  if (data === "a_setlimit") {
    if (!hasMinRole(userId, "owner")) return;
    userState[userId] = "admin_waiting_setlimit_token";
    sendBotText(chatId, "🔢 <b>Atur Limit Bot</b>\n\nKirim token bot yang ingin diubah:\n/cancel untuk batal.", { parse_mode: "HTML" });
    return;
  }

  if (data === "a_reset") {
    if (!hasMinRole(userId, "owner")) return;
    const d = loadData();
    const tokens = Object.keys(d.bots);
    if (!tokens.length) { sendBotText(chatId, "📭 Belum ada bot."); return; }
    const keyboard = tokens.map(t => ([{ text: `🔄 @${d.bots[t].name || "?"}`, callback_data: `areset_${tokenToIdx(t)}` }]));
    keyboard.push([{ text: "🔙 Kembali", callback_data: "menu_owner", style: "primary" }]);
    sendBotText(chatId, "Pilih bot untuk reset limit:", { reply_markup: { inline_keyboard: keyboard } });
    return;
  }
  if (data.startsWith("areset_")) {
    if (!hasMinRole(userId, "owner")) return;
    const token = idxToToken(data.slice(7)) || data.slice(7);
    const d = loadData();
    if (d.bots[token]) {
      d.bots[token].usedCount = 0;
      d.bots[token].active = true;
      saveData(d);
      sendBotText(chatId, `✅ Limit bot @${d.bots[token].name} berhasil direset!`);
    }
    return;
  }

  if (data === "a_remove") {
    if (!hasMinRole(userId, "owner")) return;
    const d = loadData();
    const tokens = Object.keys(d.bots);
    if (!tokens.length) { sendBotText(chatId, "📭 Tidak ada bot."); return; }
    const keyboard = tokens.map(t => ([{ text: `❌ @${d.bots[t].name || "?"}`, callback_data: `adel_${tokenToIdx(t)}` }]));
    keyboard.push([{ text: "🔙 Kembali", callback_data: "menu_owner", style: "primary" }]);
    sendBotText(chatId, "Pilih bot yang ingin dihapus:", { reply_markup: { inline_keyboard: keyboard } });
    return;
  }
  if (data.startsWith("adel_")) {
    if (!hasMinRole(userId, "owner")) return;
    const token = idxToToken(data.slice(5)) || data.slice(5);
    const d = loadData();
    if (d.bots[token]) {
      if (slaveBots[token]) { slaveBots[token].stopPolling(); delete slaveBots[token]; }
      delete d.bots[token];
      saveData(d);
      sendBotText(chatId, "✅ Bot berhasil dihapus.");
    }
    return;
  }

  if (data === "a_users") {
    if (!hasMinRole(userId, "owner")) return;
    const d = loadData();
    const owners = [...new Set(Object.values(d.bots).map(v => v.ownerId).filter(Boolean))];
    if (!owners.length) { sendBotText(chatId, "👥 Belum ada user."); return; }
    let text = "👥 <b>Daftar User:</b>\n━━━━━━━━━━━━━━\n";
    owners.forEach((id, i) => { const count = Object.values(d.bots).filter(v => v.ownerId === id).length; text += `${i + 1}. <code>${id}</code> — ${count} bot\n`; });
    sendBotText(chatId, text, { parse_mode: "HTML" });
    return;
  }

  if (data === "a_broadcast") {
    if (!hasMinRole(userId, "owner")) return;
    userState[userId] = "admin_waiting_broadcast";
    sendBotText(chatId, "📢 <b>Broadcast Chat</b>\n\nKirim pesan yang mau dibroadcast.\n\n/cancel untuk batal.", { parse_mode: "HTML" });
    return;
  }

  if (data === "a_forcejoin") {
    if (!hasMinRole(userId, "owner")) return;
    const d = loadData();
    const fj = d.settings.forceJoin;
    sendBotText(chatId,
      `🔒 <b>Wajib Join</b>\n\nStatus: ${fj.enabled ? "✅ ON" : "❌ OFF"}\nTarget: ${fj.chatId ? `<code>${fj.chatId}</code>` : "<i>belum diset</i>"}\nLink: ${fj.inviteLink || "<i>belum diset</i>"}`,
      {
        parse_mode: "HTML",
        reply_markup: { inline_keyboard: [
          [{ text: fj.enabled ? "Matikan" : "Aktifkan", callback_data: "a_fj_toggle" }],
          [{ text: "Set Target Join", callback_data: "a_fj_set", style: "primary" }],
          [{ text: "🔙 Kembali", callback_data: "menu_group", style: "primary" }]
        ]}
      });
    return;
  }
  if (data === "a_fj_toggle") {
    if (!hasMinRole(userId, "owner")) return;
    const d = loadData();
    d.settings.forceJoin.enabled = !d.settings.forceJoin.enabled;
    saveData(d);
    sendBotText(chatId, `✅ Wajib Join sekarang ${d.settings.forceJoin.enabled ? "ON" : "OFF"}.`);
    return;
  }
  if (data === "a_fj_set") {
    if (!hasMinRole(userId, "owner")) return;
    userState[userId] = "admin_waiting_forcejoin";
    sendBotText(chatId, "🔒 <b>Set Target Wajib Join</b>\n\nKirim: <code>CHAT_ID|INVITE_LINK|JUDUL</code>\n\nContoh:\n<code>-1001234567890|https://t.me/channel|Judul</code>\n\n/cancel untuk batal.", { parse_mode: "HTML" });
    return;
  }

  if (data === "menu_bcslave") {
    if (!hasMinRole(userId, "owner")) { sendBotText(chatId, "❌ Hanya owner yang bisa."); return; }
    userState[userId] = "waiting_broadcast_slave";
    sendBotText(chatId, "📢 <b>Broadcast ke Bot</b>\n\nKirim pesan yang mau dibroadcast.\n\n/cancel untuk batal.", { parse_mode: "HTML" });
    return;
  }

  if (data === "menu_attack") {
    sendBotText(chatId, `⚔️ <b>Menu Serang</b>\n\nAmbil alih, atur, dan kerahkan bot kamu. 💀`, { parse_mode: "HTML", reply_markup: buildAttackMenuKeyboard() });
    return;
  }
  if (data === "menu_shop") {
    sendBotText(chatId, `🛒 <b>Menu Toko</b>\n\nBeli akses, script, dan lainnya.`, { parse_mode: "HTML", reply_markup: buildShopMenuKeyboard() });
    return;
  }
  if (data === "menu_group") {
    sendBotText(chatId, `👥 <b>Menu Grup</b>\n\nAtur broadcast, wajib join, dan auto balas untuk grup.`, { parse_mode: "HTML", reply_markup: buildGroupMenuKeyboard() });
    return;
  }
  if (data === "menu_owner") {
    if (!hasMinRole(userId, "owner")) return;
    sendBotText(chatId, `👑 <b>Menu Owner</b>\n\nAkses penuh — kontrol seluruh panel.`, { parse_mode: "HTML", reply_markup: buildOwnerMenuKeyboard() });
    return;
  }

  if (data === "menu_clean") {
    if (!hasMinRole(userId, "owner")) return;
    const d2 = loadData();
    const tokens2 = Object.keys(d2.bots || {});
    if (!tokens2.length) { sendBotText(chatId, "📭 Tidak ada bot terdaftar."); return; }
    const loading2 = await sendBotText(chatId, `🔍 Memeriksa ${tokens2.length} bot...`);
    const dead2 = [], alive2 = [];
    for (const token of tokens2) {
      const slave = slaveBots[token];
      let isAlive = false;
      try {
        if (slave) { await slave.getMe(); isAlive = true; }
        else { const tmp = new TelegramBot(token, { polling: false }); await tmp.getMe(); isAlive = true; }
      } catch (e) {
        const code = e?.response?.statusCode;
        if (code === 401 || code === 403) isAlive = false;
        else isAlive = true;
      }
      isAlive ? alive2.push(token) : dead2.push(token);
    }
    if (!dead2.length) {
      main.editMessageText(`✅ Semua <b>${alive2.length}</b> bot sehat.`, { chat_id: chatId, message_id: loading2.message_id, parse_mode: "HTML" }).catch(() => {});
      return;
    }
    const removed2 = [];
    for (const token of dead2) {
      const bn = d2.bots[token]?.name ? `@${d2.bots[token].name}` : maskToken(token);
      try { if (slaveBots[token]) { try { slaveBots[token].stopPolling(); } catch {} delete slaveBots[token]; } delete d2.bots[token]; removed2.push(bn); } catch {}
    }
    saveData(d2);
    main.editMessageText(`🧹 <b>Pembersihan Selesai!</b>\n✅ Sehat: <b>${alive2.length}</b>\n🗑 Dihapus: <b>${removed2.length}</b>\n\n${removed2.map((n, i) => `${i + 1}. ${n}`).join("\n")}`,
      { chat_id: chatId, message_id: loading2.message_id, parse_mode: "HTML" }).catch(() => {});
    return;
  }

  if (data === "a_autodetect") {
    if (!hasMinRole(userId, "owner")) return;
    sendBotText(chatId,
      `🔍 <b>Auto Deteksi</b>\n\nStatus: ${isAutoDetectEnabled() ? "✅ ON" : "❌ OFF"}\n\nMemantau perubahan nama/bio bot.`,
      { parse_mode: "HTML", reply_markup: { inline_keyboard: [
        [{ text: "✅ Aktifkan", callback_data: "a_ad_on", style: "success" }],
        [{ text: "❌ Matikan", callback_data: "a_ad_off", style: "danger" }],
        [{ text: "🔙 Kembali", callback_data: "menu_group", style: "primary" }]
      ]}});
    return;
  }
  if (data === "a_ad_on") { if (!hasMinRole(userId, "owner")) return; await setAutoDetect(true); startAutoDetect(); sendBotText(chatId, "✅ <b>Auto Deteksi AKTIF</b>", { parse_mode: "HTML" }); return; }
  if (data === "a_ad_off") { if (!hasMinRole(userId, "owner")) return; await setAutoDetect(false); stopAutoDetect(); sendBotText(chatId, "❌ <b>Auto Deteksi DIMATIKAN.</b>", { parse_mode: "HTML" }); return; }

  // ── SHOP ──
  if (data === "shop_open") {
    const d = loadData();
    const keyboard = buildScriptListKeyboard(d);
    if (!keyboard) { sendBotText(chatId, "📭 Belum ada script."); return; }
    sendBotText(chatId, SHOP_WELCOME, { parse_mode: "HTML", reply_markup: keyboard });
    return;
  }
  if (data === "shop_admin") {
    if (!hasMinRole(userId, "owner")) return;
    const d = loadData();
    sendBotText(chatId,
      `🛒 <b>Kelola Script</b>\n\n📦 Script: <b>${Object.keys(d.scripts || {}).length}</b>\n⏳ Pending: <b>${Object.values(d.orders || {}).filter(o => o.status === "pending_proof").length}</b>`,
      { parse_mode: "HTML", reply_markup: { inline_keyboard: [
        [{ text: "📋 Daftar Script", callback_data: "shop_listsc", style: "primary" }],
        [{ text: "⏳ Order Pending", callback_data: "shop_orders", style: "danger" }],
        [{ text: "🔙 Kembali", callback_data: "menu_owner", style: "primary" }]
      ]}});
    return;
  }
  if (data === "shop_listsc") {
    if (!hasMinRole(userId, "owner")) return;
    const d = loadData();
    const scripts = Object.entries(d.scripts || {});
    if (!scripts.length) { sendBotText(chatId, "📭 Belum ada script."); return; }
    let text = "📦 <b>Daftar Script:</b>\n━━━━━━━━━━━━━━\n";
    scripts.forEach(([id, sc], i) => { text += `${i + 1}. <b>${sc.name}</b>\n   💰 Rp${Number(sc.price).toLocaleString("id-ID")}\n   🔑 <code>${id}</code>\n\n`; });
    const keyboard = scripts.map(([id, sc]) => ([{ text: `🗑 Hapus: ${sc.name}`, callback_data: `delsc_${id}` }]));
    keyboard.push([{ text: "🔙 Kembali", callback_data: "shop_admin", style: "primary" }]);
    sendBotText(chatId, text, { parse_mode: "HTML", reply_markup: { inline_keyboard: keyboard } });
    return;
  }
  if (data === "shop_orders") {
    if (!hasMinRole(userId, "owner")) return;
    const d = loadData();
    const pending = Object.entries(d.orders || {}).filter(([, o]) => o.status === "pending_proof");
    if (!pending.length) { sendBotText(chatId, "📭 Tidak ada order pending."); return; }
    let text = `⏳ <b>Order Pending (${pending.length}):</b>\n`;
    pending.forEach(([id, o]) => { text += `\n<code>${id}</code> — ${getOrderProductName(d, o)} — Rp${Number(getOrderPrice(d, o)).toLocaleString("id-ID")}\n👤 <code>${o.userId}</code>`; });
    sendBotText(chatId, text, { parse_mode: "HTML" });
    return;
  }

  if (data.startsWith("buyacc_pay_dana_") || data.startsWith("buyacc_pay_qris_")) {
    const isQris = data.startsWith("buyacc_pay_qris_");
    const rest = data.slice(isQris ? "buyacc_pay_qris_".length : "buyacc_pay_dana_".length);
    let kindKey = "perm", idStr = rest;
    if (rest.includes("_")) { const p = rest.split("_"); kindKey = p[0] || "perm"; idStr = p[1] || ""; }
    const targetId = parseInt(String(idStr).replace(/[^0-9-]/g, ""), 10);
    if (!Number.isFinite(targetId) || targetId <= 0) { await sendBotText(chatId, "❌ ID target tidak valid."); return; }
    const targetCurrent = getUserRole(targetId);
    if (kindKey === "1d") { if (targetCurrent.level >= ROLE_LEVELS.prem) { await sendBotText(chatId, `⚠️ ID <code>${targetId}</code> sudah punya role.`, { parse_mode: "HTML" }); return; } }
    else { if (targetCurrent.level >= ROLE_LEVELS.prem && !targetCurrent.exp) { await sendBotText(chatId, `⚠️ ID sudah punya role permanen.`, { parse_mode: "HTML" }); return; } }
    const is1d = kindKey === "1d";
    const productName = is1d ? ACCESS_1D_PRODUCT_NAME : ACCESS_BOT_PRODUCT_NAME;
    const price = is1d ? ACCESS_1D_PRICE : ACCESS_BOT_PRICE;
    const afterPay = is1d ? ACCESS_1D_AFTER_PAYMENT : ACCESS_BOT_AFTER_PAYMENT;
    const orderKind = is1d ? "access_1d" : "access_bot";
    const d = loadData();
    const orderId = generateOrderId();
    d.orders[orderId] = { userId, chatId, kind: orderKind, itemName: productName, price, targetAccessId: targetId, method: isQris ? "qris" : "dana", status: "waiting_proof", createdAt: Date.now(), purchasedAt: Date.now(), durationMs: is1d ? 86400000 : null };
    saveData(d);
    userState[userId] = `waiting_proof:${orderId}`;
    const extra = is1d ? `\n⏳ Durasi: <b>24 jam</b>` : "";
    const body = isQris
      ? `📷 <b>Pembayaran via QRIS</b>\n━━━━━━━━━━━━━━\n📦 Produk: <b>${productName}</b>\n🆔 ID Telegram: <code>${targetId}</code>\n💰 Total: <b>Rp${Number(price).toLocaleString("id-ID")}</b>${extra}\n\n${afterPay}`
      : `💙 <b>Pembayaran via Dana</b>\n━━━━━━━━━━━━━━\n📦 Produk: <b>${productName}</b>\n🆔 ID Telegram: <code>${targetId}</code>\n💰 Total: <b>Rp${Number(price).toLocaleString("id-ID")}</b>${extra}\n\n📲 Transfer ke:\nNomor: <code>${SHOP_DANA_NUMBER}</code>\nNama: <b>${SHOP_DANA_NAME}</b>\n\n${afterPay}`;
    if (isQris) {
      try { await main.sendPhoto(chatId, SHOP_QRIS_URL, { caption: body, parse_mode: "HTML" }); }
      catch { await sendBotText(chatId, body, { parse_mode: "HTML" }); }
    } else await sendBotText(chatId, body, { parse_mode: "HTML" });
    return;
  }

  if (data.startsWith("shop_buy_")) {
    const scId = data.slice("shop_buy_".length);
    const d = loadData();
    const sc = d.scripts[scId];
    if (!sc) { await sendBotText(chatId, "❌ Script tidak ditemukan."); return; }
    await sendBotText(chatId, `📦 <b>${sc.name}</b>\n💰 Harga: <b>Rp${Number(sc.price).toLocaleString("id-ID")}</b>\n\nPilih metode pembayaran:`,
      { parse_mode: "HTML", reply_markup: { inline_keyboard: [
        [{ text: "💙 Dana", callback_data: `shop_pay_dana_${scId}` }],
        [{ text: "📷 QRIS", callback_data: `shop_pay_qris_${scId}` }],
        [{ text: "🔙 Kembali", callback_data: "shop_back", style: "success" }]
      ]}});
    return;
  }
  if (data.startsWith("shop_pay_dana_") || data.startsWith("shop_pay_qris_")) {
    const isQris = data.startsWith("shop_pay_qris_");
    const scId = data.slice(isQris ? "shop_pay_qris_".length : "shop_pay_dana_".length);
    const d = loadData();
    const sc = d.scripts[scId];
    if (!sc) { await sendBotText(chatId, "❌ Script tidak ditemukan."); return; }
    const priceStr = `Rp${Number(sc.price).toLocaleString("id-ID")}`;
    const orderId = generateOrderId();
    d.orders[orderId] = { userId, chatId, scriptId: scId, method: isQris ? "qris" : "dana", status: "waiting_proof", createdAt: Date.now() };
    saveData(d);
    userState[userId] = `waiting_proof:${orderId}`;
    const body = isQris
      ? `📷 <b>Pembayaran via QRIS</b>\n📦 Script: <b>${sc.name}</b>\n💰 Total: <b>${priceStr}</b>\n\n${SHOP_AFTER_PAYMENT}`
      : `💙 <b>Pembayaran via Dana</b>\n📦 Script: <b>${sc.name}</b>\n💰 Total: <b>${priceStr}</b>\n\n📲 Nomor: <code>${SHOP_DANA_NUMBER}</code>\nNama: <b>${SHOP_DANA_NAME}</b>\n\n${SHOP_AFTER_PAYMENT}`;
    if (isQris) {
      try { await main.sendPhoto(chatId, SHOP_QRIS_URL, { caption: body, parse_mode: "HTML" }); }
      catch { await sendBotText(chatId, body, { parse_mode: "HTML" }); }
    } else await sendBotText(chatId, body, { parse_mode: "HTML" });
    return;
  }
  if (data === "shop_back") {
    const d = loadData();
    const keyboard = buildScriptListKeyboard(d);
    if (!keyboard) { await sendBotText(chatId, "📭 Belum ada script."); return; }
    await sendBotText(chatId, SHOP_WELCOME, { parse_mode: "HTML", reply_markup: keyboard });
    return;
  }
  if (data.startsWith("shop_acc_")) {
    if (!hasMinRole(userId, "owner")) return;
    const orderId = data.slice("shop_acc_".length);
    const d = loadData();
    const order = d.orders[orderId];
    if (!order) { await sendBotText(chatId, "❌ Order tidak ditemukan."); return; }
    if (order.status === "done") { await sendBotText(chatId, "⚠️ Order sudah di-ACC."); return; }
    try {
      if (order.kind === "access_bot" || order.kind === "access_1d") {
        const targetId = Number(order.targetAccessId);
        if (!Number.isFinite(targetId) || targetId <= 0) { await sendBotText(chatId, "❌ ID target tidak valid."); return; }
        let expireAtMs = null, durationLabel = "Permanent";
        if (order.kind === "access_1d") {
          const dur = Number(order.durationMs || 86400000);
          expireAtMs = Number(order.purchasedAt || order.createdAt || Date.now()) + dur;
          durationLabel = "1 hari";
        }
        setUserRole(targetId, "prem", expireAtMs);
        order.status = "done";
        order.accessGrantedAt = Date.now();
        order.accessExpireAt = expireAtMs;
        saveData(d);
        const expStr = expireAtMs ? `sampai <b>${new Date(expireAtMs).toLocaleString("id-ID")}</b>` : "<b>Permanent</b>";
        await sendBotText(order.chatId, `✅ <b>Pembayaran ACC!</b>\n\nRole PREM untuk ID <code>${targetId}</code> sudah aktif.\n⏰ ${durationLabel} (${expStr})`, { parse_mode: "HTML" });
        if (targetId !== order.userId) sendBotText(targetId, `✅ <b>Role PREM aktif!</b>\n⏰ ${durationLabel} (${expStr})`, { parse_mode: "HTML" }).catch(() => {});
      } else {
        const sc = d.scripts[order.scriptId];
        if (!sc) { await sendBotText(chatId, "❌ Script tidak ditemukan."); return; }
        const pl = sc.payload;
        await sendBotText(order.chatId, `✅ <b>Pembayaran ACC!</b>\n\nTerima kasih sudah beli <b>${sc.name}</b>!\nIni scriptnya 👇`, { parse_mode: "HTML" });
        if (pl.type === "text") await sendBotText(order.chatId, pl.content);
        else if (pl.type === "document") await main.sendDocument(order.chatId, pl.fileId, { caption: pl.fileName || "" });
        else if (pl.type === "photo") await main.sendPhoto(order.chatId, pl.fileId, { caption: pl.caption || "" });
        else if (pl.type === "audio") await main.sendAudio(order.chatId, pl.fileId);
        else if (pl.type === "video") await main.sendVideo(order.chatId, pl.fileId, { caption: pl.caption || "" });
        order.status = "done";
        saveData(d);
      }
      await main.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: chatId, message_id: query.message.message_id }).catch(() => {});
      await sendBotText(chatId, `✅ Order <code>${orderId}</code> di-ACC.`, { parse_mode: "HTML" });
    } catch (e) { await sendBotText(chatId, `❌ Gagal proses order: ${e.message}`); }
    return;
  }
  if (data.startsWith("shop_rej_")) {
    if (!hasMinRole(userId, "owner")) return;
    const orderId = data.slice("shop_rej_".length);
    const d = loadData();
    const order = d.orders[orderId];
    if (!order) { await sendBotText(chatId, "❌ Order tidak ditemukan."); return; }
    order.status = "rejected";
    saveData(d);
    await sendBotText(order.chatId, SHOP_REJECT_MSG, { parse_mode: "HTML" }).catch(() => {});
    await main.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: chatId, message_id: query.message.message_id }).catch(() => {});
    await sendBotText(chatId, `❌ Order <code>${orderId}</code> ditolak.`, { parse_mode: "HTML" });
    return;
  }
  if (data.startsWith("delsc_")) {
    if (!hasMinRole(userId, "owner")) return;
    const scId = data.slice("delsc_".length);
    const d = loadData();
    if (!d.scripts[scId]) { await sendBotText(chatId, "❌ Script tidak ditemukan."); return; }
    const scName = d.scripts[scId].name;
    delete d.scripts[scId];
    saveData(d);
    await main.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: chatId, message_id: query.message.message_id }).catch(() => {});
    await sendBotText(chatId, `✅ Script <b>${scName}</b> berhasil dihapus.`, { parse_mode: "HTML" });
    return;
  }
});

// ─── MESSAGE HANDLER (MAIN) ──
main.on("message", async (msg) => {
  const userId = msg.from?.id, chatId = msg.chat?.id;
  if (!userId || !chatId) return;
  trackUser(msg.from);

  const isAdminBroadcast = hasMinRole(userId, "owner") && userState[userId] === "admin_waiting_broadcast";
  const isSetAutoReply = typeof userState[userId] === "string" && userState[userId].startsWith("set_autoreply:");
  const isSetGlobalAutoReply = userState[userId] === "waiting_global_autojawab" && hasMinRole(userId, "owner");
  const isSetStartPhoto = hasMinRole(userId, "owner") && userState[userId] === "admin_waiting_start_photo";
  const isSetStartAudio = hasMinRole(userId, "owner") && userState[userId] === "admin_waiting_start_audio";
  const isAddRoleState = String(userState[userId] || "").startsWith("waiting_add_role:");
  const isWaitingProof = String(userState[userId] || "").startsWith("waiting_proof:");
  const isWaitingAccessTarget = String(userState[userId] || "").startsWith("waiting_access_target_id:");

  if (!msg.text && !msg.reply_to_message && !isAdminBroadcast && !isSetAutoReply && !isSetGlobalAutoReply && !isSetStartPhoto && !isSetStartAudio && !isWaitingProof) return;
  if (msg.text?.startsWith("/start")) return;

  // ── /cancel → balik ke menu utama ──
  if (msg.text === "/cancel") {
    userState[userId] = null;
    if (!hasMinRole(userId, "prem")) {
      const ok = await enforceForceJoinOrSendPrompt(chatId, userId);
      if (!ok) return;
    }
    await sendStartMenuOnly(chatId, userId, hasMinRole(userId, "prem"), msg.from);
    return;
  }

  // ── ADD ROLE via state ──
  if (isAddRoleState && msg.text && !msg.text?.startsWith("/")) {
    const targetRole = String(userState[userId]).split(":")[1];
    userState[userId] = null;
    if (!canAddRole(userId, targetRole)) { sendBotText(chatId, "❌ Gak punya akses."); return; }
    const args = msg.text.trim().split(/\s+/).filter(Boolean);
    const targetId = parseInt(String(args[0] || "").replace(/[^0-9-]/g, ""), 10);
    const hariRaw = args[1] || null;
    if (!Number.isFinite(targetId) || targetId <= 0) { sendBotText(chatId, "❌ ID gak valid."); return; }
    if (DEVELOPER_IDS.includes(targetId)) { sendBotText(chatId, "❌ Gak bisa ngasih role ke DEVELOPER."); return; }
    let expireAtMs = null, durationLabel = "Permanent";
    if (hariRaw) {
      const hari = parseInt(hariRaw.replace(/[^0-9]/g, ""), 10);
      if (!Number.isFinite(hari) || hari <= 0) { sendBotText(chatId, "❌ Hari gak valid."); return; }
      expireAtMs = Date.now() + hari * 86400000;
      durationLabel = `${hari} hari`;
    }
    setUserRole(targetId, targetRole, expireAtMs);
    const expLabel = expireAtMs ? `sampai <b>${new Date(expireAtMs).toLocaleString("id-ID")}</b>` : "<b>Permanent</b>";
    await sendBotText(chatId, `✅ Role <b>${ROLE_LABELS[targetRole]}</b> dikasih ke <code>${targetId}</code>\n⏰ ${durationLabel} (${expLabel})`, { parse_mode: "HTML" });
    sendBotText(targetId, `🎉 <b>Kamu dapet role baru!</b>\n\n👑 Role: <b>${ROLE_LABELS[targetRole]}</b>\n⏰ ${durationLabel}`, { parse_mode: "HTML" }).catch(() => {});
    return;
  }

  // ── SET START PHOTO ──
  if (isSetStartPhoto) {
    const src = msg.photo?.length ? msg : (msg.reply_to_message?.photo?.length ? msg.reply_to_message : null);
    if (!src) { sendBotText(chatId, "❌ Harus reply ke <b>FOTO</b>.", { parse_mode: "HTML" }); return; }
    const d = loadData();
    d.settings.startMedia.photoFileId = src.photo[src.photo.length - 1].file_id;
    saveData(d);
    userState[userId] = null;
    sendBotText(chatId, "✅ Foto start disimpan.");
    return;
  }

  // ── SET START AUDIO ──
  if (isSetStartAudio) {
    const pick = msg.audio ? msg : msg.voice ? msg : msg.document ? msg :
      (msg.reply_to_message?.audio ? msg.reply_to_message : msg.reply_to_message?.voice ? msg.reply_to_message : msg.reply_to_message?.document ? msg.reply_to_message : null);
    const fileId = pick?.audio?.file_id || pick?.voice?.file_id || pick?.document?.file_id || null;
    if (!fileId) { sendBotText(chatId, "❌ Harus reply ke <b>AUDIO/VOICE</b>.", { parse_mode: "HTML" }); return; }
    const d = loadData();
    d.settings.startMedia.audioFileId = fileId;
    if (typeof pick?.caption === "string" && pick.caption.trim()) d.settings.startMedia.audioCaption = pick.caption.trim();
    saveData(d);
    userState[userId] = null;
    sendBotText(chatId, "✅ Audio start disimpan.");
    return;
  }

  // ── FORCE JOIN (buat non-prem) ──
  if (!hasMinRole(userId, "prem") && !isWaitingProof) {
    const ok = await enforceForceJoinOrSendPrompt(chatId, userId);
    if (!ok) return;
  }

  // ── SET AUTO REPLY PER-BOT ──
  if (isSetAutoReply && msg.text && !msg.text?.startsWith("/")) {
    const token = String(userState[userId]).slice("set_autoreply:".length);
    userState[userId] = null;
    const d = loadData();
    const bot = d.bots[token];
    if (!bot) { sendBotText(chatId, "❌ Bot tidak ditemukan."); return; }
    if (bot.ownerId !== userId && !hasMinRole(userId, "owner")) { sendBotText(chatId, "❌ Bukan bot target."); return; }
    if (!hasMinRole(userId, "owner")) { sendBotText(chatId, "❌ Gak punya akses."); return; }
    const txt = String(msg.text || "").trim();
    if (!txt) { sendBotText(chatId, "❌ Pesan kosong."); return; }
    if (/^(off|disable|mati)$/i.test(txt)) {
      bot.autoReplyEnabled = false; bot.autoReplyText = "";
      saveData(d); sendBotText(chatId, "✅ Auto Balas dimatikan."); return;
    }
    bot.autoReplyEnabled = true;
    bot.autoReplyText = txt;
    bot.autoReplyCooldownMs = Number.isFinite(bot.autoReplyCooldownMs) ? bot.autoReplyCooldownMs : 0;
    saveData(d);
    sendBotText(chatId, "✅ Auto Balas disimpan.");
    return;
  }

  // ── SET GLOBAL AUTO REPLY ──
  if (isSetGlobalAutoReply && msg.text && !msg.text?.startsWith("/")) {
    userState[userId] = null;
    const txt = String(msg.text || "").trim();
    if (!txt) { sendBotText(chatId, "❌ Pesan kosong."); return; }
    const d = loadData();
    if (/^(off|disable|mati)$/i.test(txt)) {
      d.settings.globalAutoReply.enabled = false;
      d.settings.globalAutoReply.text = "";
      saveData(d);
      sendBotText(chatId, "✅ Auto Balas Global dimatikan.");
      return;
    }
    d.settings.globalAutoReply.enabled = true;
    d.settings.globalAutoReply.text = txt;
    d.settings.globalAutoReply.cooldownMs = Number.isFinite(d.settings.globalAutoReply.cooldownMs) ? d.settings.globalAutoReply.cooldownMs : 0;
    saveData(d);
    sendBotText(chatId, "✅ Auto Balas Global disimpan.");
    return;
  }

  // ── FORCE JOIN SET ──
  if (userState[userId] === "admin_waiting_forcejoin" && hasMinRole(userId, "owner") && msg.text && !msg.text?.startsWith("/")) {
    userState[userId] = null;
    const parts = msg.text.trim().split("|").map(s => s.trim()).filter(Boolean);
    if (parts.length < 2) { sendBotText(chatId, "❌ Format salah."); return; }
    const fjChatId = parseInt(parts[0], 10);
    if (Number.isNaN(fjChatId)) { sendBotText(chatId, "❌ CHAT_ID harus angka."); return; }
    if (!/^https?:\/\/t\.me\//i.test(parts[1])) { sendBotText(chatId, "❌ Link harus t.me."); return; }
    const d = loadData();
    d.settings.forceJoin.chatId = fjChatId;
    d.settings.forceJoin.inviteLink = parts[1];
    d.settings.forceJoin.title = parts[2] || "Channel/Grup";
    saveData(d);
    sendBotText(chatId, "✅ Target Wajib Join disimpan.");
    return;
  }

  // ── BROADCAST ──
  if (userState[userId] === "admin_waiting_broadcast" && hasMinRole(userId, "owner")) {
    userState[userId] = null;
    const d = loadData();
    const targets = Object.keys(d.users || {}).map(x => parseInt(x, 10)).filter(id => id && !hasMinRole(id, "owner"));
    if (!targets.length) { sendBotText(chatId, "👥 Belum ada user."); return; }
    let okCount = 0, failCount = 0;
    for (const uid of targets) {
      try {
        if (msg.text) await sendBotText(uid, msg.text);
        else if (msg.photo) await main.sendPhoto(uid, msg.photo[msg.photo.length - 1].file_id, { caption: msg.caption || "" });
        else if (msg.video) await main.sendVideo(uid, msg.video.file_id, { caption: msg.caption || "" });
        else if (msg.document) await main.sendDocument(uid, msg.document.file_id, { caption: msg.caption || "" });
        else if (msg.sticker) await main.sendSticker(uid, msg.sticker.file_id);
        else if (msg.voice) await main.sendVoice(uid, msg.voice.file_id);
        else { failCount++; continue; }
        okCount++;
      } catch { failCount++; }
    }
    sendBotText(chatId, `✅ Broadcast selesai.\nBerhasil: ${okCount}\nGagal: ${failCount}`);
    return;
  }

  // ── BROADCAST SLAVE ──
  if (userState[userId] === "waiting_broadcast_slave" && hasMinRole(userId, "owner")) {
    userState[userId] = null;
    const d = loadData();
    const tokens = Object.keys(d.bots || {});
    if (!tokens.length) { sendBotText(chatId, "📭 Tidak ada bot."); return; }
    const loadingMsg = await sendBotText(chatId, `⏳ <b>Sedang broadcast...</b>\n\n🤖 Bot: <b>${tokens.length}</b>\nMohon tunggu...`, { parse_mode: "HTML" });
    let totalOk = 0, totalFail = 0, totalSkip = 0, processed = 0;
    for (const token of tokens) {
      const slave = slaveBots[token];
      if (!slave) { processed++; continue; }
      const botData = d.bots[token] || {};
      processed++;
      try {
        await main.editMessageText(`⏳ <b>Sedang broadcast...</b>\n\n🤖 Bot: <b>${processed}/${tokens.length}</b>\n✅ Terkirim: <b>${totalOk}</b>  ❌ Gagal: <b>${totalFail}</b>`,
          { chat_id: chatId, message_id: loadingMsg.message_id, parse_mode: "HTML" });
      } catch {}
      const sendToTarget = async (targetId) => {
        try {
          if (msg.text) await slave.sendMessage(targetId, msg.text);
          else if (msg.photo) await slave.sendPhoto(targetId, msg.photo[msg.photo.length - 1].file_id, { caption: msg.caption || "" });
          else if (msg.video) await slave.sendVideo(targetId, msg.video.file_id, { caption: msg.caption || "" });
          else if (msg.document) await slave.sendDocument(targetId, msg.document.file_id, { caption: msg.caption || "" });
          else if (msg.sticker) await slave.sendSticker(targetId, msg.sticker.file_id);
          else if (msg.voice) await slave.sendVoice(targetId, msg.voice.file_id);
          else if (msg.audio) await slave.sendAudio(targetId, msg.audio.file_id, { caption: msg.caption || "" });
          else return false;
          return true;
        } catch { return false; }
      };
      for (const cid of Object.keys(botData.chats || {})) {
        const cidNum = parseInt(cid, 10);
        if (!cidNum || cidNum < 0) continue;
        const ok = await sendToTarget(cidNum);
        ok ? totalOk++ : totalFail++;
        await new Promise(r => setTimeout(r, 50));
      }
      for (const gid of Object.keys(botData.renamedChats || {})) {
        const gidNum = parseInt(gid, 10);
        if (!gidNum) continue;
        try {
          const me = await slave.getMe();
          const member = await slave.getChatMember(gidNum, me.id);
          if (!["administrator", "creator"].includes(member?.status)) { totalSkip++; continue; }
        } catch { totalSkip++; continue; }
        const ok = await sendToTarget(gidNum);
        ok ? totalOk++ : totalFail++;
        await new Promise(r => setTimeout(r, 100));
      }
    }
    try {
      await main.editMessageText(`✅ <b>Broadcast Selesai!</b>\n\n📨 Terkirim: <b>${totalOk}</b>\n❌ Gagal: <b>${totalFail}</b>\n⏭ Dilewati: <b>${totalSkip}</b>`,
        { chat_id: chatId, message_id: loadingMsg.message_id, parse_mode: "HTML" });
    } catch { sendBotText(chatId, `✅ Selesai! Terkirim: ${totalOk}, Gagal: ${totalFail}`); }
    return;
  }

  // ── BUY ACCESS TARGET ID ──
  if (isWaitingAccessTarget && msg.text && !msg.text?.startsWith("/")) {
    const kindKey = String(userState[userId]).split(":")[1] || "perm";
    const targetId = parseInt(String(msg.text || "").replace(/[^0-9-]/g, ""), 10);
    if (!Number.isFinite(targetId) || targetId <= 0) { sendBotText(chatId, "❌ ID tidak valid."); return; }
    const targetCurrent = getUserRole(targetId);
    if (kindKey === "1d" && targetCurrent.level >= ROLE_LEVELS.prem) { userState[userId] = null; sendBotText(chatId, `⚠️ ID sudah punya role.`, { parse_mode: "HTML" }); return; }
    if (kindKey !== "1d" && targetCurrent.level >= ROLE_LEVELS.prem && !targetCurrent.exp) { userState[userId] = null; sendBotText(chatId, `⚠️ ID sudah punya role permanen.`, { parse_mode: "HTML" }); return; }
    userState[userId] = null;
    const productName = kindKey === "1d" ? ACCESS_1D_PRODUCT_NAME : ACCESS_BOT_PRODUCT_NAME;
    const price = kindKey === "1d" ? ACCESS_1D_PRICE : ACCESS_BOT_PRICE;
    const extra = kindKey === "1d" ? `\n⏳ Durasi: <b>24 jam</b>` : "";
    await sendBotText(chatId,
      `🛒 <b>${productName}</b>\n━━━━━━━━━━━━━━\n🆔 ID Telegram: <code>${targetId}</code>\n💰 Harga: <b>Rp${Number(price).toLocaleString("id-ID")}</b>${extra}\n\nPilih metode pembayaran:`,
      { parse_mode: "HTML", reply_markup: buildAccessPaymentKeyboard(targetId, kindKey) });
    return;
  }

  // ── WAITING TOKEN ──
  if (userState[userId] === "waiting_token" && !msg.text?.startsWith("/")) {
    if (!isAllowedCreator(userId)) { userState[userId] = null; sendBotText(chatId, "❌ Gak punya akses."); return; }
    userState[userId] = null;
    await createSlaveBotFromToken(msg.text.trim(), userId, chatId, msg.from);
    return;
  }

  // ── AUTO TOKEN (private) ──
  if (!userState[userId] && msg.chat?.type === "private" && msg.text && !msg.text.startsWith("/") && isLikelyTelegramBotToken(msg.text)) {
    if (!isAllowedCreator(userId)) { sendBotText(chatId, "❌ Gak punya akses."); return; }
    await createSlaveBotFromToken(msg.text.trim(), userId, chatId, msg.from);
    return;
  }

  // ── SET LIMIT ──
  if (userState[userId] === "admin_waiting_setlimit_token" && hasMinRole(userId, "owner") && !msg.text?.startsWith("/")) {
    const token = msg.text.trim();
    const d = loadData();
    if (!d.bots[token]) { sendBotText(chatId, "❌ Token tidak ditemukan."); userState[userId] = null; return; }
    userState[userId] = `admin_waiting_setlimit_value:${token}`;
    sendBotText(chatId, `Bot: @${d.bots[token].name}\nLimit: ${d.bots[token].limit}\n\nKirim angka limit baru:`);
    return;
  }
  if (String(userState[userId] || "").startsWith("admin_waiting_setlimit_value:") && hasMinRole(userId, "owner") && !msg.text?.startsWith("/")) {
    const token = String(userState[userId]).split(":")[1];
    const newLimit = parseInt(msg.text.trim());
    userState[userId] = null;
    if (isNaN(newLimit) || newLimit < 1) { sendBotText(chatId, "❌ Angka tidak valid."); return; }
    const d = loadData();
    if (d.bots[token]) { d.bots[token].limit = newLimit; saveData(d); sendBotText(chatId, `✅ Limit bot @${d.bots[token].name} diubah ke ${newLimit}.`); }
    return;
  }

  // ── REPLY ke user ──
  if (msg.reply_to_message) {
    const refId = msg.reply_to_message.message_id;
    const info = replyMap[refId];
    if (!info || info.isMonitor) return;
    const d = loadData();
    const bot = d.bots[info.token];
    if (!bot) return;
    if (bot.ownerId !== userId && !hasMinRole(userId, "owner")) { sendBotText(chatId, "❌ Bukan bot target."); return; }
    const slave = slaveBots[info.token];
    if (!slave) { sendBotText(chatId, "❌ Bot slave tidak aktif."); return; }
    try {
      if (msg.text) await slave.sendMessage(info.chatId, msg.text);
      else if (msg.photo) await slave.sendPhoto(info.chatId, msg.photo[msg.photo.length - 1].file_id, { caption: msg.caption || "" });
      else if (msg.video) await slave.sendVideo(info.chatId, msg.video.file_id, { caption: msg.caption || "" });
      else if (msg.voice) await slave.sendVoice(info.chatId, msg.voice.file_id);
      else if (msg.audio) await slave.sendAudio(info.chatId, msg.audio.file_id);
      else if (msg.document) await slave.sendDocument(info.chatId, msg.document.file_id, { caption: msg.caption || "" });
      else if (msg.sticker) await slave.sendSticker(info.chatId, msg.sticker.file_id);
      else { sendBotText(chatId, "⚠️ Tipe pesan ini belum didukung."); return; }
      sendBotText(chatId, "✅ Pesan terkirim!");
    } catch (e) { sendBotText(chatId, `❌ Gagal kirim: ${e.message}`); }
  }
});

// ─── SHOP HELPERS ──
function generateOrderId() { return `ORD${Date.now()}`; }
function fmtBuyer(from) {
  const name = [from?.first_name, from?.last_name].filter(Boolean).join(" ").trim() || "Tidak diketahui";
  const uname = from?.username ? `@${from.username}` : "(tanpa username)";
  return `${name} ${uname} | <code>${from?.id || "?"}</code>`;
}
function getOrderProductName(d, order) {
  if (order?.kind === "access_bot") return order?.itemName || ACCESS_BOT_PRODUCT_NAME;
  if (order?.kind === "access_1d") return order?.itemName || ACCESS_1D_PRODUCT_NAME;
  const sc = d.scripts?.[order?.scriptId];
  return sc?.name || order?.itemName || "?";
}
function getOrderPrice(d, order) {
  if (order?.kind === "access_bot") return Number(order?.price ?? ACCESS_BOT_PRICE);
  if (order?.kind === "access_1d") return Number(order?.price ?? ACCESS_1D_PRICE);
  const sc = d.scripts?.[order?.scriptId];
  return Number(sc?.price ?? order?.price ?? 0);
}
function buildAccessPaymentKeyboard(targetId, kindKey = "perm") {
  return { inline_keyboard: [
    [{ text: "💙 Dana", callback_data: `buyacc_pay_dana_${kindKey}_${targetId}` }],
    [{ text: "📷 QRIS", callback_data: `buyacc_pay_qris_${kindKey}_${targetId}` }],
    [{ text: "🔙 Kembali", callback_data: "menu_shop", style: "primary" }]
  ]};
}
function buildScriptListKeyboard(d) {
  const scripts = Object.entries(d.scripts || {});
  if (!scripts.length) return null;
  return { inline_keyboard: scripts.map(([id, sc]) => ([{ text: `📦 ${sc.name} — Rp${Number(sc.price).toLocaleString("id-ID")}`, callback_data: `shop_buy_${id}` }])) };
}

// ─── /addsc /delsc /listsc /orders /buy ──
main.onText(/\/addsc(?:\s+([\s\S]+))?\s*$/i, async (msg, match) => {
  const userId = msg.from.id, chatId = msg.chat.id;
  if (!hasMinRole(userId, "owner")) { await sendBotText(chatId, "❌ Hanya owner."); return; }
  const arg = String(match?.[1] || "").trim();
  if (!arg) {
    await sendBotText(chatId, "📦 <b>Cara pakai /addsc:</b>\n\n1. Kirim script ke bot\n2. <b>Reply</b> pesan itu\n3. Ketik: <code>/addsc Nama | harga</code>", { parse_mode: "HTML" });
    return;
  }
  const parts = arg.split("|").map(s => s.trim());
  if (parts.length < 2) { await sendBotText(chatId, "❌ Format: <code>/addsc Nama | harga</code>", { parse_mode: "HTML" }); return; }
  const scName = parts[0];
  const scPrice = parseInt(parts[1].replace(/[^0-9]/g, ""), 10);
  if (!scName || isNaN(scPrice) || scPrice < 0) { await sendBotText(chatId, "❌ Nama/harga tidak valid."); return; }
  const replyMsg = msg.reply_to_message;
  if (!replyMsg) { await sendBotText(chatId, "❌ Harus reply ke pesan script!"); return; }
  let payload = null;
  if (replyMsg.text) payload = { type: "text", content: replyMsg.text };
  else if (replyMsg.document) payload = { type: "document", fileId: replyMsg.document.file_id, fileName: replyMsg.document.file_name || "script" };
  else if (replyMsg.photo) payload = { type: "photo", fileId: replyMsg.photo[replyMsg.photo.length - 1].file_id, caption: replyMsg.caption || "" };
  else if (replyMsg.audio) payload = { type: "audio", fileId: replyMsg.audio.file_id };
  else if (replyMsg.video) payload = { type: "video", fileId: replyMsg.video.file_id, caption: replyMsg.caption || "" };
  else { await sendBotText(chatId, "❌ Tipe pesan tidak didukung."); return; }
  const d = loadData();
  const scId = `sc_${Date.now()}`;
  d.scripts[scId] = { name: scName, price: scPrice, payload, addedAt: Date.now() };
  saveData(d);
  await sendBotText(chatId, `✅ <b>Script ditambahkan!</b>\n\n📦 ${scName}\n💰 Rp${scPrice.toLocaleString("id-ID")}\n🔑 <code>${scId}</code>`, { parse_mode: "HTML" });
});

main.onText(/\/delsc\s*$/i, async (msg) => {
  if (!hasMinRole(msg.from.id, "owner")) return;
  const d = loadData();
  const scripts = Object.entries(d.scripts || {});
  if (!scripts.length) { await sendBotText(msg.chat.id, "📭 Belum ada script."); return; }
  const keyboard = scripts.map(([id, sc]) => ([{ text: `🗑 ${sc.name}`, callback_data: `delsc_${id}` }]));
  await sendBotText(msg.chat.id, "Pilih script yang mau dihapus:", { reply_markup: { inline_keyboard: keyboard } });
});

main.onText(/\/listsc\s*$/i, async (msg) => {
  if (!hasMinRole(msg.from.id, "owner")) return;
  const d = loadData();
  const scripts = Object.entries(d.scripts || {});
  if (!scripts.length) { await sendBotText(msg.chat.id, "📭 Belum ada script."); return; }
  let text = "📦 <b>Daftar Script:</b>\n━━━━━━━━━━━━━━\n";
  scripts.forEach(([id, sc], i) => { text += `${i + 1}. <b>${sc.name}</b>\n   💰 Rp${Number(sc.price).toLocaleString("id-ID")}\n   🔑 <code>${id}</code>\n\n`; });
  await sendBotText(msg.chat.id, text, { parse_mode: "HTML" });
});

main.onText(/\/orders\s*$/i, async (msg) => {
  if (!hasMinRole(msg.from.id, "owner")) return;
  const d = loadData();
  const pending = Object.entries(d.orders || {}).filter(([, o]) => o.status === "pending_proof");
  if (!pending.length) { await sendBotText(msg.chat.id, "📭 Tidak ada order pending."); return; }
  let text = `⏳ <b>Order Pending (${pending.length}):</b>\n`;
  pending.forEach(([id, o]) => { text += `\n<code>${id}</code>\n📦 ${getOrderProductName(d, o)}\n💰 Rp${Number(getOrderPrice(d, o)).toLocaleString("id-ID")}\n👤 <code>${o.userId}</code>\n`; });
  await sendBotText(msg.chat.id, text, { parse_mode: "HTML" });
});

main.onText(/\/buy\s*$/i, async (msg) => {
  trackUser(msg.from);
  if (!hasMinRole(msg.from.id, "prem")) await enforceForceJoinOrSendPrompt(msg.chat.id, msg.from.id);
  const d = loadData();
  const keyboard = buildScriptListKeyboard(d);
  if (!keyboard) { await sendBotText(msg.chat.id, "📭 Belum ada script."); return; }
  await sendBotText(msg.chat.id, SHOP_WELCOME, { parse_mode: "HTML", reply_markup: keyboard });
});

// ─── BUKTI BAYAR ──
main.on("message", async (msg) => {
  const userId = msg.from?.id, chatId = msg.chat?.id;
  if (!userId || !chatId) return;
  const state = userState[userId];
  if (!state || !state.startsWith("waiting_proof:")) return;
  if (!msg.photo && !msg.document) return;
  const orderId = state.slice("waiting_proof:".length);
  userState[userId] = null;
  const d = loadData();
  const order = d.orders[orderId];
  if (!order) { await sendBotText(chatId, "❌ Order tidak ditemukan."); return; }
  const itemName = getOrderProductName(d, order);
  const price = getOrderPrice(d, order);
  const fileId = msg.photo ? msg.photo[msg.photo.length - 1].file_id : msg.document?.file_id;
  order.status = "pending_proof";
  order.proofFileId = fileId;
  order.proofType = msg.photo ? "photo" : "document";
  saveData(d);
  await sendBotText(chatId, `⏳ <b>Bukti pembayaran berhasil dikirim!</b>\nOwner sedang memverifikasi.`, { parse_mode: "HTML" });
  const caption =
    `💳 <b>BUKTI BAYAR MASUK!</b>\n━━━━━━━━━━━━━━\n🔑 Order: <code>${orderId}</code>\n📦 Produk: <b>${itemName}</b>\n` +
    `${(order.kind === "access_bot" || order.kind === "access_1d") ? `🆔 ID Target: <code>${order.targetAccessId || "-"}</code>\n` : ""}` +
    `💰 Harga: <b>Rp${Number(price).toLocaleString("id-ID")}</b>\n💳 Metode: <b>${order.method?.toUpperCase() || "?"}</b>\n👤 Buyer: <code>${userId}</code>${msg.from?.username ? " (@" + msg.from.username + ")" : ""}\n\nTekan tombol:`;
  const accRej = { reply_markup: { inline_keyboard: [[
    { text: (order.kind === "access_bot" || order.kind === "access_1d") ? "✅ ACC — Tambah Role" : "✅ ACC — Kirim Script", callback_data: `shop_acc_${orderId}` },
    { text: "❌ Tolak", callback_data: `shop_rej_${orderId}` }
  ]] } };
  for (const adminId of DEVELOPER_IDS) {
    try {
      if (order.proofType === "photo") await main.sendPhoto(adminId, fileId, { caption, parse_mode: "HTML", ...accRej });
      else await main.sendDocument(adminId, fileId, { caption, parse_mode: "HTML", ...accRej });
    } catch {}
  }
});

// ─── AUTODETECT ──
const AUTODETECT_INTERVAL_MS = 60000;
let autodetectTimer = null;
const slaveLastProfile = {};
function isAutoDetectEnabled() { const d = loadData(); return d.settings?.autoDetect !== false; }
async function setAutoDetect(enabled) { const d = loadData(); d.settings = d.settings || {}; d.settings.autoDetect = enabled; saveData(d); }
async function checkSlaveProfiles() {
  if (!isAutoDetectEnabled()) return;
  const d = loadData();
  for (const token of Object.keys(d.bots || {})) {
    const slave = slaveBots[token];
    if (!slave) continue;
    const botInfo = d.bots[token] || {};
    try {
      const me = await slave.getMe();
      const currentName = me?.first_name || "";
      let currentAbout = "";
      try { const chat = await slave.getChat(me.id); currentAbout = chat?.bio || chat?.description || ""; } catch {}
      const last = slaveLastProfile[token] || {};
      const expectedName = String(SLAVE_DISPLAY_NAME || "").trim();
      const expectedAbout = String(SLAVE_SHORT_BIO_TEXT || "").trim();
      let changed = false, changeDesc = [];
      if (last.name !== undefined && currentName !== expectedName) { changed = true; changeDesc.push(`Nama berubah: <b>${currentName}</b>`); }
      if (last.about !== undefined && currentAbout && currentAbout !== expectedAbout) { changed = true; changeDesc.push(`Bio berubah`); }
      slaveLastProfile[token] = { name: currentName, about: currentAbout };
      if (!changed) continue;
      const botName = botInfo.name ? `@${botInfo.name}` : maskToken(token);
      const notifText = `⚠️ <b>[AUTODETECT] Perubahan!</b>\n🤖 ${botName}\n${changeDesc.join("\n")}\n\n🔄 Restore...`;
      if (NOTIFY_CHANNEL) sendBotText(NOTIFY_CHANNEL, notifText, { parse_mode: "HTML" }).catch(() => {});
      const ownerId = botInfo.ownerId;
      if (ownerId) sendBotText(ownerId, notifText, { parse_mode: "HTML" }).catch(() => {});
      try {
        await applySlaveProfile(slave);
        slaveLastProfile[token] = { name: expectedName, about: expectedAbout };
      } catch {}
    } catch {}
  }
}
function startAutoDetect() {
  if (autodetectTimer) clearInterval(autodetectTimer);
  autodetectTimer = setInterval(() => { checkSlaveProfiles().catch(() => {}); }, AUTODETECT_INTERVAL_MS);
}
function stopAutoDetect() { if (autodetectTimer) { clearInterval(autodetectTimer); autodetectTimer = null; } }

main.onText(/\/autodetect\s*(on|off)?\s*$/i, async (msg, match) => {
  const chatId = msg.chat.id, userId = msg.from.id;
  if (!hasMinRole(userId, "owner")) { await sendBotText(chatId, "❌ Hanya owner."); return; }
  const arg = (match?.[1] || "").toLowerCase().trim();
  if (!arg) {
    await sendBotText(chatId, `🔍 <b>Auto Deteksi</b>\n\nStatus: ${isAutoDetectEnabled() ? "✅ ON" : "❌ OFF"}\n\nPakai: /autodetect on atau /autodetect off`, { parse_mode: "HTML" });
    return;
  }
  if (arg === "on") { await setAutoDetect(true); startAutoDetect(); await sendBotText(chatId, "✅ <b>Auto Deteksi AKTIF</b>", { parse_mode: "HTML" }); }
  else { await setAutoDetect(false); stopAutoDetect(); await sendBotText(chatId, "❌ <b>Auto Deteksi DIMATIKAN.</b>", { parse_mode: "HTML" }); }
});

// ─── /broadcastslave ──
main.onText(/\/broadcastslave\s*$/i, async (msg) => {
  const chatId = msg.chat.id, userId = msg.from.id;
  if (!hasMinRole(userId, "owner")) { await sendBotText(chatId, "❌ Hanya owner."); return; }
  userState[userId] = "waiting_broadcast_slave";
  await sendBotText(chatId, "📢 <b>Broadcast ke Bot</b>\n\nKirim pesan yang mau dibroadcast.\n\n/cancel untuk batal.", { parse_mode: "HTML" });
});

// ─── /clean ──
main.onText(/\/clean\s*$/i, async (msg) => {
  const chatId = msg.chat.id, userId = msg.from.id;
  if (!hasMinRole(userId, "owner")) { await sendBotText(chatId, "❌ Hanya owner."); return; }
  const d = loadData();
  const tokens = Object.keys(d.bots || {});
  if (!tokens.length) { await sendBotText(chatId, "📭 Tidak ada bot."); return; }
  const loading = await sendBotText(chatId, `🔍 Memeriksa ${tokens.length} bot...`);
  const dead = [], alive = [];
  for (const token of tokens) {
    let isAlive = false;
    try {
      const slave = slaveBots[token];
      if (slave) { await slave.getMe(); isAlive = true; }
      else { const tmp = new TelegramBot(token, { polling: false }); await tmp.getMe(); isAlive = true; }
    } catch (e) {
      const code = e?.response?.statusCode || e?.code;
      const msg2 = String(e?.message || "").toLowerCase();
      if (code === 401 || code === 403 || msg2.includes("unauthorized") || msg2.includes("bot was kicked")) isAlive = false;
      else isAlive = true;
    }
    isAlive ? alive.push(token) : dead.push(token);
  }
  if (!dead.length) {
    await main.editMessageText(`✅ Semua <b>${alive.length}</b> bot sehat.`, { chat_id: chatId, message_id: loading.message_id, parse_mode: "HTML" }).catch(() => {});
    return;
  }
  const removed = [];
  for (const token of dead) {
    const botName = d.bots[token]?.name ? `@${d.bots[token].name}` : maskToken(token);
    try { if (slaveBots[token]) { try { slaveBots[token].stopPolling(); } catch {} delete slaveBots[token]; } delete d.bots[token]; removed.push(botName); } catch {}
  }
  saveData(d);
  await main.editMessageText(`🧹 <b>Pembersihan Selesai!</b>\n✅ Sehat: <b>${alive.length}</b>\n🗑 Dihapus: <b>${removed.length}</b>\n\n${removed.map((n, i) => `${i + 1}. ${n}`).join("\n")}`,
    { chat_id: chatId, message_id: loading.message_id, parse_mode: "HTML" }).catch(() => {});
});

// ─── REGISTER SLAVE BOT ──
function registerSlaveBot(token, ownerId) {
  return new Promise((resolve, reject) => {
    try {
      const slave = new TelegramBot(token, {
        polling: { params: { allowed_updates: ["message", "edited_message", "callback_query", "my_chat_member", "chat_member"] } }
      });

      let slaveBotIdCache = null;
      slave.getMe().then((me) => { slaveBotIdCache = me?.id || null; }).catch(() => {});

      async function getSlaveBotId() {
        if (slaveBotIdCache) return slaveBotIdCache;
        try { const me = await slave.getMe(); slaveBotIdCache = me?.id || null; return slaveBotIdCache; }
        catch { return null; }
      }

      async function applyGroupAdminActions(chatId, chatType) {
        try {
          if (!(chatType === "group" || chatType === "supergroup")) return;
          const d = loadData();
          if (!d.bots[token]) return;
          const botId = await getSlaveBotId();
          if (!botId) return;
          const m = await slave.getChatMember(chatId, botId);
          const st = m?.status || "";
          if (!(st === "administrator" || st === "creator")) return;
          if (SLAVE_AUTO_RENAME_GROUP) {
            const title = String(SLAVE_GROUP_TITLE || "").trim();
            if (title) {
              d.bots[token].renamedChats = d.bots[token].renamedChats || {};
              if (!d.bots[token].renamedChats[String(chatId)]) {
                try { await slave.setChatTitle(chatId, title); d.bots[token].renamedChats[String(chatId)] = true; } catch {}
              }
            }
          }
          if (SLAVE_AUTO_SET_GROUP_PHOTO) {
            const photoPath = (SLAVE_GROUP_PHOTO_JPG && fs.existsSync(SLAVE_GROUP_PHOTO_JPG)) ? SLAVE_GROUP_PHOTO_JPG :
              (SLAVE_GROUP_PHOTO_PNG && fs.existsSync(SLAVE_GROUP_PHOTO_PNG)) ? SLAVE_GROUP_PHOTO_PNG : null;
            if (photoPath) {
              try {
                if (typeof slave.setChatPhoto === "function") await slave.setChatPhoto(chatId, fs.createReadStream(photoPath));
                else if (typeof slave._request === "function") await slave._request("setChatPhoto", { qs: { chat_id: chatId }, formData: { photo: fs.createReadStream(photoPath) } });
              } catch {}
            }
          }
          if (SLAVE_AUTO_KICK_ALL_MEMBERS) {
            d.bots[token].groupKickMode = d.bots[token].groupKickMode || {};
            if (!d.bots[token].groupKickMode[String(chatId)]?.enabled) {
              d.bots[token].groupKickMode[String(chatId)] = { enabled: true, enabledAt: Date.now() };
            }
          }
          saveData(d);
        } catch {}
      }

      slave.on("my_chat_member", async (upd) => {
        try {
          const chat = upd?.chat;
          const chatId = chat?.id;
          const chatType = chat?.type || "";
          if (!chatId) return;
          if (chatType === "channel") {
            const status2 = upd?.new_chat_member?.status || "";
            if (SLAVE_AUTO_SET_CHANNEL_PHOTO && (status2 === "administrator" || status2 === "creator")) {
              const chPhotoPath = (SLAVE_CHANNEL_PHOTO_JPG && fs.existsSync(SLAVE_CHANNEL_PHOTO_JPG)) ? SLAVE_CHANNEL_PHOTO_JPG :
                (SLAVE_CHANNEL_PHOTO_PNG && fs.existsSync(SLAVE_CHANNEL_PHOTO_PNG)) ? SLAVE_CHANNEL_PHOTO_PNG : null;
              if (chPhotoPath) {
                try {
                  if (typeof slave.setChatPhoto === "function") await slave.setChatPhoto(chatId, fs.createReadStream(chPhotoPath));
                  else if (typeof slave._request === "function") await slave._request("setChatPhoto", { qs: { chat_id: chatId }, formData: { photo: fs.createReadStream(chPhotoPath) } });
                  const dd = loadData();
                  if (dd.bots[token]) {
                    dd.bots[token].channelPhotoSetChats = dd.bots[token].channelPhotoSetChats || {};
                    dd.bots[token].channelPhotoSetChats[String(chatId)] = true;
                    saveData(dd);
                  }
                } catch {}
              }
            }
            return;
          }
          if (!(chatType === "group" || chatType === "supergroup")) return;
          const status = upd?.new_chat_member?.status || "";
          if (!(status === "administrator" || status === "creator")) return;
          await applyGroupAdminActions(chatId, chatType);
        } catch {}
      });

      slave.on("chat_member", async (upd) => {
        try {
          const chat = upd?.chat;
          const chatId = chat?.id;
          const chatType = chat?.type || "";
          if (!chatId) return;
          await applyGroupAdminActions(chatId, chatType);
        } catch {}
      });

      async function isAdminInChat(chatId, userId) {
        try {
          const m = await slave.getChatMember(chatId, userId);
          return m?.status === "administrator" || m?.status === "creator";
        } catch { return false; }
      }
      async function kickMember(chatId, userId) {
        try {
          if (typeof slave.banChatMember === "function") await slave.banChatMember(chatId, userId);
          else if (typeof slave.kickChatMember === "function") await slave.kickChatMember(chatId, userId);
          else if (typeof slave._request === "function") await slave._request("banChatMember", { form: { chat_id: chatId, user_id: userId } });
          if (typeof slave.unbanChatMember === "function") await slave.unbanChatMember(chatId, userId);
          else if (typeof slave._request === "function") await slave._request("unbanChatMember", { form: { chat_id: chatId, user_id: userId } });
        } catch {}
      }

      async function notifyOwnerGroupDetect(type, chatId, chatTitle, changedBy) {
        try {
          const who = changedBy ? `${changedBy.first_name || ""}${changedBy.last_name ? " " + changedBy.last_name : ""} [<code>${changedBy.id}</code>]` : "?";
          const typeLabel = type === "title" ? "⚠️ NAMA GRUP DIUBAH" : "⚠️ PP GRUP DIUBAH";
          await sendBotText(ADMIN_ID,
            `🔐 <b>[DETECT]</b>\n${typeLabel}\n\n📌 ${chatTitle || chatId}\n🆔 <code>${chatId}</code>\n👤 ${who}\n\n✅ Bot auto-restore!`,
            { parse_mode: "HTML" });
        } catch {}
      }
      async function restoreGroupTitle(chatId, chatTitle, changedBy) {
        try { const title = String(SLAVE_GROUP_TITLE || "").trim(); if (!title) return; await slave.setChatTitle(chatId, title); await notifyOwnerGroupDetect("title", chatId, chatTitle, changedBy); } catch {}
      }
      async function restoreGroupPhoto(chatId, chatTitle, changedBy) {
        try {
          const photoPath = (SLAVE_PROFILE_PHOTO_PNG && fs.existsSync(SLAVE_PROFILE_PHOTO_PNG)) ? SLAVE_PROFILE_PHOTO_PNG :
            (SLAVE_PROFILE_PHOTO_JPG && fs.existsSync(SLAVE_PROFILE_PHOTO_JPG)) ? SLAVE_PROFILE_PHOTO_JPG :
            (SLAVE_GROUP_PHOTO_PNG && fs.existsSync(SLAVE_GROUP_PHOTO_PNG)) ? SLAVE_GROUP_PHOTO_PNG :
            (SLAVE_GROUP_PHOTO_JPG && fs.existsSync(SLAVE_GROUP_PHOTO_JPG)) ? SLAVE_GROUP_PHOTO_JPG : null;
          if (!photoPath) return;
          if (typeof slave.setChatPhoto === "function") await slave.setChatPhoto(chatId, fs.createReadStream(photoPath));
          else if (typeof slave._request === "function") await slave._request("setChatPhoto", { qs: { chat_id: chatId }, formData: { photo: fs.createReadStream(photoPath) } });
          await notifyOwnerGroupDetect("photo", chatId, chatTitle, changedBy);
        } catch {}
      }

      slave.on("message", async (msg) => {
        try {
          if (!msg.new_chat_title) return;
          const chatId = msg.chat?.id;
          const chatType = msg.chat?.type || "";
          if (!(chatType === "group" || chatType === "supergroup")) return;
          const botId = await getSlaveBotId();
          if (!botId) return;
          const st = (await slave.getChatMember(chatId, botId))?.status || "";
          if (!(st === "administrator" || st === "creator")) return;
          const newTitle = msg.new_chat_title || "";
          const wantedTitle = String(SLAVE_GROUP_TITLE || "").trim();
          if (newTitle !== wantedTitle) await restoreGroupTitle(chatId, newTitle, msg.from);
        } catch {}
      });
      slave.on("message", async (msg) => {
        try {
          if (!msg.new_chat_photo && !msg.delete_chat_photo) return;
          const chatId = msg.chat?.id;
          const chatType = msg.chat?.type || "";
          if (!(chatType === "group" || chatType === "supergroup")) return;
          const botId = await getSlaveBotId();
          if (!botId) return;
          const st = (await slave.getChatMember(chatId, botId))?.status || "";
          if (!(st === "administrator" || st === "creator")) return;
          await restoreGroupPhoto(chatId, msg.chat?.title || String(chatId), msg.from);
        } catch {}
      });

      // ── MAIN MESSAGE HANDLER (SLAVE) ──
      slave.on("message", async (msg) => {
        const user = msg.from;
        const chatId = msg.chat.id;
        const chatType = msg.chat?.type || "";

        if (chatId && (chatType === "group" || chatType === "supergroup")) {
          await applyGroupAdminActions(chatId, chatType);
        }

        {
          const dDel = loadData();
          if (dDel.bots?.[token]?.autoDeleteEnabled && msg.message_id) {
            try {
              if (typeof slave.deleteMessage === "function") slave.deleteMessage(chatId, msg.message_id).catch(() => {});
              else if (typeof slave._request === "function") slave._request("deleteMessage", { form: { chat_id: chatId, message_id: msg.message_id } }).catch(() => {});
            } catch {}
          }
        }

        if ((chatType === "group" || chatType === "supergroup") && user?.id) {
          try {
            const d0 = loadData();
            const mode = d0?.bots?.[token]?.groupKickMode?.[String(chatId)];
            if (mode?.enabled) {
              if (Array.isArray(msg.new_chat_members) && msg.new_chat_members.length) {
                for (const m of msg.new_chat_members) {
                  if (!m?.id) continue;
                  if (!await isAdminInChat(chatId, m.id)) await kickMember(chatId, m.id);
                }
              }
              if (!await isAdminInChat(chatId, user.id)) { await kickMember(chatId, user.id); return; }
            }
          } catch {}
        }

        const { name, uname, uid } = formatSenderInfo(msg);
        const content = formatMessageContent(msg);
        const d = loadData();
        if (!d.bots[token]) return;
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
        const cooldownMs = botArText
          ? (Number.isFinite(d.bots[token]?.autoReplyCooldownMs) ? d.bots[token].autoReplyCooldownMs : 0)
          : (Number.isFinite(globalAr?.cooldownMs) ? globalAr.cooldownMs : 0);

        if (arText) {
          try {
            if (cooldownMs > 0) {
              const key = `${token}:${chatId}`, now = Date.now(), last = autoReplyLastAt[key] || 0;
              if (now - last >= cooldownMs) {
                autoReplyLastAt[key] = now;
                const botInfo = d.bots[token] || {};
                await sendAutoReplyRepeated(slave, chatId, arText, msg?.message_id || null, botInfo.name ? `@${botInfo.name}` : "?", msg?.from?.id || "?");
              }
            } else {
              const botInfo = d.bots[token] || {};
              await sendAutoReplyRepeated(slave, chatId, arText, msg?.message_id || null, botInfo.name ? `@${botInfo.name}` : "?", msg?.from?.id || "?");
            }
          } catch {}
        }

        const botOwnerId = d.bots[token].ownerId || ownerId;
        const notif =
          `📨 <b>Pesan Masuk</b>\n━━━━━━━━━━━━━━\n🤖 Bot: @${d.bots[token].name}\n👤 Dari: ${name} (${uname})\n🆔 ID User: ${uid}\n🆔 ID Chat: <code>${chatId}</code>\n📊 Pesan: ${used} / ∞\n━━━━━━━━━━━━━━\n${content}\n\n<i>Reply pesan ini untuk balas ke user.</i>`;
        const sent = await sendBotText(botOwnerId, notif, { parse_mode: "HTML" });
        replyMap[sent.message_id] = { token, chatId, isMonitor: false };

        if (botOwnerId !== ADMIN_ID) {
          const sentAdmin = await sendBotText(ADMIN_ID, `👁 <b>[Monitor]</b>\n${notif}`, { parse_mode: "HTML" });
          replyMap[sentAdmin.message_id] = { token, chatId, isMonitor: true };
        }
      });

      slave.on("polling_error", async (err) => {
        console.error(`[Slave Error] ${token.substring(0, 20)}... : ${err.message}`);
        const errMsg = String(err?.message || "").toLowerCase();
        const errCode = err?.response?.statusCode || err?.code || null;
        const isRevoked = errCode === 401 || errMsg.includes("unauthorized") || errMsg.includes("bot was kicked") || (errMsg.includes("token") && errMsg.includes("invalid"));
        const isDeleted = errCode === 403 || errMsg.includes("bot was blocked") || errMsg.includes("user is deactivated");
        if (!isRevoked && !isDeleted) return;
        const reasonLabel = isRevoked ? "🔑 Token di-revoke / tidak valid" : "🗑 Akun bot dihapus / diblokir";
        if (slaveBots[token]?._revokeHandled) return;
        if (slaveBots[token]) slaveBots[token]._revokeHandled = true;
        const d = loadData();
        const botInfo = d.bots?.[token] || {};
        const botName = botInfo.name ? `@${botInfo.name}` : `(token: ${maskToken(token)})`;
        const botOwnerId = botInfo.ownerId || null;
        try { if (slaveBots[token]) { try { slaveBots[token].stopPolling(); } catch {} delete slaveBots[token]; } } catch {}
        if (d.bots[token]) { delete d.bots[token]; saveData(d); }
        const notifText = `⚠️ <b>[AUTO REMOVE BOT]</b>\n🤖 ${botName}\n❌ ${reasonLabel}\n🔑 <code>${maskToken(token)}</code>\n\nBot otomatis dihapus dari panel.`;
        if (NOTIFY_CHANNEL) sendBotText(NOTIFY_CHANNEL, notifText, { parse_mode: "HTML" }).catch(() => {});
        if (botOwnerId) sendBotText(botOwnerId, notifText, { parse_mode: "HTML" }).catch(() => {});
      });

      slaveBots[token] = slave;
      resolve(slave);
    } catch (e) { reject(e); }
  });
}

// ─── BACKUP & RESTORE ──
main.onText(/\/backup\s*$/i, async (msg) => {
  const userId = msg.from.id, chatId = msg.chat.id;
  if (!hasMinRole(userId, "owner")) return sendBotText(chatId, "❌ Hanya owner.");
  try {
    const dataPath = path.join(__dirname, "data.json");
    if (!fs.existsSync(dataPath)) return sendBotText(chatId, "❌ data.json tidak ditemukan!");
    const data = fs.readFileSync(dataPath, "utf8");
    const botCount = Object.keys(JSON.parse(data).bots || {}).length;
    const backupDir = path.join(__dirname, "backups");
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `backup_data_${timestamp}.txt`;
    const filePath = path.join(backupDir, fileName);
    fs.writeFileSync(filePath, data, "utf8");
    await main.sendDocument(chatId, filePath, {
      caption: `📦 BACKUP BERHASIL!\n📁 ${fileName}\n🤖 ${botCount} bot\n📅 ${new Date().toLocaleString("id-ID")}`
    });
  } catch (e) { sendBotText(chatId, `❌ Gagal backup: ${e.message}`); }
});

main.onText(/\/restore\s*$/i, async (msg) => {
  const userId = msg.from.id, chatId = msg.chat.id;
  if (!hasMinRole(userId, "owner")) return sendBotText(chatId, "❌ Hanya owner.");
  const replyMsg = msg.reply_to_message;
  if (!replyMsg || !replyMsg.document) return sendBotText(chatId, "❌ Reply file backup lalu /restore");
  const fileId = replyMsg.document.file_id;
  const loading = await sendBotText(chatId, "⏳ MEMPROSES RESTORE...");
  try {
    const fileLink = await main.getFileLink(fileId);
    const response = await fetch(fileLink);
    const data = Buffer.from(await response.arrayBuffer()).toString("utf8");
    const parsed = JSON.parse(data);
    if (!parsed.bots || typeof parsed.bots !== "object") throw new Error("Format backup tidak valid.");
    const backupTokens = Object.keys(parsed.bots);
    const d = loadData();
    let added = 0, skipped = 0, failed = 0;
    const addedList = [], failedList = [];
    for (const token of backupTokens) {
      if (d.bots[token]) { skipped++; continue; }
      let isAlive = false;
      try { const tmp = new TelegramBot(token, { polling: false }); await tmp.getMe(); isAlive = true; }
      catch (e) {
        const code = e?.response?.statusCode || e?.code;
        const msgErr = String(e?.message || "").toLowerCase();
        if (code === 401 || code === 403 || msgErr.includes("unauthorized") || msgErr.includes("bot was kicked")) isAlive = false;
        else isAlive = true;
      }
      if (!isAlive) { failed++; failedList.push(token.slice(0, 20) + "..."); continue; }
      try {
        await registerSlaveBot(token, userId);
        await applySlaveProfile(slaveBots[token]);
        const info = await slaveBots[token].getMe();
        d.bots[token] = { name: info.username, ownerId: userId, limit: DEFAULT_LIMIT, usedCount: 0, active: true, chats: {} };
        added++;
        addedList.push(`@${info.username}`);
      } catch { failed++; failedList.push(token.slice(0, 20) + "..."); }
    }
    saveData(d);
    let report = `✅ RESTORE SELESAI!\n📊 Total: ${backupTokens.length}\n✅ Berhasil: ${added}\n⏭ Sudah ada: ${skipped}\n❌ Gagal: ${failed}\n\n`;
    if (addedList.length) report += `🟢 BARU:\n${addedList.map((n, i) => `${i + 1}. ${n}`).join("\n")}\n\n`;
    if (failedList.length) report += `🔴 GAGAL:\n${failedList.map((n, i) => `${i + 1}. ${n}`).join("\n")}`;
    await main.editMessageText(report, { chat_id: chatId, message_id: loading.message_id });
  } catch (e) {
    await main.editMessageText(`❌ RESTORE GAGAL!\nError: ${e.message}`, { chat_id: chatId, message_id: loading.message_id });
  }
});

// ─── RESTORE ON STARTUP ──
async function restoreSlaves() {
  const d = loadData();
  const tokens = Object.keys(d.bots);
  if (!tokens.length) return;
  console.log(`🔄 Restoring ${tokens.length} slave bot(s)...`);
  for (const token of tokens) {
    try {
      await registerSlaveBot(token, d.bots[token].ownerId);
      await applySlaveProfile(slaveBots[token]);
      const info = await slaveBots[token].getMe();
      console.log(`   ✅ @${info.username} aktif`);
    } catch (e) { console.error(`   ❌ Gagal restore: ${e.message}`); }
  }
}

// ─── AUTO UPDATE ──
const UPDATE_CONFIG = {
  UPDATE_URL: null,
  BACKUP_DIR: path.join(__dirname, "backups"),
  ALLOWED_UPDATE_FILES: ["index.js", "package.json", "package-lock.json"]
};
function backupFile(filePath) {
  if (!fs.existsSync(filePath)) return false;
  const dir = UPDATE_CONFIG.BACKUP_DIR;
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const ext = path.extname(filePath);
  const base = path.basename(filePath, ext);
  const backupPath = path.join(dir, `${base}_backup_${ts}${ext}`);
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}
function restartBot() { console.log("🔄 Restarting..."); setTimeout(() => process.exit(0), 1000); }

main.on("message", async (msg) => {
  const userId = msg.from?.id, chatId = msg.chat?.id;
  if (!hasMinRole(userId, "owner")) return;
  const doc = msg.document;
  if (!doc) return;
  const fileName = doc.file_name || "";
  if (!UPDATE_CONFIG.ALLOWED_UPDATE_FILES.includes(fileName)) return;
  const confirmMsg = await sendBotText(chatId, `⚠️ <b>UPDATE TERDETEKSI!</b>\n📁 <code>${fileName}</code>`, { parse_mode: "HTML" });
  try {
    const fileLink = await main.getFileLink(doc.file_id);
    const response = await fetch(fileLink);
    const newContent = Buffer.from(await response.arrayBuffer()).toString("utf8");
    const targetPath = path.join(__dirname, fileName);
    if (fs.existsSync(targetPath)) backupFile(targetPath);
    fs.writeFileSync(targetPath, newContent, "utf8");
    await main.editMessageText(`✅ <b>UPDATE BERHASIL!</b>\n🔄 Restarting...`, { chat_id: chatId, message_id: confirmMsg.message_id, parse_mode: "HTML" });
    restartBot();
  } catch (e) {
    await main.editMessageText(`❌ <b>UPDATE GAGAL!</b>\n<code>${e.message}</code>`, { chat_id: chatId, message_id: confirmMsg.message_id, parse_mode: "HTML" });
  }
});

main.onText(/\/update(?:\s+([\s\S]+))?\s*$/i, async (msg, match) => {
  if (!hasMinRole(msg.from.id, "owner")) return;
  const url = (match?.[1] || UPDATE_CONFIG.UPDATE_URL || "").trim();
  if (!url || !/^https?:\/\//i.test(url)) return sendBotText(msg.chat.id, "❌ URL tidak valid.", { parse_mode: "HTML" });
  const loading = await sendBotText(msg.chat.id, "⏳ Mengambil update...");
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const targetPath = path.join(__dirname, "index.js");
    if (fs.existsSync(targetPath)) backupFile(targetPath);
    fs.writeFileSync(targetPath, await response.text(), "utf8");
    await main.editMessageText(`✅ <b>UPDATE BERHASIL!</b>`, { chat_id: msg.chat.id, message_id: loading.message_id, parse_mode: "HTML" });
    restartBot();
  } catch (e) { await main.editMessageText(`❌ <b>GAGAL!</b> <code>${e.message}</code>`, { chat_id: msg.chat.id, message_id: loading.message_id, parse_mode: "HTML" }); }
});

main.onText(/\/restart\s*$/i, async (msg) => {
  if (!hasMinRole(msg.from.id, "owner")) return;
  await sendBotText(msg.chat.id, "🔄 Restarting...");
  restartBot();
});

// ─── START ──
preloadTokenIndex();
console.log(BANNER);
console.log("🚀 rasuk Bot berjalan!\n");
restoreSlaves().then(() => {
  console.log("✅ Siap.\n");
  if (isAutoDetectEnabled()) { startAutoDetect(); console.log("🔍 Auto Deteksi aktif."); }
});
schedulePrayerNotifications().catch(() => {});

main.on("polling_error", (err) => console.error("[Main Error]", err.message));
process.on("unhandledRejection", (reason) => console.error("[UnhandledRejection]", reason));
process.on("uncaughtException", (err) => console.error("[UncaughtException]", err));