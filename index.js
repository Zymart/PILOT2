// Fix for ReadableStream error in Replit
if (!global.ReadableStream) {
  global.ReadableStream = require('stream/web').ReadableStream;
}

const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder } = require('discord.js');
const https = require('https');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const PREFIX = '!';
const OWNER_ID = '730629579533844512';

const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY || '';
const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID || '';

// ==================== DATA STORAGE ====================

async function loadData() {
  if (!JSONBIN_API_KEY || !JSONBIN_BIN_ID) {
    console.log('⚠️ JSONBin not configured, using empty data');
    return getEmptyData();
  }

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.jsonbin.io',
      path: `/v3/b/${JSONBIN_BIN_ID}/latest`,
      method: 'GET',
      headers: { 'X-Master-Key': JSONBIN_API_KEY }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const record = json.record || {};
          resolve(parseData(record));
        } catch (err) {
          console.error('Error parsing data:', err.message);
          resolve(getEmptyData());
        }
      });
    });

    req.on('error', (err) => {
      console.error('Error loading data:', err.message);
      resolve(getEmptyData());
    });

    req.end();
  });
}

async function saveData() {
  if (!JSONBIN_API_KEY || !JSONBIN_BIN_ID) {
    console.log('⚠️ JSONBin not configured, data not saved to cloud');
    return;
  }

  const data = {
    ticketCategories: Object.fromEntries(ticketCategories),
    orderChannels: Object.fromEntries(orderChannels),
    doneChannels: Object.fromEntries(doneChannels),
    adminUsers: Object.fromEntries(adminUsers),
    ticketChannels: Object.fromEntries(ticketChannels),
    webCategories: Object.fromEntries(webCategories),
    shopListings: Object.fromEntries(
      Array.from(shopListings.entries()).map(([guildId, userMap]) => [
        guildId,
        Object.fromEntries(userMap)
      ])
    ),
    ticketOwners: Object.fromEntries(ticketOwners),
    shopCategories: Object.fromEntries(shopCategories),
    transcriptChannels: Object.fromEntries(transcriptChannels),
    tradeChannels: Object.fromEntries(tradeChannels),
    shopNews: Object.fromEntries(shopNews),
    gameCategories: Object.fromEntries(gameCategories)
  };

  return new Promise((resolve) => {
    const jsonData = JSON.stringify(data);
    const options = {
      hostname: 'api.jsonbin.io',
      path: `/v3/b/${JSONBIN_BIN_ID}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_API_KEY,
        'Content-Length': Buffer.byteLength(jsonData)
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('💾 Data saved to cloud');
        } else {
          console.error('❌ Failed to save data:', res.statusCode);
        }
        resolve();
      });
    });

    req.on('error', (err) => {
      console.error('Error saving data:', err.message);
      resolve();
    });

    req.write(jsonData);
    req.end();
  });
}

function parseData(data) {
  return {
    ticketCategories: new Map(Object.entries(data.ticketCategories || {})),
    orderChannels: new Map(Object.entries(data.orderChannels || {})),
    doneChannels: new Map(Object.entries(data.doneChannels || {})),
    adminUsers: new Map(Object.entries(data.adminUsers || {}).map(([k, v]) => [k, v || []])),
    ticketChannels: new Map(Object.entries(data.ticketChannels || {}).map(([k, v]) => [k, v || []])),
    webCategories: new Map(Object.entries(data.webCategories || {})),
    shopListings: new Map(Object.entries(data.shopListings || {}).map(([k, v]) => [k, new Map(Object.entries(v || {}))])),
    ticketOwners: new Map(Object.entries(data.ticketOwners || {})),
    shopCategories: new Map(Object.entries(data.shopCategories || {})),
    transcriptChannels: new Map(Object.entries(data.transcriptChannels || {})),
    tradeChannels: new Map(Object.entries(data.tradeChannels || {})),
    shopNews: new Map(Object.entries(data.shopNews || {})),
    gameCategories: new Map(Object.entries(data.gameCategories || {}).map(([k, v]) => [k, v || []]))
  };
}

function getEmptyData() {
  return {
    ticketCategories: new Map(),
    orderChannels: new Map(),
    doneChannels: new Map(),
    adminUsers: new Map(),
    ticketChannels: new Map(),
    webCategories: new Map(),
    shopListings: new Map(),
    ticketOwners: new Map(),
    shopCategories: new Map(),
    transcriptChannels: new Map(),
    tradeChannels: new Map(),
    shopNews: new Map(),
    gameCategories: new Map()
  };
}

// Global data maps
let ticketCategories = new Map();
let orderChannels = new Map();
let doneChannels = new Map();
let adminUsers = new Map();
let ticketChannels = new Map();
let webCategories = new Map();
let shopListings = new Map();
let ticketOwners = new Map();
let shopCategories = new Map();
let transcriptChannels = new Map();
let tradeChannels = new Map();
let shopNews = new Map();
let gameCategories = new Map(); // NEW: Store game categories per guild

// ==================== BOT READY ====================

client.once('ready', async () => {
  console.log(`✅ Bot is online as ${client.user.tag}`);
  const loadedData = await loadData();
  ticketCategories = loadedData.ticketCategories;
  orderChannels = loadedData.orderChannels;
  doneChannels = loadedData.doneChannels;
  adminUsers = loadedData.adminUsers;
  ticketChannels = loadedData.ticketChannels;
  webCategories = loadedData.webCategories;
  shopListings = loadedData.shopListings;
  ticketOwners = loadedData.ticketOwners;
  shopCategories = loadedData.shopCategories;
  transcriptChannels = loadedData.transcriptChannels;
  tradeChannels = loadedData.tradeChannels;
  shopNews = loadedData.shopNews || new Map();
  gameCategories = loadedData.gameCategories || new Map();
  console.log('✅ Data loaded from cloud storage');

  setInterval(async () => {
    await cleanupOrphanedData();
  }, 3600000);
});

async function cleanupOrphanedData() {
  console.log('🧹 Running cleanup...');
  let cleaned = false;

  for (const [ticketId, channels] of ticketChannels.entries()) {
    const guild = client.guilds.cache.find(g => g.channels.cache.has(ticketId));
    if (!guild) {
      ticketChannels.delete(ticketId);
      ticketOwners.delete(ticketId);
      cleaned = true;
      console.log(`🗑️ Removed orphaned ticket ${ticketId}`);
    }
  }

  for (const [guildId, shops] of shopListings.entries()) {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      shopListings.delete(guildId);
      cleaned = true;
      console.log(`🗑️ Removed shop data for deleted guild ${guildId}`);
      continue;
    }

    for (const [userId, items] of shops.entries()) {
      const member = await guild.members.fetch(userId).catch(() => null);
      if (!member) {
        shops.delete(userId);
        cleaned = true;
        console.log(`🗑️ Removed shop items for user ${userId} who left`);
      }
    }
  }

  if (cleaned) {
    await saveData();
    console.log('✅ Cleanup complete');
  } else {
    console.log('✅ No cleanup needed');
  }
}

// ==================== MESSAGE COMMANDS ====================

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  const isOwner = message.author.id === OWNER_ID;
  const admins = adminUsers.get(message.guild.id) || [];
  const isAdmin = admins.includes(message.author.id);
  const canUseCommands = isOwner || isAdmin;

  // ========== ADMIN MANAGEMENT ==========

  if (command === 'admadm') {
    if (!isOwner) return message.reply('❌ Only the owner can use this command!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const userId = args[0];
    if (!userId) return message.reply('Usage: `!admadm USER_ID`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const guildAdmins = adminUsers.get(message.guild.id) || [];
    if (guildAdmins.includes(userId)) return message.reply('❌ This user is already an admin!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    guildAdmins.push(userId);
    adminUsers.set(message.guild.id, guildAdmins);
    saveData();
    const user = await client.users.fetch(userId).catch(() => null);
    message.reply(`✅ Added **${user ? user.tag : userId}** as admin!`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    message.delete().catch(() => {});
  }

  if (command === 'admrem') {
    if (!isOwner) return message.reply('❌ Only the owner can use this command!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const userId = args[0];
    if (!userId) return message.reply('Usage: `!admrem USER_ID`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const guildAdmins = adminUsers.get(message.guild.id) || [];
    const index = guildAdmins.indexOf(userId);
    if (index === -1) return message.reply('❌ This user is not an admin!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    guildAdmins.splice(index, 1);
    adminUsers.set(message.guild.id, guildAdmins);
    saveData();
    const user = await client.users.fetch(userId).catch(() => null);
    message.reply(`✅ Removed **${user ? user.tag : userId}** from admins!`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    message.delete().catch(() => {});
  }

  if (command === 'admlist') {
    if (!canUseCommands) return message.reply('❌ You don\'t have permission!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const guildAdmins = adminUsers.get(message.guild.id) || [];
    if (guildAdmins.length === 0) return message.reply('📋 No admins added yet!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    let adminList = '📋 **Admin List:**\n\n';
    for (const userId of guildAdmins) {
      const user = await client.users.fetch(userId).catch(() => null);
      adminList += `• ${user ? user.tag : userId} (${userId})\n`;
    }
    message.reply(adminList).then(msg => setTimeout(() => msg.delete().catch(() => {}), 30000));
    message.delete().catch(() => {});
  }

  // Permission check for other commands
  if (!canUseCommands && command !== 'admadm' && command !== 'admrem' && command !== 'admlist') {
    const hasModerator = message.member.roles.cache.some(r => 
      r.name.toLowerCase().includes('moderator') || 
      r.name.toLowerCase().includes('mod') ||
      r.permissions.has(PermissionFlagsBits.Administrator)
    );
    if (!hasModerator) return message.reply('❌ You don\'t have permission!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
  }

  // ========== GAME CATEGORY MANAGEMENT ==========

  if (command === 'addgame') {
    if (!canUseCommands) return message.reply('❌ You don\'t have permission!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const gameName = args.join(' ');
    if (!gameName) return message.reply('Usage: `!addgame Game Name`\nExample: `!addgame Anime Vanguard`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));

    const guildGames = gameCategories.get(message.guild.id) || [];
    if (guildGames.includes(gameName)) {
      return message.reply(`❌ **${gameName}** already exists!`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }

    guildGames.push(gameName);
    gameCategories.set(message.guild.id, guildGames);
    await saveData();
    message.reply(`✅ Added game category: **${gameName}**`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    message.delete().catch(() => {});
  }

  if (command === 'removegame') {
    if (!canUseCommands) return message.reply('❌ You don\'t have permission!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const gameName = args.join(' ');
    if (!gameName) return message.reply('Usage: `!removegame Game Name`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));

    const guildGames = gameCategories.get(message.guild.id) || [];
    const index = guildGames.indexOf(gameName);
    if (index === -1) {
      return message.reply(`❌ **${gameName}** not found!`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }

    guildGames.splice(index, 1);
    gameCategories.set(message.guild.id, guildGames);
    await saveData();
    message.reply(`✅ Removed game category: **${gameName}**`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    message.delete().catch(() => {});
  }

  if (command === 'listgames') {
    const guildGames = gameCategories.get(message.guild.id) || [];
    if (guildGames.length === 0) {
      return message.reply('📋 No game categories yet! Use `!addgame Game Name` to add one.').then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    }

    let gameList = '🎮 **Game Categories:**\n\n';
    guildGames.forEach((game, index) => {
      gameList += `${index + 1}. ${game}\n`;
    });
    message.reply(gameList).then(msg => setTimeout(() => msg.delete().catch(() => {}), 30000));
    message.delete().catch(() => {});
  }

  // ========== EMBED COMMANDS ==========

  if (command === 'embed') {
    const text = args.join(' ');
    if (!text) return message.reply('Usage: `!embed Your message here`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setDescription(text)
      .setTimestamp()
      .setFooter({ text: `Designed by ${message.author.username}`, iconURL: message.author.displayAvatarURL() });
    try {
      await message.delete();
      const sentMessage = await message.channel.send({ embeds: [embed] });
      await sentMessage.react('✨');
    } catch (err) {
      console.error(err);
      message.reply('❌ Failed!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }
  }

  if (command === 'fancy') {
    const fullText = args.join(' ');
    if (!fullText) return message.reply('Usage: `!fancy Title\nYour message`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const lines = fullText.split('\n');
    const title = lines[0];
    const text = lines.slice(1).join('\n');
    const embed = new EmbedBuilder()
      .setColor('#FF00FF')
      .setTitle(`✨ ${title} ✨`)
      .setTimestamp()
      .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() })
      .setThumbnail(message.author.displayAvatarURL());
    if (text.trim()) embed.setDescription(`>>> ${text}`);
    try {
      await message.delete();
      const sentMessage = await message.channel.send({ embeds: [embed] });
      await sentMessage.react('💖');
    } catch (err) {
      console.error(err);
    }
  }

  if (command === 'announce') {
    const text = args.join(' ');
    if (!text) return message.reply('Usage: `!announce Your announcement`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle('📢 ANNOUNCEMENT')
      .setDescription(text)
      .setTimestamp()
      .setFooter({ text: `Announced by ${message.author.username}`, iconURL: message.author.displayAvatarURL() });
    try {
      await message.delete();
      const sentMessage = await message.channel.send({ embeds: [embed] });
      await sentMessage.react('📢');
    } catch (err) {
      console.error(err);
    }
  }

  if (command === 'quote') {
    const text = args.join(' ');
    if (!text) return message.reply('Usage: `!quote Your quote`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const embed = new EmbedBuilder()
      .setColor('#2F3136')
      .setDescription(`*"${text}"*`)
      .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();
    try {
      await message.delete();
      const sentMessage = await message.channel.send({ embeds: [embed] });
      await sentMessage.react('💬');
    } catch (err) {
      console.error(err);
    }
  }

  if (command === 'colorembed') {
    const color = args[0];
    const text = args.slice(1).join(' ');
    if (!color || !text) return message.reply('Usage: `!colorembed #FF0000 Message`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const embed = new EmbedBuilder()
      .setColor(color)
      .setDescription(text)
      .setTimestamp()
      .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() });
    try {
      await message.delete();
      await message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      message.reply('❌ Invalid color!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }
  }

  if (command === 'success') {
    const text = args.join(' ');
    if (!text) return message.reply('Usage: `!success Message`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const embed = new EmbedBuilder().setColor('#00FF00').setTitle('✅ Success').setDescription(text).setTimestamp();
    try {
      await message.delete();
      await message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error(err);
    }
  }

  if (command === 'error') {
    const text = args.join(' ');
    if (!text) return message.reply('Usage: `!error Message`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const embed = new EmbedBuilder().setColor('#FF0000').setTitle('❌ Error').setDescription(text).setTimestamp();
    try {
      await message.delete();
      await message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error(err);
    }
  }

  if (command === 'info') {
    const text = args.join(' ');
    if (!text) return message.reply('Usage: `!info Message`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const embed = new EmbedBuilder().setColor('#00BFFF').setTitle('ℹ️ Information').setDescription(text).setTimestamp();
    try {
      await message.delete();
      await message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error(err);
    }
  }

  if (command === 'auto') {
    let text = args.join(' ');
    if (!text) return message.reply('Usage: `!auto Message`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const fancyFont = (str) => {
      const normal = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const fancy = '𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵';
      return str.split('').map(char => {
        const index = normal.indexOf(char);
        return index !== -1 ? fancy[index] : char;
      }).join('');
    };
    text = fancyFont(text);
    const lines = text.split('\n');
    const processedLines = lines.map(line => {
      const l = line.toLowerCase();
      if (l.includes('service') || l.includes('offer')) return `💸 ${line}`;
      if (l.includes('pilot')) return `✈️ ${line}`;
      if (l.includes('broly') || l.includes('strong')) return `💪 ${line}`;
      if (l.includes('goku') || l.includes('fire')) return `🔥 ${line}`;
      if (l.includes('vegeta') || l.includes('power')) return `⚡ ${line}`;
      if (l.includes('php') || l.includes('price') || l.includes('=')) return `💰 ${line}`;
      if (l.includes('diamond') || l.includes('rare')) return `💎 ${line}`;
      if (l.includes('premium') || l.includes('vip')) return `👑 ${line}`;
      if (l.includes('rank') || l.includes('top')) return `🏆 ${line}`;
      if (l.includes('boost')) return `🚀 ${line}`;
      if (l.includes('new')) return `🆕 ${line}`;
      if (l.includes('sale') || l.includes('hot')) return `🔥 ${line}`;
      if (l.includes('discount')) return `💥 ${line}`;
      return `✨ ${line}`;
    });
    text = processedLines.join('\n');
    const embed = new EmbedBuilder()
      .setColor('#FF6B9D')
      .setDescription(text)
      .setTimestamp()
      .setFooter({ text: `Styled by ${message.author.username}`, iconURL: message.author.displayAvatarURL() });
    try {
      await message.delete();
      const sentMessage = await message.channel.send({ embeds: [embed] });
      await sentMessage.react('✨');
    } catch (err) {
      console.error(err);
    }
  }

  // ========== CONFIGURATION COMMANDS ==========

  if (command === 'concategory') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ Admin only!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const categoryId = args[0];
    if (!categoryId) return message.reply('Usage: `!concategory CATEGORY_ID`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const category = message.guild.channels.cache.get(categoryId);
    if (!category || category.type !== ChannelType.GuildCategory) return message.reply('❌ Invalid category!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    ticketCategories.set(message.guild.id, categoryId);
    saveData();
    message.reply(`✅ Ticket category set to: **${category.name}**`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    message.delete().catch(() => {});
  }

  if (command === 'conweb') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ Admin only!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const categoryId = args[0];
    if (!categoryId) return message.reply('Usage: `!conweb CATEGORY_ID`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const category = message.guild.channels.cache.get(categoryId);
    if (!category || category.type !== ChannelType.GuildCategory) return message.reply('❌ Invalid category!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    webCategories.set(message.guild.id, categoryId);
    saveData();
    message.reply(`✅ Webhook category set to: **${category.name}**`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    message.delete().catch(() => {});
  }

  if (command === 'conorders') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ Admin only!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const channelId = args[0];
    if (!channelId) return message.reply('Usage: `!conorders CHANNEL_ID`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const channel = message.guild.channels.cache.get(channelId);
    if (!channel || channel.type !== ChannelType.GuildText) return message.reply('❌ Invalid channel!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    orderChannels.set(message.guild.id, channelId);
    saveData();
    message.reply(`✅ Orders log set to: <#${channelId}>`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    message.delete().catch(() => {});
  }

  if (command === 'condone') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ Admin only!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const channelId = args[0];
    if (!channelId) return message.reply('Usage: `!condone CHANNEL_ID`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const channel = message.guild.channels.cache.get(channelId);
    if (!channel || channel.type !== ChannelType.GuildText) return message.reply('❌ Invalid channel!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    doneChannels.set(message.guild.id, channelId);
    saveData();
    message.reply(`✅ Done log set to: <#${channelId}>`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    message.delete().catch(() => {});
  }

  if (command === 'conshop') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ Admin only!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const categoryId = args[0];
    if (!categoryId) return message.reply('Usage: `!conshop CATEGORY_ID`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const category = message.guild.channels.cache.get(categoryId);
    if (!category || category.type !== ChannelType.GuildCategory) return message.reply('❌ Invalid category!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    shopCategories.set(message.guild.id, categoryId);
    saveData();
    message.reply(`✅ Shop category set to: **${category.name}**`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    message.delete().catch(() => {});
  }

  if (command === 'contrade') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ Admin only!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const channelId = args[0];
    if (!channelId) return message.reply('Usage: `!contrade CHANNEL_ID`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const channel = message.guild.channels.cache.get(channelId);
    if (!channel || channel.type !== ChannelType.GuildText) return message.reply('❌ Invalid channel!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    tradeChannels.set(message.guild.id, channelId);
    saveData();
    message.reply(`✅ Trade log set to: <#${channelId}>`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    message.delete().catch(() => {});
  }

  if (command === 'contranscript') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ Admin only!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const channelId = args[0];
    if (!channelId) return message.reply('Usage: `!contranscript CHANNEL_ID`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const channel = message.guild.channels.cache.get(channelId);
    if (!channel || channel.type !== ChannelType.GuildText) return message.reply('❌ Invalid channel!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    transcriptChannels.set(message.guild.id, channelId);
    saveData();
    message.reply(`✅ Transcript log set to: <#${channelId}>`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    message.delete().catch(() => {});
  }

  if (command === 'connews') {
    if (!canUseCommands) return message.reply('❌ You don\'t have permission!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const channelId = args[0];
    if (!channelId) return message.reply('Usage: `!connews CHANNEL_ID`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const channel = message.guild.channels.cache.get(channelId);
    if (!channel || channel.type !== ChannelType.GuildText) return message.reply('❌ Invalid channel!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    shopNews.set(message.guild.id, channelId);
    saveData();
    message.reply(`✅ Shop news channel set to: <#${channelId}>`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    message.delete().catch(() => {});
  }

  // ========== STOCK MANAGEMENT COMMAND ==========

  if (command === 'stock') {
    if (!canUseCommands) return message.reply('❌ You don\'t have permission!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));

    const action = args[0];
    const amount = parseInt(args[1]);
    const userId = args[2];
    const itemName = args.slice(3).join(' ');

    if (!action || !amount || !userId || !itemName) {
      return message.reply('Usage: `!stock +/- AMOUNT USER_ID ITEM_NAME`\nExample: `!stock + 10 123456789 Diamond Sword`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    }

    if (action !== '+' && action !== '-') {
      return message.reply('❌ Action must be `+` or `-`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }

    if (isNaN(amount) || amount <= 0) {
      return message.reply('❌ Amount must be a positive number!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }

    const guildShops = shopListings.get(message.guild.id) || new Map();
    let userItems = guildShops.get(userId) || [];

    const item = userItems.find(i => i.name.toLowerCase() === itemName.toLowerCase());

    if (!item) {
      return message.reply(`❌ Item **${itemName}** not found for user <@${userId}>!`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }

    const oldStock = item.stock || 0;

    if (action === '+') {
      item.stock = oldStock + amount;
    } else {
      item.stock = Math.max(0, oldStock - amount);
    }

    guildShops.set(userId, userItems);
    shopListings.set(message.guild.id, guildShops);
    await saveData();

    const user = await client.users.fetch(userId).catch(() => null);
    const stockEmbed = new EmbedBuilder()
      .setColor(action === '+' ? '#00FF00' : '#FF6B35')
      .setAuthor({ 
        name: action === '+' ? '📈 Stock Increased' : '📉 Stock Decreased', 
        iconURL: message.guild.iconURL() 
      })
      .setTitle(`${item.name}`)
      .setDescription(`Stock has been ${action === '+' ? '**increased**' : '**decreased**'} successfully!`)
      .addFields(
        { name: '🎮 Game', value: `\`\`\`${item.gameCategory || 'N/A'}\`\`\``, inline: true },
        { name: '👤 Seller', value: `${user ? user : `<@${userId}>`}`, inline: true },
        { name: '💰 Price', value: `\`\`\`${item.price}\`\`\``, inline: true },
        { name: '📊 Previous Stock', value: `\`\`\`${oldStock}\`\`\``, inline: true },
        { name: `${action === '+' ? '➕' : '➖'} Change`, value: `\`\`\`${action}${amount}\`\`\``, inline: true },
        { name: '📦 New Stock', value: `\`\`\`${item.stock}\`\`\``, inline: true }
      )
      .setThumbnail(user ? user.displayAvatarURL({ size: 256 }) : message.guild.iconURL())
      .setFooter({ text: `Updated by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    message.reply({ embeds: [stockEmbed] }).then(msg => setTimeout(() => msg.delete().catch(() => {}), 30000));
    message.delete().catch(() => {});

    const newsChannelId = shopNews.get(message.guild.id);
    if (newsChannelId) {
      const newsChannel = message.guild.channels.cache.get(newsChannelId);
      if (newsChannel) {
        const newsEmbed = new EmbedBuilder()
          .setColor(action === '+' ? '#00FF00' : '#FFA500')
          .setAuthor({ 
            name: action === '+' ? '🆕 Fresh Stock Available!' : '⚠️ Stock Update', 
            iconURL: message.guild.iconURL() 
          })
          .setTitle(`${item.name}`)
          .setDescription(`${action === '+' ? '✨ **New stock just arrived!** Get it while it lasts!' : '📊 **Stock has been adjusted**'}`)
          .addFields(
            { name: '🎮 Game', value: `${item.gameCategory || 'N/A'}`, inline: true },
            { name: '📦 Stock', value: `**${item.stock}** available`, inline: true },
            { name: '💰 Price', value: `${item.price}`, inline: true },
            { name: '👤 Seller', value: `<@${userId}>`, inline: false }
          )
          .setThumbnail(user ? user.displayAvatarURL({ size: 256 }) : null)
          .setTimestamp();

        const sentMsg = await newsChannel.send({ embeds: [newsEmbed] });
        await sentMsg.react(action === '+' ? '🆕' : '📊');
      }
    }
  }

  // ========== WEBHOOK CHANNEL CREATION ==========

  if (command === 'createweb') {
    const channelName = args.join('-').toLowerCase();
    if (!channelName) return message.reply('Usage: `!createweb name`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const botMember = message.guild.members.cache.get(client.user.id);
    if (!botMember.permissions.has(PermissionFlagsBits.ManageChannels)) return message.reply('❌ Need Manage Channels!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    if (!botMember.permissions.has(PermissionFlagsBits.ManageWebhooks)) return message.reply('❌ Need Manage Webhooks!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    try {
      let permissionOverwrites = [];
      let ticketOwner = null;
      if (message.channel.name.startsWith('ticket-')) {
        const ticketOwnerName = message.channel.name.replace('ticket-', '');
        ticketOwner = message.guild.members.cache.find(m => m.user.username.toLowerCase() === ticketOwnerName.toLowerCase());
      }
      permissionOverwrites.push({ id: message.guild.id, deny: [PermissionFlagsBits.ViewChannel] });
      permissionOverwrites.push({ id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageWebhooks] });
      if (ticketOwner) permissionOverwrites.push({ id: ticketOwner.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] });
      permissionOverwrites.push({ id: OWNER_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] });
      const admins = adminUsers.get(message.guild.id) || [];
      for (const adminId of admins) {
        permissionOverwrites.push({ id: adminId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] });
      }
      const staffRole = message.guild.roles.cache.find(r => r.name.toLowerCase().includes('staff') || r.name.toLowerCase().includes('admin') || r.name.toLowerCase().includes('mod'));
      if (staffRole) permissionOverwrites.push({ id: staffRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] });
      const webCategoryId = webCategories.get(message.guild.id);
      const newChannel = await message.guild.channels.create({ name: channelName, type: ChannelType.GuildText, parent: webCategoryId || null, permissionOverwrites: permissionOverwrites });
      if (message.channel.name.startsWith('ticket-')) {
        const ticketId = message.channel.id;
        if (!ticketChannels.has(ticketId)) ticketChannels.set(ticketId, []);
        ticketChannels.get(ticketId).push(newChannel.id);
        saveData();
      }
      try {
        const webhook = await newChannel.createWebhook({ name: `${channelName}-webhook`, reason: `Created by ${message.author.tag}` });
        await message.channel.send(`✅ Channel: <#${newChannel.id}>`);
        await message.channel.send(webhook.url);
      } catch (webhookError) {
        console.error('Webhook Error:', webhookError);
        await message.channel.send(`✅ Channel: <#${newChannel.id}>\n❌ Webhook failed`);
      }
    } catch (err) {
      console.error('CreateWeb Error:', err);
      message.reply(`❌ Failed! ${err.message}`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }
  }

  // ========== DONE COMMAND ==========

  if (command === 'done') {
    if (!message.channel.name.startsWith('ticket-')) return message.reply('❌ Only in tickets!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const ticketOwnerName = message.channel.name.replace('ticket-', '');
    const ticketOwner = message.guild.members.cache.find(m => m.user.username.toLowerCase() === ticketOwnerName.toLowerCase());
    if (!ticketOwner) return message.reply('❌ Owner not found!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const doneButton = new ButtonBuilder().setCustomId('owner_done_confirmation').setLabel('Yes, Mark as Done').setEmoji('✅').setStyle(ButtonStyle.Success);
    const cancelButton = new ButtonBuilder().setCustomId('owner_cancel_done').setLabel('Not Yet').setEmoji('❌').setStyle(ButtonStyle.Danger);
    const row = new ActionRowBuilder().addComponents(doneButton, cancelButton);
    await message.channel.send({ content: `${ticketOwner.user}\n\n**Mark this ticket as done?**\nClick below to confirm.`, components: [row] });
    await message.delete().catch(() => {});
  }

  // ========== TICKET PANEL ==========

  if (command === 'ticket') {
    const fullText = args.join(' ');
    if (!fullText) return message.reply('Usage: `!ticket Title\nDescription`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const lines = fullText.split('\n');
    const title = lines[0];
    const text = lines.slice(1).join('\n');

    const embed = new EmbedBuilder()
      .setColor('#00FFFF')
      .setAuthor({ name: 'Support Ticket System', iconURL: message.guild.iconURL() })
      .setTitle(`🎫 ${title}`)
      .setDescription(text || 'Click the button below to create a support ticket')
      .addFields({ name: '📋 What happens next?', value: 'Our team will assist you shortly', inline: false })
      .setThumbnail(message.guild.iconURL())
      .setFooter({ text: 'Click below to get started' })
      .setTimestamp();

    const button = new ButtonBuilder()
      .setCustomId('create_ticket')
      .setLabel('Create a Ticket')
      .setEmoji('🎫')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);
    try {
      await message.delete();
      await message.channel.send('@everyone');
      await message.channel.send({ embeds: [embed], components: [row] });
    } catch (err) {
      console.error(err);
      message.reply('❌ Failed!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }
  }

  // ========== SHOP PANEL ==========

  if (command === 'shop') {
    const embed = new EmbedBuilder().setColor('#FFD700').setTitle('🛒 Shop').setDescription('Welcome to the shop! Click below to browse items or manage your shop.').setTimestamp().setFooter({ text: 'Shop System' });
    const shopButton = new ButtonBuilder().setCustomId('shop_browse').setLabel('Shop').setEmoji('🛍️').setStyle(ButtonStyle.Primary);
    const manageButton = new ButtonBuilder().setCustomId('shop_manage').setLabel('Manage Shop').setEmoji('⚙️').setStyle(ButtonStyle.Secondary);
    const row = new ActionRowBuilder().addComponents(shopButton, manageButton);
    try {
      await message.delete();
      await message.channel.send({ embeds: [embed], components: [row] });
    } catch (err) {
      console.error(err);
      message.reply('❌ Failed!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }
  }

  // ========== HELP COMMAND ==========

  if (command === 'help') {
    const helpEmbed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🎨 Bot Commands - Complete Guide')
      .setDescription('**All available commands and features**')
      .addFields(
        { name: '📝 Embed Commands', value: '`!embed <msg>` - Basic embed\n`!auto <msg>` - Auto-styled embed\n`!fancy <title>\\n<msg>` - Fancy embed\n`!announce <msg>` - Announcement\n`!quote <msg>` - Quote style\n`!colorembed #HEX <msg>` - Custom color\n`!success <msg>` - Success message\n`!error <msg>` - Error message\n`!info <msg>` - Info message', inline: false },
        { name: '🎫 Ticket System', value: '`!ticket <title>\\n<desc>` - Create ticket panel\n`!done` - Mark ticket as done\n`!createweb <name>` - Create webhook channel', inline: false },
        { name: '🛒 Shop System', value: '`!shop` - Create shop panel\n`!stock +/- <amount> <user_id> <item>` - Manage stock\nExample: `!stock + 10 123456 Sword`', inline: false },
        { name: '🎮 Game Categories', value: '`!addgame <name>` - Add game category\n`!removegame <name>` - Remove game\n`!listgames` - List all games\nExample: `!addgame Anime Vanguard`', inline: false },
        { name: '⚙️ Configuration (Admin Only)', value: '`!concategory <id>` - Set ticket category\n`!conweb <id>` - Set webhook category\n`!conorders <id>` - Set orders log\n`!condone <id>` - Set done log\n`!conshop <id>` - Set shop category\n`!contrade <id>` - Set trade log\n`!contranscript <id>` - Set transcript log\n`!connews <id>` - Set shop news channel', inline: false },
        { name: '👑 Admin Management (Owner Only)', value: '`!admadm <user_id>` - Add admin\n`!admrem <user_id>` - Remove admin\n`!admlist` - List all admins', inline: false },
        { name: '✨ Features', value: '✅ Game-based categories\n✅ Anti-duplicate tickets\n✅ 3-step shop verification\n✅ Stock management\n✅ Auto shop news\n✅ Trade logging\n✅ Auto message cleanup\n✅ Webhook integration', inline: false }
      )
      .setFooter({ text: 'Made with ❤️ | All features fully functional' })
      .setTimestamp();
    message.reply({ embeds: [helpEmbed] }).then(msg => setTimeout(() => msg.delete().catch(() => {}), 60000));
    message.delete().catch(() => {});
  }
});

// ==================== BUTTON INTERACTIONS ====================

client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton()) {

    // ========== SHOP BROWSE ==========

    if (interaction.customId === 'shop_browse') {
      const guildGames = gameCategories.get(interaction.guild.id) || [];

      if (guildGames.length === 0) {
        return interaction.reply({ content: '❌ No game categories! Ask admin to use `!addgame Game Name`', ephemeral: true });
      }

      const selectOptions = guildGames.slice(0, 25).map(game => ({
        label: game,
        description: `Browse ${game} items`,
        value: game
      }));

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('shop_select_game')
        .setPlaceholder('🎮 Select a game category')
        .addOptions(selectOptions);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.reply({ 
        content: '🎮 **What game are you looking for?**\nSelect a category below:', 
        components: [row], 
        ephemeral: true 
      });
    }

    // ========== SHOP MANAGE ==========

    if (interaction.customId === 'shop_manage') {
      const addButton = new ButtonBuilder().setCustomId('shop_add').setLabel('Add Item').setEmoji('➕').setStyle(ButtonStyle.Success);
      const removeButton = new ButtonBuilder().setCustomId('shop_remove').setLabel('Remove Item').setEmoji('➖').setStyle(ButtonStyle.Danger);
      const changeButton = new ButtonBuilder().setCustomId('shop_change').setLabel('Change Item').setEmoji('✏️').setStyle(ButtonStyle.Primary);
      const row = new ActionRowBuilder().addComponents(addButton, removeButton, changeButton);
      interaction.reply({ content: '🛒 **Manage Shop**\nChoose action:', components: [row], ephemeral: true });
    }

    // ========== SHOP ADD ==========

    if (interaction.customId === 'shop_add') {
      const guildGames = gameCategories.get(interaction.guild.id) || [];

      if (guildGames.length === 0) {
        return interaction.reply({ content: '❌ No game categories! Ask admin to use `!addgame Game Name`', ephemeral: true });
      }

      const selectOptions = guildGames.slice(0, 25).map(game => ({
        label: game,
        description: `Add item to ${game}`,
        value: game
      }));

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('shop_add_select_game')
        .setPlaceholder('🎮 Select game category for your item')
        .addOptions(selectOptions);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.reply({ 
        content: '🎮 **Which game is this item for?**', 
        components: [row], 
        ephemeral: true 
      });
    }

    // ========== SHOP REMOVE ==========

    if (interaction.customId === 'shop_remove') {
      const guildShops = shopListings.get(interaction.guild.id) || new Map();
      const userItems = guildShops.get(interaction.user.id) || [];
      if (userItems.length === 0) return interaction.reply({ content: '❌ No items!', ephemeral: true });
      const selectOptions = userItems.slice(0, 25).map(item => ({
        label: `${item.name} (Stock: ${item.stock || 0})`,
        description: `${item.gameCategory || 'No category'} - Price: ${item.price}`,
        value: item.id
      }));
      const selectMenu = new StringSelectMenuBuilder().setCustomId('shop_remove_select').setPlaceholder('Select item to remove').addOptions(selectOptions);
      const row = new ActionRowBuilder().addComponents(selectMenu);
      interaction.reply({ content: '🗑️ Select item:', components: [row], ephemeral: true });
    }

    // ========== SHOP CHANGE ==========

    if (interaction.customId === 'shop_change') {
      const guildShops = shopListings.get(interaction.guild.id) || new Map();
      const userItems = guildShops.get(interaction.user.id) || [];
      if (userItems.length === 0) return interaction.reply({ content: '❌ No items!', ephemeral: true });
      const selectOptions = userItems.slice(0, 25).map(item => ({
        label: `${item.name} (Stock: ${item.stock || 0})`,
        description: `${item.gameCategory || 'No category'} - Price: ${item.price}`,
        value: item.id
      }));
      const selectMenu = new StringSelectMenuBuilder().setCustomId('shop_change_select').setPlaceholder('Select item to edit').addOptions(selectOptions);
      const row = new ActionRowBuilder().addComponents(selectMenu);
      interaction.reply({ content: '✏️ Select item:', components: [row], ephemeral: true });
    }

    // ========== CREATE TICKET ==========

    if (interaction.customId === 'create_ticket') {
      const categoryId = ticketCategories.get(interaction.guild.id);
      if (!categoryId) return interaction.reply({ content: '❌ Category not set!', ephemeral: true });
      const category = interaction.guild.channels.cache.get(categoryId);
      if (!category) return interaction.reply({ content: '❌ Category not found!', ephemeral: true });
      const existingTicket = interaction.guild.channels.cache.find(ch => ch.name === `ticket-${interaction.user.username.toLowerCase()}` && ch.parentId === categoryId);
      if (existingTicket) return interaction.reply({ content: `❌ You have a ticket: <#${existingTicket.id}>`, ephemeral: true });
      const modal = new ModalBuilder().setCustomId('ticket_modal').setTitle('Create Ticket');
      const serviceInput = new TextInputBuilder().setCustomId('service_type').setLabel('What Service You Will Avail?').setPlaceholder('Describe your service').setStyle(TextInputStyle.Paragraph).setRequired(true);
      const actionRow = new ActionRowBuilder().addComponents(serviceInput);
      modal.addComponents(actionRow);
      await interaction.showModal(modal);
    }

    // ========== SHOP CONFIRM REMOVE ==========

    if (interaction.customId.startsWith('shop_confirm_remove_')) {
      const itemId = interaction.customId.replace('shop_confirm_remove_', '');
      const guildShops = shopListings.get(interaction.guild.id) || new Map();
      let userItems = guildShops.get(interaction.user.id) || [];
      const itemIndex = userItems.findIndex(i => i.id === itemId);
      if (itemIndex === -1) return interaction.update({ content: '❌ Not found!', components: [] });
      const itemName = userItems[itemIndex].name;
      userItems.splice(itemIndex, 1);
      guildShops.set(interaction.user.id, userItems);
      shopListings.set(interaction.guild.id, guildShops);
      await saveData();
      interaction.update({ content: `✅ Removed **${itemName}**!`, components: [] });
    }

    // ========== SHOP CANCEL REMOVE ==========

    if (interaction.customId === 'shop_cancel_remove') {
      interaction.update({ content: '❌ Cancelled.', components: [] });
    }

    // ========== CLOSE TICKET ==========

    if (interaction.customId === 'close_ticket') {
      if (!interaction.channel.name.startsWith('ticket-') && !interaction.channel.name.startsWith('shop-')) return interaction.reply({ content: '❌ Not a ticket!', ephemeral: true });
      await interaction.reply('🔒 Closing in 5 seconds...');
      setTimeout(async () => {
        const ticketId = interaction.channel.id;
        const createdChannels = ticketChannels.get(ticketId) || [];
        for (const channelId of createdChannels) {
          const channelToDelete = interaction.guild.channels.cache.get(channelId);
          if (channelToDelete) await channelToDelete.delete().catch(console.error);
        }
        ticketChannels.delete(ticketId);
        ticketOwners.delete(ticketId);
        await saveData();
        await interaction.channel.delete().catch(console.error);
      }, 5000);
    }

    // ========== DONE TICKET ==========

    if (interaction.customId === 'done_ticket') {
      if (!interaction.channel.name.startsWith('ticket-')) return interaction.reply({ content: '❌ Not a ticket!', ephemeral: true });
      const ticketOwnerName = interaction.channel.name.replace('ticket-', '');
      const ticketOwner = interaction.guild.members.cache.find(m => m.user.username.toLowerCase() === ticketOwnerName.toLowerCase());
      if (ticketOwner && interaction.user.id !== ticketOwner.id) return interaction.reply({ content: '❌ Only ticket creator!', ephemeral: true });
      const confirmButton = new ButtonBuilder().setCustomId('confirm_done').setLabel('Confirm Done').setEmoji('✅').setStyle(ButtonStyle.Success);
      const denyButton = new ButtonBuilder().setCustomId('deny_done').setLabel('Deny').setEmoji('❌').setStyle(ButtonStyle.Danger);
      const confirmRow = new ActionRowBuilder().addComponents(confirmButton, denyButton);
      await interaction.reply({ content: `⏳ **${interaction.user}** marked done!\n\n**Admins:** Please confirm.`, components: [confirmRow] });
    }

    // ========== OWNER DONE CONFIRMATION ==========

    if (interaction.customId === 'owner_done_confirmation') {
      if (!interaction.channel.name.startsWith('ticket-')) return interaction.reply({ content: '❌ Not a ticket!', ephemeral: true });
      const ticketOwnerName = interaction.channel.name.replace('ticket-', '');
      const ticketOwner = interaction.guild.members.cache.find(m => m.user.username.toLowerCase() === ticketOwnerName.toLowerCase());
      if (ticketOwner && interaction.user.id !== ticketOwner.id) return interaction.reply({ content: '❌ Only creator!', ephemeral: true });
      const confirmButton = new ButtonBuilder().setCustomId('confirm_done').setLabel('Confirm Done').setEmoji('✅').setStyle(ButtonStyle.Success);
      const denyButton = new ButtonBuilder().setCustomId('deny_done').setLabel('Deny').setEmoji('❌').setStyle(ButtonStyle.Danger);
      const confirmRow = new ActionRowBuilder().addComponents(confirmButton, denyButton);
      await interaction.update({ content: `⏳ **${interaction.user}** marked done!\n\n**Admins:** Please confirm.`, components: [confirmRow] });
    }

    // ========== OWNER CANCEL DONE ==========

    if (interaction.customId === 'owner_cancel_done') {
      if (!interaction.channel.name.startsWith('ticket-')) return interaction.reply({ content: '❌ Not a ticket!', ephemeral: true });
      await interaction.update({ content: `❌ **${interaction.user}** cancelled.\n\nTicket remains open.`, components: [] });
    }

    // ========== CONFIRM DONE ==========

    if (interaction.customId === 'confirm_done') {
      const isOwner = interaction.user.id === OWNER_ID;
      const admins = adminUsers.get(interaction.guild.id) || [];
      const isAdmin = admins.includes(interaction.user.id);
      if (!isOwner && !isAdmin) return interaction.reply({ content: '❌ Only admins!', ephemeral: true });

      const ticketOwnerName = interaction.channel.name.replace('ticket-', '');
      const ticketOwner = interaction.guild.members.cache.find(m => m.user.username.toLowerCase() === ticketOwnerName.toLowerCase());

      let serviceDescription = 'N/A';
      try {
        const messages = await interaction.channel.messages.fetch({ limit: 50 });
        const messagesArray = Array.from(messages.values()).reverse();

        for (const msg of messagesArray) {
          if (msg.content && msg.content.includes('Service Request:')) {
            const parts = msg.content.split('Service Request:');
            if (parts.length > 1) {
              serviceDescription = parts[1].trim().split('\n')[0].trim();
              break;
            }
          }
        }
      } catch (err) {
        console.error('Error fetching service description:', err);
      }

      const doneChannelId = doneChannels.get(interaction.guild.id);
      if (doneChannelId) {
        const doneChannel = interaction.guild.channels.cache.get(doneChannelId);
        if (doneChannel) {
          const currentTimestamp = Math.floor(Date.now() / 1000);
          const doneEmbed = new EmbedBuilder()
            .setColor('#00FF7F')
            .setAuthor({ name: '✅ Service Completed', iconURL: interaction.guild.iconURL() })
            .setTitle(`${ticketOwner ? ticketOwner.user.tag : ticketOwnerName} received their service!`)
            .setDescription(`🎉 **Service successfully delivered and confirmed!**\n\n📦 **Service Details:**\n${serviceDescription}`)
            .addFields(
              { name: '👤 Customer', value: `${ticketOwner ? ticketOwner.user : ticketOwnerName}`, inline: true },
              { name: '✅ Confirmed By', value: `${interaction.user}`, inline: true },
              { name: '⏰ Completed At', value: `<t:${currentTimestamp}:F>\n(<t:${currentTimestamp}:R>)`, inline: false }
            )
            .setThumbnail(ticketOwner ? ticketOwner.user.displayAvatarURL({ size: 256 }) : null)
            .setImage(interaction.user.displayAvatarURL({ size: 512 }))
            .setFooter({ text: `Admin: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

          try {
            const sentMessage = await doneChannel.send({ embeds: [doneEmbed] });
            await sentMessage.react('✅');
            await sentMessage.react('🎉');
            console.log(`✅ Sent done log to channel ${doneChannelId}`);
          } catch (err) {
            console.error('Error sending to done channel:', err);
          }
        }
      }
      await interaction.update({ content: `✅ **Confirmed by ${interaction.user}!**\n\nClosing in 5 seconds...`, components: [] });
      setTimeout(async () => {
        const ticketId = interaction.channel.id;
        const createdChannels = ticketChannels.get(ticketId) || [];
        for (const channelId of createdChannels) {
          const channelToDelete = interaction.guild.channels.cache.get(channelId);
          if (channelToDelete) await channelToDelete.delete().catch(console.error);
        }
        ticketChannels.delete(ticketId);
        ticketOwners.delete(ticketId);
        await saveData();
        await interaction.channel.delete().catch(console.error);
      }, 5000);
    }

    // ========== DENY DONE ==========

    if (interaction.customId === 'deny_done') {
      const isOwner = interaction.user.id === OWNER_ID;
      const admins = adminUsers.get(interaction.guild.id) || [];
      const isAdmin = admins.includes(interaction.user.id);
      if (!isOwner && !isAdmin) return interaction.reply({ content: '❌ Only admins!', ephemeral: true });
      await interaction.update({ content: `❌ **Denied by ${interaction.user}.**\n\nNot complete yet.`, components: [] });
    }

    // ========== SHOP TRADE DONE ==========

    if (interaction.customId.startsWith('shop_trade_done_')) {
      const parts = interaction.customId.replace('shop_trade_done_', '').split('_');
      const sellerId = parts[0];
      const itemId = parts[1];
      const guildShops = shopListings.get(interaction.guild.id) || new Map();
      const sellerItems = guildShops.get(sellerId) || [];
      const item = sellerItems.find(i => i.id === itemId);
      if (!item) return interaction.reply({ content: '❌ Item not found!', ephemeral: true });
      item.stock = Math.max(0, (item.stock || 0) - 1);
      guildShops.set(sellerId, sellerItems);
      shopListings.set(interaction.guild.id, guildShops);
      await saveData();
      const tradeChannelId = tradeChannels.get(interaction.guild.id);
      if (tradeChannelId) {
        const tradeChannel = interaction.guild.channels.cache.get(tradeChannelId);
        if (tradeChannel) {
          const seller = await interaction.client.users.fetch(sellerId).catch(() => null);
          const tradeEmbed = new EmbedBuilder()
            .setColor('#00FF7F')
            .setTitle('✅ Trade Completed')
            .setDescription(`**Item:** ${item.name}\n**Game:** ${item.gameCategory || 'N/A'}\n**Price:** ${item.price}\n**Seller:** ${seller ? seller : `<@${sellerId}>`}\n**Buyer:** ${interaction.user}\n\n**Remaining Stock:** ${item.stock}`)
            .setTimestamp();
          await tradeChannel.send({ embeds: [tradeEmbed] });
        }
      }
      await interaction.update({ content: `✅ Trade done! Stock: **${item.stock}**. Closing in 5 seconds...`, components: [] });
      setTimeout(async () => {
        await interaction.channel.delete().catch(console.error);
      }, 5000);
    }
  }

  // ==================== MODAL SUBMISSIONS ====================

  if (interaction.isModalSubmit()) {

    // ========== TICKET MODAL ==========

    if (interaction.customId === 'ticket_modal') {
      const serviceDescription = interaction.fields.getTextInputValue('service_type');
      const categoryId = ticketCategories.get(interaction.guild.id);
      try {
        const ticketChannel = await interaction.guild.channels.create({
          name: `ticket-${interaction.user.username}`,
          type: ChannelType.GuildText,
          parent: categoryId,
          permissionOverwrites: [
            { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
            { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
            { id: interaction.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
          ],
        });
        const staffRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase().includes('staff') || r.name.toLowerCase().includes('admin') || r.name.toLowerCase().includes('mod'));
        if (staffRole) {
          await ticketChannel.permissionOverwrites.create(staffRole, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
        }
        const doneButton = new ButtonBuilder().setCustomId('done_ticket').setLabel('Done').setEmoji('✅').setStyle(ButtonStyle.Success);
        const closeButton = new ButtonBuilder().setCustomId('close_ticket').setLabel('Close').setEmoji('🔒').setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder().addComponents(doneButton, closeButton);
        await ticketChannel.send({ content: `@everyone\n\n🎫 **Ticket by ${interaction.user}**\n\n**Service Request:**\n${serviceDescription}`, components: [row], allowedMentions: { parse: ['everyone'] } });
        ticketOwners.set(ticketChannel.id, interaction.user.id);
        saveData();
        const orderChannelId = orderChannels.get(interaction.guild.id);
        if (orderChannelId) {
          const orderChannel = interaction.guild.channels.cache.get(orderChannelId);
          if (orderChannel) {
            const orderTimestamp = Math.floor(Date.now() / 1000);
            const orderEmbed = new EmbedBuilder()
              .setColor('#FF6B35')
              .setAuthor({ name: '📦 New Order!', iconURL: interaction.guild.iconURL() })
              .setTitle(`Order from ${interaction.user.tag}`)
              .setDescription(`🎉 **New order placed!**\n\n📋 **Details:**\n${serviceDescription}`)
              .addFields(
                { name: '👤 Customer', value: `${interaction.user}`, inline: true },
                { name: '⏰ Ordered', value: `<t:${orderTimestamp}:F>`, inline: false }
              )
              .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
              .setTimestamp();
            await orderChannel.send({ embeds: [orderEmbed] });
          }
        }
        interaction.reply({ content: `✅ Ticket created! <#${ticketChannel.id}>`, ephemeral: true });
      } catch (err) {
        console.error(err);
        interaction.reply({ content: '❌ Failed to create ticket!', ephemeral: true });
      }
    }

    // ========== SHOP ADD MODAL ==========

    if (interaction.customId.startsWith('shop_add_modal_')) {
      const gameCategory = interaction.customId.replace('shop_add_modal_', '');
      const itemName = interaction.fields.getTextInputValue('item_name');
      const itemStock = parseInt(interaction.fields.getTextInputValue('item_stock'));
      const itemPrice = interaction.fields.getTextInputValue('item_price');
      if (isNaN(itemStock) || itemStock < 0) return interaction.reply({ content: '❌ Invalid stock!', ephemeral: true });
      const guildShops = shopListings.get(interaction.guild.id) || new Map();
      let userItems = guildShops.get(interaction.user.id) || [];
      const itemId = `${Date.now()}`;
      userItems.push({ id: itemId, name: itemName, price: itemPrice, stock: itemStock, seller: interaction.user.tag, gameCategory: gameCategory });
      guildShops.set(interaction.user.id, userItems);
      shopListings.set(interaction.guild.id, guildShops);
      await saveData();

      const newsChannelId = shopNews.get(interaction.guild.id);
      if (newsChannelId) {
        const newsChannel = interaction.guild.channels.cache.get(newsChannelId);
        if (newsChannel) {
          const newsEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🆕 New Item Added to Shop!')
            .setDescription(`**${itemName}** is now available!\n\n🎮 **Game:** ${gameCategory}\n💰 **Price:** ${itemPrice}\n📦 **Stock:** ${itemStock}\n👤 **Seller:** ${interaction.user}`)
            .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
            .setTimestamp()
            .setFooter({ text: 'Shop System' });

          try {
            const sentMessage = await newsChannel.send({ embeds: [newsEmbed] });
            await sentMessage.react('🛍️');
          } catch (err) {
            console.error('Error sending to shop news channel:', err);
          }
        }
      }

      interaction.reply({ content: `✅ Added **${itemName}** to **${gameCategory}** for **${itemPrice}** with **${itemStock}** stock!`, ephemeral: true });
    }

    // ========== SHOP CHANGE MODAL ==========

    if (interaction.customId.startsWith('shop_change_modal_')) {
      const itemId = interaction.customId.replace('shop_change_modal_', '');
      const itemName = interaction.fields.getTextInputValue('item_name');
      const itemStock = parseInt(interaction.fields.getTextInputValue('item_stock'));
      const itemPrice = interaction.fields.getTextInputValue('item_price');
      if (isNaN(itemStock) || itemStock < 0) return interaction.reply({ content: '❌ Invalid stock!', ephemeral: true });
      const guildShops = shopListings.get(interaction.guild.id) || new Map();
      let userItems = guildShops.get(interaction.user.id) || [];
      const itemIndex = userItems.findIndex(i => i.id === itemId);
      if (itemIndex === -1) return interaction.reply({ content: '❌ Not found!', ephemeral: true });
      userItems[itemIndex].name = itemName;
      userItems[itemIndex].price = itemPrice;
      userItems[itemIndex].stock = itemStock;
      guildShops.set(interaction.user.id, userItems);
      shopListings.set(interaction.guild.id, guildShops);
      await saveData();
      interaction.reply({ content: `✅ Updated **${itemName}** - Price: **${itemPrice}**, Stock: **${itemStock}**`, ephemeral: true });
    }
  }

  // ==================== SELECT MENU INTERACTIONS ====================

  if (interaction.isStringSelectMenu()) {

    // ========== SHOP SELECT GAME ==========

    if (interaction.customId === 'shop_select_game') {
      const selectedGame = interaction.values[0];
      const guildShops = shopListings.get(interaction.guild.id) || new Map();

      const selectOptions = [];
      let optionCount = 0;

      for (const [userId, items] of guildShops) {
        const user = await interaction.client.users.fetch(userId).catch(() => null);
        const userName = user ? user.username : 'Unknown';

        for (const item of items) {
          if (item.gameCategory === selectedGame && (item.stock || 0) > 0 && optionCount < 25) {
            selectOptions.push({ 
              label: `${item.name} - ${item.price} (Stock: ${item.stock || 0})`, 
              description: `Seller: ${userName}`, 
              value: `${userId}-${item.id}` 
            });
            optionCount++;
          }
        }
      }

      if (selectOptions.length === 0) {
        return interaction.update({ content: `❌ No items in stock for **${selectedGame}**!`, components: [] });
      }

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('shop_select_item')
        .setPlaceholder('Select an item')
        .addOptions(selectOptions);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.update({ 
        content: `🎮 **${selectedGame} Items:**\nSelect an item below:`, 
        components: [row] 
      });
    }

    // ========== SHOP ADD SELECT GAME ==========

    if (interaction.customId === 'shop_add_select_game') {
      const selectedGame = interaction.values[0];

      const modal = new ModalBuilder()
        .setCustomId(`shop_add_modal_${selectedGame}`)
        .setTitle(`Add Item to ${selectedGame}`);

      const nameInput = new TextInputBuilder()
        .setCustomId('item_name')
        .setLabel('Item Name')
        .setPlaceholder('e.g., Diamond Sword')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const stockInput = new TextInputBuilder()
        .setCustomId('item_stock')
        .setLabel('Stock')
        .setPlaceholder('e.g., 10')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const priceInput = new TextInputBuilder()
        .setCustomId('item_price')
        .setLabel('Price')
        .setPlaceholder('e.g., 100')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const row1 = new ActionRowBuilder().addComponents(nameInput);
      const row2 = new ActionRowBuilder().addComponents(stockInput);
      const row3 = new ActionRowBuilder().addComponents(priceInput);

      modal.addComponents(row1, row2, row3);
      await interaction.showModal(modal);
    }

    // ========== SHOP REMOVE SELECT ==========

    if (interaction.customId === 'shop_remove_select') {
      const itemId = interaction.values[0];
      const guildShops = shopListings.get(interaction.guild.id) || new Map();
      let userItems = guildShops.get(interaction.user.id) || [];
      const item = userItems.find(i => i.id === itemId);
      if (!item) return interaction.reply({ content: '❌ Not found!', ephemeral: true });
      const confirmButton = new ButtonBuilder().setCustomId(`shop_confirm_remove_${itemId}`).setLabel('Confirm').setStyle(ButtonStyle.Danger);
      const cancelButton = new ButtonBuilder().setCustomId('shop_cancel_remove').setLabel('Cancel').setStyle(ButtonStyle.Secondary);
      const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);
      interaction.update({ content: `⚠️ Remove **${item.name}** from **${item.gameCategory || 'Unknown'}**?`, components: [row] });
    }

    // ========== SHOP CHANGE SELECT ==========

    if (interaction.customId === 'shop_change_select') {
      const itemId = interaction.values[0];
      const guildShops = shopListings.get(interaction.guild.id) || new Map();
      const userItems = guildShops.get(interaction.user.id) || [];
      const item = userItems.find(i => i.id === itemId);
      if (!item) return interaction.reply({ content: '❌ Not found!', ephemeral: true });
      const modal = new ModalBuilder().setCustomId(`shop_change_modal_${itemId}`).setTitle('Edit Item');
      const nameInput = new TextInputBuilder().setCustomId('item_name').setLabel('Item Name').setValue(item.name).setStyle(TextInputStyle.Short).setRequired(true);
      const stockInput = new TextInputBuilder().setCustomId('item_stock').setLabel('Stock').setValue(String(item.stock || 0)).setStyle(TextInputStyle.Short).setRequired(true);
      const priceInput = new TextInputBuilder().setCustomId('item_price').setLabel('Price').setValue(item.price).setStyle(TextInputStyle.Short).setRequired(true);
      const row1 = new ActionRowBuilder().addComponents(nameInput);
      const row2 = new ActionRowBuilder().addComponents(stockInput);
      const row3 = new ActionRowBuilder().addComponents(priceInput);
      modal.addComponents(row1, row2, row3);
      await interaction.showModal(modal);
    }

    // ========== SHOP SELECT ITEM ==========

    if (interaction.customId === 'shop_select_item') {
      const [sellerId, itemId] = interaction.values[0].split('-');
      const guildShops = shopListings.get(interaction.guild.id) || new Map();
      const sellerItems = guildShops.get(sellerId) || [];
      const item = sellerItems.find(i => i.id === itemId);
      if (!item) return interaction.reply({ content: '❌ Item not found!', ephemeral: true });
      if ((item.stock || 0) <= 0) return interaction.reply({ content: '❌ Out of stock!', ephemeral: true });
      const seller = await interaction.client.users.fetch(sellerId).catch(() => null);
      const buyer = interaction.user;
      const categoryId = shopCategories.get(interaction.guild.id) || ticketCategories.get(interaction.guild.id);
      if (!categoryId) return interaction.reply({ content: '❌ Shop category not set! Ask admin to use !conshop', ephemeral: true });
      try {
        const ticketChannel = await interaction.guild.channels.create({
          name: `shop-${buyer.username}-${seller ? seller.username : 'seller'}`,
          type: ChannelType.GuildText,
          parent: categoryId,
          permissionOverwrites: [
            { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
            { id: buyer.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
            { id: sellerId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
            { id: interaction.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
          ],
        });
        const staffRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase().includes('staff') || r.name.toLowerCase().includes('admin') || r.name.toLowerCase().includes('mod'));
        if (staffRole) {
          await ticketChannel.permissionOverwrites.create(staffRole, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
        }
        await ticketChannel.permissionOverwrites.create(OWNER_ID, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
        const admins = adminUsers.get(interaction.guild.id) || [];
        for (const adminId of admins) {
          await ticketChannel.permissionOverwrites.create(adminId, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
        }
        const doneButton = new ButtonBuilder().setCustomId(`shop_trade_done_${sellerId}_${itemId}`).setLabel('Done').setEmoji('✅').setStyle(ButtonStyle.Success);
        const closeButton = new ButtonBuilder().setCustomId('close_ticket').setLabel('Close').setEmoji('🔒').setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder().addComponents(doneButton, closeButton);
        const itemEmbed = new EmbedBuilder()
          .setColor('#FFD700')
          .setTitle('🛍️ Shop Transaction')
          .setDescription(`**Buyer:** ${buyer}\n**Seller:** <@${sellerId}>\n\n🎮 **Game:** ${item.gameCategory || 'N/A'}\n**Item:** ${item.name}\n**Price:** ${item.price}\n**Stock:** ${item.stock}`)
          .setTimestamp();
        await ticketChannel.send({ content: `${buyer} <@${sellerId}>`, embeds: [itemEmbed], components: [row] });
        interaction.update({ content: `✅ Shop ticket created! <#${ticketChannel.id}>`, components: [] });
      } catch (err) {
        console.error('Shop Ticket Error:', err);
        interaction.reply({ content: '❌ Failed to create shop ticket!', ephemeral: true });
      }
    }
  }
});

// ==================== EXTENDED FEATURES ====================
// Add this code at the BOTTOM of your index.js, BEFORE client.login()

let ratings = new Map();
let leaderboard = new Map();
let claimedTickets = new Map();
let ticketTimers = new Map();

const JSONBIN_BIN_ID_FEATURES = process.env.JSONBIN_BIN_ID_FEATURES || '';

async function loadFeaturesData() {
  if (!JSONBIN_API_KEY || !JSONBIN_BIN_ID_FEATURES) {
    console.log('⚠️ Features JSONBin not configured');
    return;
  }

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.jsonbin.io',
      path: `/v3/b/${JSONBIN_BIN_ID_FEATURES}/latest`,
      method: 'GET',
      headers: { 'X-Master-Key': JSONBIN_API_KEY }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const record = json.record || {};

          ratings = new Map(Object.entries(record.ratings || {}).map(([k, v]) => [k, new Map(Object.entries(v || {}))]));
          leaderboard = new Map(Object.entries(record.leaderboard || {}).map(([k, v]) => [k, new Map(Object.entries(v || {}))]));
          claimedTickets = new Map(Object.entries(record.claimedTickets || {}));
          ticketTimers = new Map(Object.entries(record.ticketTimers || {}));

          console.log('✅ Features data loaded');
          resolve();
        } catch (err) {
          console.error('Error parsing features data:', err.message);
          resolve();
        }
      });
    });

    req.on('error', (err) => {
      console.error('Error loading features:', err.message);
      resolve();
    });

    req.end();
  });
}

async function saveFeaturesData() {
  if (!JSONBIN_API_KEY || !JSONBIN_BIN_ID_FEATURES) return;

  const data = {
    ratings: Object.fromEntries(
      Array.from(ratings.entries()).map(([guildId, userMap]) => [
        guildId,
        Object.fromEntries(userMap)
      ])
    ),
    leaderboard: Object.fromEntries(
      Array.from(leaderboard.entries()).map(([guildId, userMap]) => [
        guildId,
        Object.fromEntries(userMap)
      ])
    ),
    claimedTickets: Object.fromEntries(claimedTickets),
    ticketTimers: Object.fromEntries(ticketTimers)
  };

  return new Promise((resolve) => {
    const jsonData = JSON.stringify(data);
    const options = {
      hostname: 'api.jsonbin.io',
      path: `/v3/b/${JSONBIN_BIN_ID_FEATURES}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_API_KEY,
        'Content-Length': Buffer.byteLength(jsonData)
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode === 200) {
        console.log('💾 Features saved');
      }
      resolve();
    });

    req.on('error', () => resolve());
    req.write(jsonData);
    req.end();
  });
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

function getTimerDuration(ticketId) {
  const timer = ticketTimers.get(ticketId);
  if (!timer) return 0;
  if (timer.isPaused) return timer.pausedTime;

  const currentTime = Math.floor(Date.now() / 1000);
  return currentTime - timer.startTime - timer.totalPaused;
}

// Load features data on ready
client.once('ready', async () => {
  await loadFeaturesData();
});

// Add to existing messageCreate handler or create new one
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // ========== LEADERBOARD ==========
  if (command === 'leaderboard' || command === 'lb') {
    const guildLeaderboard = leaderboard.get(message.guild.id) || new Map();

    if (guildLeaderboard.size === 0) {
      return message.reply('📊 No leaderboard data yet!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    }

    const sortedUsers = Array.from(guildLeaderboard.entries())
      .sort((a, b) => b[1].completedOrders - a[1].completedOrders)
      .slice(0, 10);

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('🏆 Service Provider Leaderboard')
      .setThumbnail(message.guild.iconURL())
      .setTimestamp();

    let leaderboardText = '';
    for (let i = 0; i < sortedUsers.length; i++) {
      const [userId, data] = sortedUsers[i];
      const user = await client.users.fetch(userId).catch(() => null);
      const avgRating = data.totalRating > 0 ? data.totalRating.toFixed(1) : 'N/A';
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
      const stars = avgRating !== 'N/A' ? '⭐'.repeat(Math.round(parseFloat(avgRating))) : '';

      leaderboardText += `${medal} **${user ? user.username : 'Unknown'}**\n`;
      leaderboardText += `   📦 Orders: **${data.completedOrders}** | ⭐ **${avgRating}** ${stars}\n\n`;
    }

    embed.addFields({ name: '📊 Rankings', value: leaderboardText });
    message.reply({ embeds: [embed] }).then(msg => setTimeout(() => msg.delete().catch(() => {}), 60000));
    message.delete().catch(() => {});
  }

  // ========== RATE ==========
  if (command === 'rate') {
    if (!message.channel.name.startsWith('ticket-') && !message.channel.name.startsWith('shop-')) {
      return message.reply('❌ Only in tickets!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }

    const rating = parseInt(args[0]);
    const review = args.slice(1).join(' ');

    if (!rating || rating < 1 || rating > 5) {
      return message.reply('Usage: `!rate 1-5 [review]`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    }

    const ticketId = message.channel.id;
    const providerId = claimedTickets.get(ticketId);

    if (!providerId) {
      return message.reply('❌ No one claimed this ticket!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }

    if (providerId === message.author.id) {
      return message.reply('❌ Cannot rate yourself!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }

    const guildRatings = ratings.get(message.guild.id) || new Map();
    const providerRatings = guildRatings.get(providerId) || { totalRating: 0, count: 0, reviews: [] };

    providerRatings.totalRating += rating;
    providerRatings.count += 1;
    providerRatings.reviews.push({
      rating: rating,
      review: review || 'No review',
      reviewer: message.author.tag,
      date: new Date().toISOString()
    });

    guildRatings.set(providerId, providerRatings);
    ratings.set(message.guild.id, guildRatings);

    const guildLeaderboard = leaderboard.get(message.guild.id) || new Map();
    const providerData = guildLeaderboard.get(providerId) || { completedOrders: 0, totalRating: 0, lastUpdated: Date.now() };
    providerData.totalRating = providerRatings.totalRating / providerRatings.count;
    guildLeaderboard.set(providerId, providerData);
    leaderboard.set(message.guild.id, guildLeaderboard);

    await saveFeaturesData();

    const avgRating = (providerRatings.totalRating / providerRatings.count).toFixed(1);
    const stars = '⭐'.repeat(rating);

    const ratingEmbed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('⭐ Rating Submitted!')
      .setDescription(`${stars} **${rating}/5**${review ? `\n\n💬 *"${review}"*` : ''}`)
      .addFields(
        { name: '👤 Provider', value: `<@${providerId}>`, inline: true },
        { name: '📊 Average', value: `**${avgRating}**/5`, inline: true }
      )
      .setTimestamp();

    message.reply({ embeds: [ratingEmbed] });
    message.delete().catch(() => {});
  }

  // ========== TIMER ==========
  if (command === 'timer') {
    if (!message.channel.name.startsWith('ticket-') && !message.channel.name.startsWith('shop-')) {
      return message.reply('❌ Timer only in tickets!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }

    const ticketId = message.channel.id;
    const action = args[0]?.toLowerCase();

    if (action === 'start' || !action) {
      if (ticketTimers.has(ticketId)) {
        const duration = getTimerDuration(ticketId);
        const timer = ticketTimers.get(ticketId);
        const embed = new EmbedBuilder()
          .setColor(timer.isPaused ? '#FFA500' : '#00BFFF')
          .setTitle(`⏱️ Timer ${timer.isPaused ? '(Paused)' : 'Running'}`)
          .setDescription(`**Elapsed:** ${formatTime(duration)}`)
          .setTimestamp();
        return message.reply({ embeds: [embed] }).then(msg => setTimeout(() => msg.delete().catch(() => {}), 15000));
      }

      ticketTimers.set(ticketId, {
        startTime: Math.floor(Date.now() / 1000),
        pausedTime: 0,
        totalPaused: 0,
        isPaused: false
      });
      await saveFeaturesData();

      const embed = new EmbedBuilder().setColor('#00FF00').setTitle('⏱️ Timer Started!').setTimestamp();
      await message.channel.send({ embeds: [embed] });
      message.delete().catch(() => {});
    }
    else if (action === 'stop') {
      if (!ticketTimers.has(ticketId)) {
        return message.reply('❌ No timer running!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
      }

      const duration = getTimerDuration(ticketId);
      ticketTimers.delete(ticketId);
      await saveFeaturesData();

      const embed = new EmbedBuilder().setColor('#FF0000').setTitle('⏹️ Timer Stopped!').setDescription(`**Total Time:** ${formatTime(duration)}`).setTimestamp();
      await message.channel.send({ embeds: [embed] });
      message.delete().catch(() => {});
    }
    else if (action === 'pause') {
      const timer = ticketTimers.get(ticketId);
      if (!timer) return message.reply('❌ No timer!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
      if (timer.isPaused) return message.reply('❌ Already paused!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));

      const currentTime = Math.floor(Date.now() / 1000);
      timer.pausedTime = currentTime - timer.startTime - timer.totalPaused;
      timer.isPaused = true;
      ticketTimers.set(ticketId, timer);
      await saveFeaturesData();

      const embed = new EmbedBuilder().setColor('#FFA500').setTitle('⏸️ Paused').setDescription(`**Elapsed:** ${formatTime(timer.pausedTime)}`).setTimestamp();
      await message.channel.send({ embeds: [embed] });
      message.delete().catch(() => {});
    }
    else if (action === 'resume') {
      const timer = ticketTimers.get(ticketId);
      if (!timer) return message.reply('❌ No timer!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
      if (!timer.isPaused) return message.reply('❌ Not paused!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));

      const currentTime = Math.floor(Date.now() / 1000);
      timer.totalPaused += currentTime - (timer.startTime + timer.pausedTime);
      timer.startTime = currentTime - timer.pausedTime;
      timer.isPaused = false;
      ticketTimers.set(ticketId, timer);
      await saveFeaturesData();

      const embed = new EmbedBuilder().setColor('#00FF00').setTitle('▶️ Resumed').setTimestamp();
      await message.channel.send({ embeds: [embed] });
      message.delete().catch(() => {});
    }
    else if (action === '+') {
      const seconds = parseInt(args[1]);
      if (!seconds || seconds <= 0) return message.reply('Usage: `!timer + SECONDS`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));

      const timer = ticketTimers.get(ticketId);
      if (!timer) return message.reply('❌ No timer!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));

      timer.startTime -= seconds;
      ticketTimers.set(ticketId, timer);
      await saveFeaturesData();

      message.reply(`✅ Added ${formatTime(seconds)}`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
      message.delete().catch(() => {});
    }
    else if (action === '-') {
      const seconds = parseInt(args[1]);
      if (!seconds || seconds <= 0) return message.reply('Usage: `!timer - SECONDS`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));

      const timer = ticketTimers.get(ticketId);
      if (!timer) return message.reply('❌ No timer!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));

      timer.startTime += seconds;
      ticketTimers.set(ticketId, timer);
      await saveFeaturesData();

      message.reply(`✅ Removed ${formatTime(seconds)}`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
      message.delete().catch(() => {});
    }
  }

  // ========== TRANSCRIPT ==========
  if (command === 'transcript') {
    if (!message.channel.name.startsWith('ticket-') && !message.channel.name.startsWith('shop-')) {
      return message.reply('❌ Only in tickets!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }

    try {
      await message.reply('📝 Generating transcript...');

      const messages = await message.channel.messages.fetch({ limit: 100 });
      const messagesArray = Array.from(messages.values()).reverse();

      let transcript = `╔═══════════════════════════════════════╗\n`;
      transcript += `║        TICKET TRANSCRIPT              ║\n`;
      transcript += `╚═══════════════════════════════════════╝\n\n`;
      transcript += `Channel: ${message.channel.name}\n`;
      transcript += `Guild: ${message.guild.name}\n`;
      transcript += `Generated: ${new Date().toLocaleString()}\n\n`;

      for (const msg of messagesArray) {
        transcript += `[${msg.createdAt.toLocaleString()}] ${msg.author.tag}:\n${msg.content || '[Embed/Attachment]'}\n\n`;
      }

      const buffer = Buffer.from(transcript, 'utf-8');
      const attachment = new AttachmentBuilder(buffer, { name: `transcript-${Date.now()}.txt` });

      await message.channel.send({ content: '✅ Transcript generated:', files: [attachment] });
      message.delete().catch(() => {});
    } catch (err) {
      console.error('Transcript error:', err);
      message.reply('❌ Failed!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }
  }

  // ========== RATINGS VIEW ==========
  if (command === 'ratings' || command === 'reviews') {
    const userId = args[0] ? args[0].replace(/[<@!>]/g, '') : message.author.id;
    const guildRatings = ratings.get(message.guild.id) || new Map();
    const userRatings = guildRatings.get(userId);

    if (!userRatings || userRatings.count === 0) {
      return message.reply('❌ No ratings found!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }

    const user = await client.users.fetch(userId).catch(() => null);
    const avgRating = (userRatings.totalRating / userRatings.count).toFixed(1);
    const stars = '⭐'.repeat(Math.round(parseFloat(avgRating)));

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(`⭐ Ratings for ${user ? user.username : 'Unknown'}`)
      .setDescription(`**Average:** ${avgRating}/5 ${stars}\n**Total Reviews:** ${userRatings.count}`)
      .setThumbnail(user ? user.displayAvatarURL() : null)
      .setTimestamp();

    const recent = userRatings.reviews.slice(-5).reverse();
    let reviewText = '';
    for (const rev of recent) {
      reviewText += `${'⭐'.repeat(rev.rating)} **${rev.rating}/5** - *${rev.review}*\n   ${rev.reviewer}\n\n`;
    }

    if (reviewText) embed.addFields({ name: '💬 Recent Reviews', value: reviewText });

    message.reply({ embeds: [embed] }).then(msg => setTimeout(() => msg.delete().catch(() => {}), 60000));
    message.delete().catch(() => {});
  }
});

// Handle button interactions for claim/unclaim
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'claim_ticket') {
    const ticketId = interaction.channel.id;

    if (claimedTickets.has(ticketId)) {
      const claimerId = claimedTickets.get(ticketId);
      return interaction.reply({ content: `❌ Already claimed by <@${claimerId}>!`, ephemeral: true });
    }

    claimedTickets.set(ticketId, interaction.user.id);
    await saveFeaturesData();

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('✅ Ticket Claimed')
      .setDescription(`${interaction.user} has claimed this ticket!`)
      .setTimestamp();

    const unclaimBtn = new ButtonBuilder()
      .setCustomId('unclaim_ticket')
      .setLabel('Unclaim')
      .setEmoji('🔓')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(unclaimBtn);

    await interaction.update({ components: [] });
    await interaction.channel.send({ embeds: [embed], components: [row] });
  }

  if (interaction.customId === 'unclaim_ticket') {
    const ticketId = interaction.channel.id;
    const claimerId = claimedTickets.get(ticketId);

    if (interaction.user.id !== claimerId && interaction.user.id !== OWNER_ID) {
      return interaction.reply({ content: '❌ Only claimer or owner can unclaim!', ephemeral: true });
    }

    claimedTickets.delete(ticketId);
    await saveFeaturesData();

    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle('🔓 Ticket Unclaimed')
      .setDescription('This ticket is now available to claim.')
      .setTimestamp();

    const claimBtn = new ButtonBuilder()
      .setCustomId('claim_ticket')
      .setLabel('Claim Ticket')
      .setEmoji('✋')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(claimBtn);

    await interaction.update({ components: [] });
    await interaction.channel.send({ embeds: [embed], components: [row] });
  }

  // Enhanced confirm_done to update leaderboard
  if (interaction.customId === 'confirm_done') {
    const ticketId = interaction.channel.id;

    if (claimedTickets.has(ticketId)) {
      const claimerId = claimedTickets.get(ticketId);
      const guildLeaderboard = leaderboard.get(interaction.guild.id) || new Map();
      const providerData = guildLeaderboard.get(claimerId) || { completedOrders: 0, totalRating: 0, lastUpdated: Date.now() };

      providerData.completedOrders += 1;
      providerData.lastUpdated = Date.now();

      guildLeaderboard.set(claimerId, providerData);
      leaderboard.set(interaction.guild.id, guildLeaderboard);
      await saveFeaturesData();

      const claimer = await client.users.fetch(claimerId).catch(() => null);
      if (claimer) {
        await interaction.channel.send(`🏆 **${claimer.username}** completed order #**${providerData.completedOrders}**!`);
      }
    }

    if (ticketTimers.has(ticketId)) {
      const duration = getTimerDuration(ticketId);
      ticketTimers.delete(ticketId);
      await saveFeaturesData();
      await interaction.channel.send(`⏱️ **Service Time:** ${formatTime(duration)}`);
    }

    claimedTickets.delete(ticketId);
    await saveFeaturesData();
  }
});

// Enhance ticket creation with claim button
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isModalSubmit() || interaction.customId !== 'ticket_modal') return;

  setTimeout(async () => {
    try {
      const ticketChannel = interaction.guild.channels.cache.find(
        ch => ch.name === `ticket-${interaction.user.username.toLowerCase()}` && ch.createdTimestamp > Date.now() - 10000
      );

      if (!ticketChannel) return;

      const embed = new EmbedBuilder()
        .setColor('#00FFFF')
        .setAuthor({ name: '🎫 Support Ticket', iconURL: interaction.guild.iconURL() })
        .setTitle(`✨ Welcome, ${interaction.user.username}!`)
        .setDescription('Our team will assist you shortly!')
        .addFields(
          { name: '📋 What to expect', value: '• Staff will claim your ticket\n• Please be patient', inline: false },
          { name: '🎯 Status', value: '🟡 **Waiting for Staff**', inline: true }
        )
        .setThumbnail(interaction.user.displayAvatarURL())
        .setTimestamp();

      const claimBtn = new ButtonBuilder()
        .setCustomId('claim_ticket')
        .setLabel('Claim Ticket')
        .setEmoji('✋')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(claimBtn);

      await ticketChannel.send({ embeds: [embed], components: [row] });
    } catch (err) {
      console.error('Enhance ticket error:', err);
    }
  }, 3000);
});

console.log('✅ Extended features loaded');

// ==================== END OF EXTENDED FEATURES ====================