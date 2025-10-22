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
    shopNews: Object.fromEntries(shopNews)
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
    shopNews: new Map(Object.entries(data.shopNews || {}))
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
    shopNews: new Map()
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
    if (!isOwner) return message.reply('❌ Only the owner can use this command!');
    const userId = args[0];
    if (!userId) return message.reply('Usage: `!admadm USER_ID`');
    const guildAdmins = adminUsers.get(message.guild.id) || [];
    if (guildAdmins.includes(userId)) return message.reply('❌ This user is already an admin!');
    guildAdmins.push(userId);
    adminUsers.set(message.guild.id, guildAdmins);
    saveData();
    const user = await client.users.fetch(userId).catch(() => null);
    message.reply(`✅ Added **${user ? user.tag : userId}** as admin!`);
  }

  if (command === 'admrem') {
    if (!isOwner) return message.reply('❌ Only the owner can use this command!');
    const userId = args[0];
    if (!userId) return message.reply('Usage: `!admrem USER_ID`');
    const guildAdmins = adminUsers.get(message.guild.id) || [];
    const index = guildAdmins.indexOf(userId);
    if (index === -1) return message.reply('❌ This user is not an admin!');
    guildAdmins.splice(index, 1);
    adminUsers.set(message.guild.id, guildAdmins);
    saveData();
    const user = await client.users.fetch(userId).catch(() => null);
    message.reply(`✅ Removed **${user ? user.tag : userId}** from admins!`);
  }

  if (command === 'admlist') {
    if (!canUseCommands) return message.reply('❌ You don\'t have permission!');
    const guildAdmins = adminUsers.get(message.guild.id) || [];
    if (guildAdmins.length === 0) return message.reply('📋 No admins added yet!');
    let adminList = '📋 **Admin List:**\n\n';
    for (const userId of guildAdmins) {
      const user = await client.users.fetch(userId).catch(() => null);
      adminList += `• ${user ? user.tag : userId} (${userId})\n`;
    }
    message.reply(adminList);
  }

  // Permission check for other commands
  if (!canUseCommands && command !== 'admadm' && command !== 'admrem' && command !== 'admlist') {
    const hasModerator = message.member.roles.cache.some(r => 
      r.name.toLowerCase().includes('moderator') || 
      r.name.toLowerCase().includes('mod') ||
      r.permissions.has(PermissionFlagsBits.Administrator)
    );
    if (!hasModerator) return message.reply('❌ You don\'t have permission!');
  }

  // ========== EMBED COMMANDS ==========

  if (command === 'embed') {
    const text = args.join(' ');
    if (!text) return message.reply('Usage: `!embed Your message here`');
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
      message.reply('❌ Failed!');
    }
  }

  if (command === 'fancy') {
    const fullText = args.join(' ');
    if (!fullText) return message.reply('Usage: `!fancy Title\nYour message`');
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
    if (!text) return message.reply('Usage: `!announce Your announcement`');
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
    if (!text) return message.reply('Usage: `!quote Your quote`');
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
    if (!color || !text) return message.reply('Usage: `!colorembed #FF0000 Message`');
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
      message.reply('❌ Invalid color!');
    }
  }

  if (command === 'success') {
    const text = args.join(' ');
    if (!text) return message.reply('Usage: `!success Message`');
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
    if (!text) return message.reply('Usage: `!error Message`');
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
    if (!text) return message.reply('Usage: `!info Message`');
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
    if (!text) return message.reply('Usage: `!auto Message`');
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
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ Admin only!');
    const categoryId = args[0];
    if (!categoryId) return message.reply('Usage: `!concategory CATEGORY_ID`');
    const category = message.guild.channels.cache.get(categoryId);
    if (!category || category.type !== ChannelType.GuildCategory) return message.reply('❌ Invalid category!');
    ticketCategories.set(message.guild.id, categoryId);
    saveData();
    message.reply(`✅ Ticket category set to: **${category.name}**`);
  }

  if (command === 'conweb') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ Admin only!');
    const categoryId = args[0];
    if (!categoryId) return message.reply('Usage: `!conweb CATEGORY_ID`');
    const category = message.guild.channels.cache.get(categoryId);
    if (!category || category.type !== ChannelType.GuildCategory) return message.reply('❌ Invalid category!');
    webCategories.set(message.guild.id, categoryId);
    saveData();
    message.reply(`✅ Webhook category set to: **${category.name}**`);
  }

  if (command === 'conorders') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ Admin only!');
    const channelId = args[0];
    if (!channelId) return message.reply('Usage: `!conorders CHANNEL_ID`');
    const channel = message.guild.channels.cache.get(channelId);
    if (!channel || channel.type !== ChannelType.GuildText) return message.reply('❌ Invalid channel!');
    orderChannels.set(message.guild.id, channelId);
    saveData();
    message.reply(`✅ Orders log set to: <#${channelId}>`);
  }

  if (command === 'condone') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ Admin only!');
    const channelId = args[0];
    if (!channelId) return message.reply('Usage: `!condone CHANNEL_ID`');
    const channel = message.guild.channels.cache.get(channelId);
    if (!channel || channel.type !== ChannelType.GuildText) return message.reply('❌ Invalid channel!');
    doneChannels.set(message.guild.id, channelId);
    saveData();
    message.reply(`✅ Done log set to: <#${channelId}>`);
  }

  if (command === 'conshop') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ Admin only!');
    const categoryId = args[0];
    if (!categoryId) return message.reply('Usage: `!conshop CATEGORY_ID`');
    const category = message.guild.channels.cache.get(categoryId);
    if (!category || category.type !== ChannelType.GuildCategory) return message.reply('❌ Invalid category!');
    shopCategories.set(message.guild.id, categoryId);
    saveData();
    message.reply(`✅ Shop category set to: **${category.name}**`);
  }

  if (command === 'contrade') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ Admin only!');
    const channelId = args[0];
    if (!channelId) return message.reply('Usage: `!contrade CHANNEL_ID`');
    const channel = message.guild.channels.cache.get(channelId);
    if (!channel || channel.type !== ChannelType.GuildText) return message.reply('❌ Invalid channel!');
    tradeChannels.set(message.guild.id, channelId);
    saveData();
    message.reply(`✅ Trade log set to: <#${channelId}>`);
  }

  if (command === 'contranscript') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ Admin only!');
    const channelId = args[0];
    if (!channelId) return message.reply('Usage: `!contranscript CHANNEL_ID`');
    const channel = message.guild.channels.cache.get(channelId);
    if (!channel || channel.type !== ChannelType.GuildText) return message.reply('❌ Invalid channel!');
    transcriptChannels.set(message.guild.id, channelId);
    saveData();
    message.reply(`✅ Transcript log set to: <#${channelId}>`);
  }

  // ========== SHOP NEWS COMMAND ==========

  if (command === 'connews') {
    if (!canUseCommands) return message.reply('❌ You don\'t have permission!');
    const channelId = args[0];
    if (!channelId) return message.reply('Usage: `!connews CHANNEL_ID`');
    const channel = message.guild.channels.cache.get(channelId);
    if (!channel || channel.type !== ChannelType.GuildText) return message.reply('❌ Invalid channel!');
    shopNews.set(message.guild.id, channelId);
    saveData();
    message.reply(`✅ Shop news channel set to: <#${channelId}>`);
  }

  // ========== STOCK MANAGEMENT COMMAND ==========

  if (command === 'stock') {
    if (!canUseCommands) return message.reply('❌ You don\'t have permission!');

    const action = args[0]; // + or -
    const amount = parseInt(args[1]);
    const userId = args[2];
    const itemName = args.slice(3).join(' ');

    if (!action || !amount || !userId || !itemName) {
      return message.reply('Usage: `!stock +/- AMOUNT USER_ID ITEM_NAME`\nExample: `!stock + 10 123456789 Diamond Sword`');
    }

    if (action !== '+' && action !== '-') {
      return message.reply('❌ Action must be `+` or `-`');
    }

    if (isNaN(amount) || amount <= 0) {
      return message.reply('❌ Amount must be a positive number!');
    }

    const guildShops = shopListings.get(message.guild.id) || new Map();
    let userItems = guildShops.get(userId) || [];

    const item = userItems.find(i => i.name.toLowerCase() === itemName.toLowerCase());

    if (!item) {
      return message.reply(`❌ Item **${itemName}** not found for user <@${userId}>!`);
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

    const stockEmbed = new EmbedBuilder()
      .setColor(action === '+' ? '#00FF00' : '#FF6B35')
      .setTitle(`${action === '+' ? '📈' : '📉'} Stock Updated`)
      .setDescription(`**Item:** ${item.name}\n**User:** <@${userId}>\n\n**Previous Stock:** ${oldStock}\n**Change:** ${action}${amount}\n**New Stock:** ${item.stock}`)
      .setTimestamp()
      .setFooter({ text: `Updated by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

    message.reply({ embeds: [stockEmbed] });

    // Send to shop news channel if configured
    const newsChannelId = shopNews.get(message.guild.id);
    if (newsChannelId) {
      const newsChannel = message.guild.channels.cache.get(newsChannelId);
      if (newsChannel) {
        const newsEmbed = new EmbedBuilder()
          .setColor(action === '+' ? '#00FF00' : '#FFA500')
          .setTitle(`${action === '+' ? '🆕 New Stock Added!' : '⚠️ Stock Updated'}`)
          .setDescription(`**${item.name}** by <@${userId}>\n\n${action === '+' ? '✨ Fresh stock available!' : '📊 Stock adjusted'}\n**Current Stock:** ${item.stock}\n**Price:** ${item.price}`)
          .setTimestamp();

        await newsChannel.send({ embeds: [newsEmbed] });
      }
    }
  }

  // ========== WEBHOOK CHANNEL CREATION ==========

  if (command === 'createweb') {
    const channelName = args.join('-').toLowerCase();
    if (!channelName) return message.reply('Usage: `!createweb name`');
    const botMember = message.guild.members.cache.get(client.user.id);
    if (!botMember.permissions.has(PermissionFlagsBits.ManageChannels)) return message.reply('❌ Need Manage Channels!');
    if (!botMember.permissions.has(PermissionFlagsBits.ManageWebhooks)) return message.reply('❌ Need Manage Webhooks!');
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
      message.reply(`❌ Failed! ${err.message}`);
    }
  }

  // ========== DONE COMMAND ==========

  if (command === 'done') {
    if (!message.channel.name.startsWith('ticket-')) return message.reply('❌ Only in tickets!');
    const ticketOwnerName = message.channel.name.replace('ticket-', '');
    const ticketOwner = message.guild.members.cache.find(m => m.user.username.toLowerCase() === ticketOwnerName.toLowerCase());
    if (!ticketOwner) return message.reply('❌ Owner not found!');
    const doneButton = new ButtonBuilder().setCustomId('owner_done_confirmation').setLabel('Yes, Mark as Done').setEmoji('✅').setStyle(ButtonStyle.Success);
    const cancelButton = new ButtonBuilder().setCustomId('owner_cancel_done').setLabel('Not Yet').setEmoji('❌').setStyle(ButtonStyle.Danger);
    const row = new ActionRowBuilder().addComponents(doneButton, cancelButton);
    await message.channel.send({ content: `${ticketOwner.user}\n\n**Mark this ticket as done?**\nClick below to confirm.`, components: [row] });
    await message.delete().catch(() => {});
  }

  // ========== TICKET PANEL ==========

  if (command === 'ticket') {
    const fullText = args.join(' ');
    if (!fullText) return message.reply('Usage: `!ticket Title\nDescription`');
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
      message.reply('❌ Failed!');
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
      message.reply('❌ Failed!');
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
        { name: '⚙️ Configuration (Admin Only)', value: '`!concategory <id>` - Set ticket category\n`!conweb <id>` - Set webhook category\n`!conorders <id>` - Set orders log\n`!condone <id>` - Set done log\n`!conshop <id>` - Set shop category\n`!contrade <id>` - Set trade log\n`!contranscript <id>` - Set transcript log\n`!connews <id>` - Set shop news channel', inline: false },
        { name: '👑 Admin Management (Owner Only)', value: '`!admadm <user_id>` - Add admin\n`!admrem <user_id>` - Remove admin\n`!admlist` - List all admins', inline: false },
        { name: '✨ Features', value: '✅ Anti-duplicate tickets\n✅ 3-step shop verification\n✅ Stock management\n✅ Auto shop news\n✅ Trade logging\n✅ Webhook integration\n✅ Permission system', inline: false }
      )
      .setFooter({ text: 'Made with ❤️ | All features fully functional' })
      .setTimestamp();
    message.reply({ embeds: [helpEmbed] });
  }
});

// ==================== BUTTON INTERACTIONS ====================

client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton()) {

    // ========== SHOP BROWSE ==========

    if (interaction.customId === 'shop_browse') {
      const guildShops = shopListings.get(interaction.guild.id) || new Map();
      if (guildShops.size === 0) return interaction.reply({ content: '❌ No items!', ephemeral: true });
      const selectOptions = [];
      let optionCount = 0;
      for (const [userId, items] of guildShops) {
        const user = await interaction.client.users.fetch(userId).catch(() => null);
        const userName = user ? user.username : 'Unknown';
        for (const item of items) {
          if (optionCount < 25 && (item.stock || 0) > 0) {
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
        return interaction.reply({ content: '❌ No items in stock!', ephemeral: true });
      }
      const selectMenu = new StringSelectMenuBuilder().setCustomId('shop_select_item').setPlaceholder('Select an item').addOptions(selectOptions);
      const row = new ActionRowBuilder().addComponents(selectMenu);
      interaction.reply({ content: '🛒 Browse:', components: [row], ephemeral: true });
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
      const modal = new ModalBuilder().setCustomId('shop_add_modal').setTitle('Add Item');
      const nameInput = new TextInputBuilder().setCustomId('item_name').setLabel('Item Name').setPlaceholder('e.g., Diamond Sword').setStyle(TextInputStyle.Short).setRequired(true);
      const stockInput = new TextInputBuilder().setCustomId('item_stock').setLabel('Stock').setPlaceholder('e.g., 10').setStyle(TextInputStyle.Short).setRequired(true);
      const priceInput = new TextInputBuilder().setCustomId('item_price').setLabel('Price').setPlaceholder('e.g., 100').setStyle(TextInputStyle.Short).setRequired(true);
      const row1 = new ActionRowBuilder().addComponents(nameInput);
      const row2 = new ActionRowBuilder().addComponents(stockInput);
      const row3 = new ActionRowBuilder().addComponents(priceInput);
      modal.addComponents(row1, row2, row3);
      await interaction.showModal(modal);
    }

    // ========== SHOP REMOVE ==========

    if (interaction.customId === 'shop_remove') {
      const guildShops = shopListings.get(interaction.guild.id) || new Map();
      const userItems = guildShops.get(interaction.user.id) || [];
      if (userItems.length === 0) return interaction.reply({ content: '❌ No items!', ephemeral: true });
      const selectOptions = userItems.map(item => ({
        label: `${item.name} (Stock: ${item.stock || 0})`,
        description: `Price: ${item.price}`,
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
      const selectOptions = userItems.map(item => ({
        label: `${item.name} (Stock: ${item.stock || 0})`,
        description: `Price: ${item.price}`,
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
        } else {
          console.error(`❌ Done channel ${doneChannelId} not found`);
        }
      } else {
        console.log('⚠️ No done channel configured for this guild');
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
            .setDescription(`**Item:** ${item.name}\n**Price:** ${item.price}\n**Seller:** ${seller ? seller : `<@${sellerId}>`}\n**Buyer:** ${interaction.user}\n\n**Remaining Stock:** ${item.stock}`)
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

    if (interaction.customId === 'shop_add_modal') {
      const itemName = interaction.fields.getTextInputValue('item_name');
      const itemStock = parseInt(interaction.fields.getTextInputValue('item_stock'));
      const itemPrice = interaction.fields.getTextInputValue('item_price');
      if (isNaN(itemStock) || itemStock < 0) return interaction.reply({ content: '❌ Invalid stock!', ephemeral: true });
      const guildShops = shopListings.get(interaction.guild.id) || new Map();
      let userItems = guildShops.get(interaction.user.id) || [];
      const itemId = `${Date.now()}`;
      userItems.push({ id: itemId, name: itemName, price: itemPrice, stock: itemStock, seller: interaction.user.tag });
      guildShops.set(interaction.user.id, userItems);
      shopListings.set(interaction.guild.id, guildShops);
      await saveData();

      // Send notification to shop news channel
      const newsChannelId = shopNews.get(interaction.guild.id);
      if (newsChannelId) {
        const newsChannel = interaction.guild.channels.cache.get(newsChannelId);
        if (newsChannel) {
          const newsEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('🆕 New Item Added to Shop!')
            .setDescription(`**${itemName}** is now available!\n\n💰 **Price:** ${itemPrice}\n📦 **Stock:** ${itemStock}\n👤 **Seller:** ${interaction.user}`)
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

      interaction.reply({ content: `✅ Added **${itemName}** for **${itemPrice}** with **${itemStock}** stock!`, ephemeral: true });
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
      interaction.update({ content: `⚠️ Remove **${item.name}**?`, components: [row] });
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
          .setDescription(`**Buyer:** ${buyer}\n**Seller:** <@${sellerId}>\n\n**Item:** ${item.name}\n**Price:** ${item.price}\n**Stock:** ${item.stock}`)
          .setTimestamp();
        await ticketChannel.send({ content: `${buyer} <@${sellerId}>`, embeds: [itemEmbed], components: [row] });
        interaction.reply({ content: `✅ Shop ticket created! <#${ticketChannel.id}>`, ephemeral: true });
      } catch (err) {
        console.error('Shop Ticket Error:', err);
        interaction.reply({ content: '❌ Failed to create shop ticket!', ephemeral: true });
      }
    }
  }
});

// ==================== BOT LOGIN ====================

client.login(process.env.TOKEN);