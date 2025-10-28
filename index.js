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
    GatewayIntentBits.GuildMembers,
  ],
});

const PREFIX = '!';
const OWNER_ID = '730629579533844512';

const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY || '';
const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID || '';

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
let gameCategories = new Map();

async function loadData() {
  if (!JSONBIN_API_KEY || !JSONBIN_BIN_ID) {
    console.log('⚠️ JSONBin not configured');
    return { ticketCategories: new Map(), orderChannels: new Map(), doneChannels: new Map(), adminUsers: new Map(), ticketChannels: new Map(), webCategories: new Map(), shopListings: new Map(), ticketOwners: new Map(), shopCategories: new Map(), transcriptChannels: new Map(), tradeChannels: new Map(), shopNews: new Map(), gameCategories: new Map() };
  }
  return new Promise((resolve) => {
    const options = { hostname: 'api.jsonbin.io', path: `/v3/b/${JSONBIN_BIN_ID}/latest`, method: 'GET', headers: { 'X-Master-Key': JSONBIN_API_KEY } };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const record = json.record || {};
          resolve({
            ticketCategories: new Map(Object.entries(record.ticketCategories || {})),
            orderChannels: new Map(Object.entries(record.orderChannels || {})),
            doneChannels: new Map(Object.entries(record.doneChannels || {})),
            adminUsers: new Map(Object.entries(record.adminUsers || {}).map(([k, v]) => [k, v || []])),
            ticketChannels: new Map(Object.entries(record.ticketChannels || {}).map(([k, v]) => [k, v || []])),
            webCategories: new Map(Object.entries(record.webCategories || {})),
            shopListings: new Map(Object.entries(record.shopListings || {}).map(([k, v]) => [k, new Map(Object.entries(v || {}))])),
            ticketOwners: new Map(Object.entries(record.ticketOwners || {})),
            shopCategories: new Map(Object.entries(record.shopCategories || {})),
            transcriptChannels: new Map(Object.entries(record.transcriptChannels || {})),
            tradeChannels: new Map(Object.entries(record.tradeChannels || {})),
            shopNews: new Map(Object.entries(record.shopNews || {})),
            gameCategories: new Map(Object.entries(record.gameCategories || {}).map(([k, v]) => [k, v || []]))
          });
        } catch (err) {
          console.error('Error parsing data:', err.message);
          resolve({ ticketCategories: new Map(), orderChannels: new Map(), doneChannels: new Map(), adminUsers: new Map(), ticketChannels: new Map(), webCategories: new Map(), shopListings: new Map(), ticketOwners: new Map(), shopCategories: new Map(), transcriptChannels: new Map(), tradeChannels: new Map(), shopNews: new Map(), gameCategories: new Map() });
        }
      });
    });
    req.on('error', () => resolve({ ticketCategories: new Map(), orderChannels: new Map(), doneChannels: new Map(), adminUsers: new Map(), ticketChannels: new Map(), webCategories: new Map(), shopListings: new Map(), ticketOwners: new Map(), shopCategories: new Map(), transcriptChannels: new Map(), tradeChannels: new Map(), shopNews: new Map(), gameCategories: new Map() }));
    req.end();
  });
}

async function saveData() {
  if (!JSONBIN_API_KEY || !JSONBIN_BIN_ID) return;
  const data = {
    ticketCategories: Object.fromEntries(ticketCategories),
    orderChannels: Object.fromEntries(orderChannels),
    doneChannels: Object.fromEntries(doneChannels),
    adminUsers: Object.fromEntries(adminUsers),
    ticketChannels: Object.fromEntries(ticketChannels),
    webCategories: Object.fromEntries(webCategories),
    shopListings: Object.fromEntries(Array.from(shopListings.entries()).map(([guildId, userMap]) => [guildId, Object.fromEntries(userMap)])),
    ticketOwners: Object.fromEntries(ticketOwners),
    shopCategories: Object.fromEntries(shopCategories),
    transcriptChannels: Object.fromEntries(transcriptChannels),
    tradeChannels: Object.fromEntries(tradeChannels),
    shopNews: Object.fromEntries(shopNews),
    gameCategories: Object.fromEntries(gameCategories)
  };
  return new Promise((resolve) => {
    const jsonData = JSON.stringify(data);
    const options = { hostname: 'api.jsonbin.io', path: `/v3/b/${JSONBIN_BIN_ID}`, method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Master-Key': JSONBIN_API_KEY, 'Content-Length': Buffer.byteLength(jsonData) } };
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) console.log('💾 Data saved');
        resolve();
      });
    });
    req.on('error', () => resolve());
    req.write(jsonData);
    req.end();
  });
}

client.once('ready', async () => {
  console.log(`✅ Bot online as ${client.user.tag}`);
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
  shopNews = loadedData.shopNews;
  gameCategories = loadedData.gameCategories;
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;
  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  const isOwner = message.author.id === OWNER_ID;
  const admins = adminUsers.get(message.guild.id) || [];
  const isAdmin = admins.includes(message.author.id);
  const canUseCommands = isOwner || isAdmin;

  if (command === 'admadm') {
    if (!isOwner) return message.reply('❌ Owner only!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const userId = args[0];
    if (!userId) return message.reply('Usage: `!admadm USER_ID`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const guildAdmins = adminUsers.get(message.guild.id) || [];
    if (guildAdmins.includes(userId)) return message.reply('❌ Already admin!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    guildAdmins.push(userId);
    adminUsers.set(message.guild.id, guildAdmins);
    saveData();
    const user = await client.users.fetch(userId).catch(() => null);
    message.reply(`✅ Added **${user ? user.tag : userId}**`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    message.delete().catch(() => {});
  }

  if (command === 'admrem') {
    if (!isOwner) return message.reply('❌ Owner only!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const userId = args[0];
    if (!userId) return message.reply('Usage: `!admrem USER_ID`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const guildAdmins = adminUsers.get(message.guild.id) || [];
    const index = guildAdmins.indexOf(userId);
    if (index === -1) return message.reply('❌ Not admin!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    guildAdmins.splice(index, 1);
    adminUsers.set(message.guild.id, guildAdmins);
    saveData();
    const user = await client.users.fetch(userId).catch(() => null);
    message.reply(`✅ Removed **${user ? user.tag : userId}**`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    message.delete().catch(() => {});
  }

  if (command === 'admlist') {
    if (!canUseCommands) return message.reply('❌ No permission!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const guildAdmins = adminUsers.get(message.guild.id) || [];
    if (guildAdmins.length === 0) return message.reply('📋 No admins!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    let adminList = '📋 **Admin List:**\n\n';
    for (const userId of guildAdmins) {
      const user = await client.users.fetch(userId).catch(() => null);
      adminList += `• ${user ? user.tag : userId}\n`;
    }
    message.reply(adminList).then(msg => setTimeout(() => msg.delete().catch(() => {}), 30000));
    message.delete().catch(() => {});
  }

  if (!canUseCommands && command !== 'admadm' && command !== 'admrem' && command !== 'admlist') {
    const hasModerator = message.member.roles.cache.some(r => r.name.toLowerCase().includes('moderator') || r.name.toLowerCase().includes('mod') || r.permissions.has(PermissionFlagsBits.Administrator));
    if (!hasModerator) return message.reply('❌ No permission!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
  }

  if (command === 'addgame') {
    if (!canUseCommands) return message.reply('❌ No permission!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const gameName = args.join(' ');
    if (!gameName) return message.reply('Usage: `!addgame Game Name`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const guildGames = gameCategories.get(message.guild.id) || [];
    if (guildGames.includes(gameName)) return message.reply(`❌ **${gameName}** exists!`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    guildGames.push(gameName);
    gameCategories.set(message.guild.id, guildGames);
    await saveData();
    message.reply(`✅ Added: **${gameName}**`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    message.delete().catch(() => {});
  }

  if (command === 'removegame') {
    if (!canUseCommands) return message.reply('❌ No permission!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const gameName = args.join(' ');
    if (!gameName) return message.reply('Usage: `!removegame Game Name`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const guildGames = gameCategories.get(message.guild.id) || [];
    const index = guildGames.indexOf(gameName);
    if (index === -1) return message.reply(`❌ Not found!`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    guildGames.splice(index, 1);
    gameCategories.set(message.guild.id, guildGames);
    await saveData();
    message.reply(`✅ Removed: **${gameName}**`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    message.delete().catch(() => {});
  }

  if (command === 'listgames') {
    const guildGames = gameCategories.get(message.guild.id) || [];
    if (guildGames.length === 0) return message.reply('📋 No games! Use `!addgame`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    let gameList = '🎮 **Games:**\n\n';
    guildGames.forEach((game, i) => gameList += `${i + 1}. ${game}\n`);
    message.reply(gameList).then(msg => setTimeout(() => msg.delete().catch(() => {}), 30000));
    message.delete().catch(() => {});
  }

  if (command === 'concategory') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ Admin only!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const categoryId = args[0];
    if (!categoryId) return message.reply('Usage: `!concategory ID`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const category = message.guild.channels.cache.get(categoryId);
    if (!category || category.type !== ChannelType.GuildCategory) return message.reply('❌ Invalid!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    ticketCategories.set(message.guild.id, categoryId);
    saveData();
    message.reply(`✅ Set: **${category.name}**`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    message.delete().catch(() => {});
  }

  if (command === 'conweb') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ Admin only!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const categoryId = args[0];
    if (!categoryId) return message.reply('Usage: `!conweb ID`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const category = message.guild.channels.cache.get(categoryId);
    if (!category || category.type !== ChannelType.GuildCategory) return message.reply('❌ Invalid!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    webCategories.set(message.guild.id, categoryId);
    saveData();
    message.reply(`✅ Set: **${category.name}**`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    message.delete().catch(() => {});
  }

  if (command === 'conorders') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ Admin only!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const channelId = args[0];
    if (!channelId) return message.reply('Usage: `!conorders ID`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const channel = message.guild.channels.cache.get(channelId);
    if (!channel || channel.type !== ChannelType.GuildText) return message.reply('❌ Invalid!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    orderChannels.set(message.guild.id, channelId);
    saveData();
    message.reply(`✅ Set: <#${channelId}>`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    message.delete().catch(() => {});
  }

  if (command === 'condone') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ Admin only!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const channelId = args[0];
    if (!channelId) return message.reply('Usage: `!condone ID`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const channel = message.guild.channels.cache.get(channelId);
    if (!channel || channel.type !== ChannelType.GuildText) return message.reply('❌ Invalid!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    doneChannels.set(message.guild.id, channelId);
    saveData();
    message.reply(`✅ Set: <#${channelId}>`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    message.delete().catch(() => {});
  }

  if (command === 'conshop') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ Admin only!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const categoryId = args[0];
    if (!categoryId) return message.reply('Usage: `!conshop ID`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const category = message.guild.channels.cache.get(categoryId);
    if (!category || category.type !== ChannelType.GuildCategory) return message.reply('❌ Invalid!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    shopCategories.set(message.guild.id, categoryId);
    saveData();
    message.reply(`✅ Set: **${category.name}**`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    message.delete().catch(() => {});
  }

  if (command === 'contrade') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ Admin only!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const channelId = args[0];
    if (!channelId) return message.reply('Usage: `!contrade ID`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const channel = message.guild.channels.cache.get(channelId);
    if (!channel || channel.type !== ChannelType.GuildText) return message.reply('❌ Invalid!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    tradeChannels.set(message.guild.id, channelId);
    saveData();
    message.reply(`✅ Set: <#${channelId}>`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    message.delete().catch(() => {});
  }

  if (command === 'contranscript') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ Admin only!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const channelId = args[0];
    if (!channelId) return message.reply('Usage: `!contranscript ID`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const channel = message.guild.channels.cache.get(channelId);
    if (!channel || channel.type !== ChannelType.GuildText) return message.reply('❌ Invalid!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    transcriptChannels.set(message.guild.id, channelId);
    saveData();
    message.reply(`✅ Set: <#${channelId}>`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    message.delete().catch(() => {});
  }

  if (command === 'connews') {
    if (!canUseCommands) return message.reply('❌ No permission!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const channelId = args[0];
    if (!channelId) return message.reply('Usage: `!connews ID`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const channel = message.guild.channels.cache.get(channelId);
    if (!channel || channel.type !== ChannelType.GuildText) return message.reply('❌ Invalid!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    shopNews.set(message.guild.id, channelId);
    saveData();
    message.reply(`✅ Set: <#${channelId}>`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    message.delete().catch(() => {});
  }

  if (command === 'stock') {
    if (!canUseCommands) return message.reply('❌ No permission!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const action = args[0];
    const amount = parseInt(args[1]);
    const userId = args[2];
    const itemName = args.slice(3).join(' ');
    if (!action || !amount || !userId || !itemName) return message.reply('Usage: `!stock +/- AMOUNT UID ITEM`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    if (action !== '+' && action !== '-') return message.reply('❌ Use + or -').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    if (isNaN(amount) || amount <= 0) return message.reply('❌ Invalid amount!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const guildShops = shopListings.get(message.guild.id) || new Map();
    let userItems = guildShops.get(userId) || [];
    const item = userItems.find(i => i.name.toLowerCase() === itemName.toLowerCase());
    if (!item) return message.reply(`❌ Not found!`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const oldStock = item.stock || 0;
    item.stock = action === '+' ? oldStock + amount : Math.max(0, oldStock - amount);
    guildShops.set(userId, userItems);
    shopListings.set(message.guild.id, guildShops);
    await saveData();
    const user = await client.users.fetch(userId).catch(() => null);
    const stockEmbed = new EmbedBuilder().setColor(action === '+' ? '#00FF00' : '#FF6B35').setAuthor({ name: action === '+' ? '📈 Stock +' : '📉 Stock -', iconURL: message.guild.iconURL() }).setTitle(`${item.name}`).addFields({ name: '🎮 Game', value: `${item.gameCategory || 'N/A'}`, inline: true }, { name: '👤 Seller', value: `${user || `<@${userId}>`}`, inline: true }, { name: '💰 Price', value: `${item.price}`, inline: true }, { name: '📊 Old', value: `${oldStock}`, inline: true }, { name: `${action === '+' ? '➕' : '➖'} Change`, value: `${action}${amount}`, inline: true }, { name: '📦 New', value: `${item.stock}`, inline: true }).setTimestamp();
    message.reply({ embeds: [stockEmbed] }).then(msg => setTimeout(() => msg.delete().catch(() => {}), 30000));
    message.delete().catch(() => {});
    const newsChannelId = shopNews.get(message.guild.id);
    if (newsChannelId) {
      const newsChannel = message.guild.channels.cache.get(newsChannelId);
      if (newsChannel) {
        const newsEmbed = new EmbedBuilder().setColor(action === '+' ? '#00FF00' : '#FFA500').setTitle(action === '+' ? '🆕 Fresh Stock!' : '⚠️ Stock Update').setDescription(`**${item.name}**\n\n🎮 ${item.gameCategory || 'N/A'}\n📦 **${item.stock}** available\n💰 ${item.price}\n👤 <@${userId}>`).setTimestamp();
        const sentMsg = await newsChannel.send({ embeds: [newsEmbed] });
        await sentMsg.react(action === '+' ? '🆕' : '📊');
      }
    }
  }

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
        const webhook = await newChannel.createWebhook({ name: `${channelName}-webhook`, reason: `By ${message.author.tag}` });
        await message.channel.send(`✅ <#${newChannel.id}>`);
        await message.channel.send(webhook.url);
      } catch (webhookError) {
        await message.channel.send(`✅ <#${newChannel.id}>\n❌ Webhook failed`);
      }
    } catch (err) {
      console.error('Create web error:', err);
      message.reply(`❌ Failed!`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }
  }

  if (command === 'done') {
    if (!message.channel.name.startsWith('ticket-')) return message.reply('❌ Only in tickets!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const ticketOwnerName = message.channel.name.replace('ticket-', '');
    const ticketOwner = message.guild.members.cache.find(m => m.user.username.toLowerCase() === ticketOwnerName.toLowerCase());
    if (!ticketOwner) return message.reply('❌ Owner not found!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const doneButton = new ButtonBuilder().setCustomId('owner_done_confirmation').setLabel('Yes, Mark Done').setEmoji('✅').setStyle(ButtonStyle.Success);
    const cancelButton = new ButtonBuilder().setCustomId('owner_cancel_done').setLabel('Not Yet').setEmoji('❌').setStyle(ButtonStyle.Danger);
    const row = new ActionRowBuilder().addComponents(doneButton, cancelButton);
    await message.channel.send({ content: `${ticketOwner.user}\n\n**Mark done?**\nClick below:`, components: [row] });
    await message.delete().catch(() => {});
  }

  if (command === 'forcedone') {
    if (!canUseCommands) return message.reply('❌ Admin only!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    if (!message.channel.name.startsWith('ticket-')) return message.reply('❌ Only in tickets!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const ticketOwnerName = message.channel.name.replace('ticket-', '');
    const ticketOwner = message.guild.members.cache.find(m => m.user.username.toLowerCase() === ticketOwnerName.toLowerCase());
    let serviceDescription = 'N/A';
    try {
      const messages = await message.channel.messages.fetch({ limit: 50 });
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
    } catch (err) {}
    const doneChannelId = doneChannels.get(message.guild.id);
    if (doneChannelId) {
      const doneChannel = message.guild.channels.cache.get(doneChannelId);
      if (doneChannel) {
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const doneMessage = `╔═══════════════════════════════════╗
║     ✅ 𝗦𝗘𝗥𝗩𝗜𝗖𝗘 𝗖𝗢𝗠𝗣𝗟𝗘𝗧𝗘𝗗     ║
╚═══════════════════════════════════╝

🎉 **${ticketOwner ? ticketOwner.user.tag : ticketOwnerName} received service!**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 **𝗦𝗘𝗥𝗩𝗜𝗖𝗘:**
${serviceDescription}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 **𝗖𝗨𝗦𝗧𝗢𝗠𝗘𝗥:** ${ticketOwner ? ticketOwner.user : ticketOwnerName}
✅ **𝗙𝗢𝗥𝗖𝗘𝗗 𝗕𝗬:** ${message.author}
⏰ <t:${currentTimestamp}:F>`;
        const sentMessage = await doneChannel.send(doneMessage);
        await sentMessage.react('✅');
        await sentMessage.react('🎉');
      }
    }
    await message.channel.send(`✅ **Force done by ${message.author}!**\n\nClosing in 5s...`);
    await message.delete().catch(() => {});
    setTimeout(async () => {
      const ticketId = message.channel.id;
      const createdChannels = ticketChannels.get(ticketId) || [];
      for (const channelId of createdChannels) {
        const ch = message.guild.channels.cache.get(channelId);
        if (ch) await ch.delete().catch(console.error);
      }
      ticketChannels.delete(ticketId);
      ticketOwners.delete(ticketId);
      await saveData();
      await message.channel.delete().catch(console.error);
    }, 5000);
  }

  if (command === 'close') {
    if (!canUseCommands) return message.reply('❌ Admin only!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    if (!message.channel.name.startsWith('ticket-') && !message.channel.name.startsWith('shop-')) return message.reply('❌ Not a ticket!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    await message.channel.send('🔒 **Closing...**\n\n5s...');
    await message.delete().catch(() => {});
    setTimeout(async () => {
      const ticketId = message.channel.id;
      const createdChannels = ticketChannels.get(ticketId) || [];
      for (const channelId of createdChannels) {
        const ch = message.guild.channels.cache.get(channelId);
        if (ch) await ch.delete().catch(console.error);
      }
      ticketChannels.delete(ticketId);
      ticketOwners.delete(ticketId);
      await saveData();
      await message.channel.delete().catch(console.error);
    }, 5000);
  }

  if (command === 'ticket') {
    const fullText = args.join(' ');
    if (!fullText) return message.reply('Usage: `!ticket Title\nDesc`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const lines = fullText.split('\n');
    const title = lines[0];
    const text = lines.slice(1).join('\n');
    const embed = new EmbedBuilder().setColor('#00FFFF').setAuthor({ name: 'Support Ticket', iconURL: message.guild.iconURL() }).setTitle(`🎫 ${title}`).setDescription(text || 'Click below to create ticket').addFields({ name: '📋 Next?', value: 'Team will assist', inline: false }).setThumbnail(message.guild.iconURL()).setFooter({ text: 'Click below' }).setTimestamp();
    const button = new ButtonBuilder().setCustomId('create_ticket').setLabel('Create Ticket').setEmoji('🎫').setStyle(ButtonStyle.Primary);
    const row = new ActionRowBuilder().addComponents(button);
    try {
      await message.delete();
      await message.channel.send('@everyone');
      await message.channel.send({ embeds: [embed], components: [row] });
    } catch (err) {
      message.reply('❌ Failed!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }
  }

  if (command === 'shop') {
    const embed = new EmbedBuilder().setColor('#FFD700').setTitle('🛒 Shop').setDescription('Browse items or manage your shop!').setTimestamp();
    const shopButton = new ButtonBuilder().setCustomId('shop_browse').setLabel('Shop').setEmoji('🛍️').setStyle(ButtonStyle.Primary);
    const manageButton = new ButtonBuilder().setCustomId('shop_manage').setLabel('Manage').setEmoji('⚙️').setStyle(ButtonStyle.Secondary);
    const row = new ActionRowBuilder().addComponents(shopButton, manageButton);
    try {
      await message.delete();
      await message.channel.send({ embeds: [embed], components: [row] });
    } catch (err) {
      message.reply('❌ Failed!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }
  }

  if (command === 'help') {
    const helpEmbed = new EmbedBuilder().setColor('#5865F2').setTitle('🎨 Commands').addFields({ name: '🎫 Ticket', value: '`!ticket` `!done` `!forcedone` `!close` `!createweb`', inline: false }, { name: '🛒 Shop', value: '`!shop` `!stock +/- amt uid item`', inline: false }, { name: '🎮 Games', value: '`!addgame` `!removegame` `!listgames`', inline: false }, { name: '⚙️ Config', value: '`!concategory/web/orders/done/shop/trade/transcript/news ID`', inline: false }, { name: '👑 Admin', value: '`!admadm/rem/list`', inline: false }).setTimestamp();
    message.reply({ embeds: [helpEmbed] }).then(msg => setTimeout(() => msg.delete().catch(() => {}), 60000));
    message.delete().catch(() => {});
  }
});

client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isButton()) {
      if (interaction.customId === 'shop_browse') {
        const guildGames = gameCategories.get(interaction.guild.id) || [];
        if (guildGames.length === 0) return interaction.reply({ content: '❌ No games! Ask admin `!addgame`', ephemeral: true });
        const selectOptions = guildGames.slice(0, 25).map(game => ({ label: game, description: `Browse ${game}`, value: game }));
        const selectMenu = new StringSelectMenuBuilder().setCustomId('shop_select_game').setPlaceholder('🎮 Select game').addOptions(selectOptions);
        const row = new ActionRowBuilder().addComponents(selectMenu);
        await interaction.reply({ content: '🎮 **Select game:**', components: [row], ephemeral: true });
      }

      if (interaction.customId === 'shop_manage') {
        const addButton = new ButtonBuilder().setCustomId('shop_add').setLabel('Add').setEmoji('➕').setStyle(ButtonStyle.Success);
        const removeButton = new ButtonBuilder().setCustomId('shop_remove').setLabel('Remove').setEmoji('➖').setStyle(ButtonStyle.Danger);
        const changeButton = new ButtonBuilder().setCustomId('shop_change').setLabel('Edit').setEmoji('✏️').setStyle(ButtonStyle.Primary);
        const row = new ActionRowBuilder().addComponents(addButton, removeButton, changeButton);
        await interaction.reply({ content: '🛒 **Manage:**', components: [row], ephemeral: true });
      }

      if (interaction.customId === 'shop_add') {
        const guildGames = gameCategories.get(interaction.guild.id) || [];
        if (guildGames.length === 0) return interaction.reply({ content: '❌ No games!', ephemeral: true });
        const selectOptions = guildGames.slice(0, 25).map(game => ({ label: game, description: `Add to ${game}`, value: game }));
        const selectMenu = new StringSelectMenuBuilder().setCustomId('shop_add_select_game').setPlaceholder('🎮 Select game').addOptions(selectOptions);
        const row = new ActionRowBuilder().addComponents(selectMenu);
        await interaction.reply({ content: '🎮 **Which game?**', components: [row], ephemeral: true });
      }

      if (interaction.customId === 'shop_remove') {
        const guildShops = shopListings.get(interaction.guild.id) || new Map();
        const userItems = guildShops.get(interaction.user.id) || [];
        if (userItems.length === 0) return interaction.reply({ content: '❌ No items!', ephemeral: true });
        const selectOptions = userItems.slice(0, 25).map(item => ({ label: `${item.name} (${item.stock || 0})`, description: `${item.gameCategory || 'N/A'} - ${item.price}`, value: item.id }));
        const selectMenu = new StringSelectMenuBuilder().setCustomId('shop_remove_select').setPlaceholder('Select item').addOptions(selectOptions);
        const row = new ActionRowBuilder().addComponents(selectMenu);
        await interaction.reply({ content: '🗑️ **Select:**', components: [row], ephemeral: true });
      }

      if (interaction.customId === 'shop_change') {
        const guildShops = shopListings.get(interaction.guild.id) || new Map();
        const userItems = guildShops.get(interaction.user.id) || [];
        if (userItems.length === 0) return interaction.reply({ content: '❌ No items!', ephemeral: true });
        const selectOptions = userItems.slice(0, 25).map(item => ({ label: `${item.name} (${item.stock || 0})`, description: `${item.gameCategory || 'N/A'} - ${item.price}`, value: item.id }));
        const selectMenu = new StringSelectMenuBuilder().setCustomId('shop_change_select').setPlaceholder('Select item').addOptions(selectOptions);
        const row = new ActionRowBuilder().addComponents(selectMenu);
        await interaction.reply({ content: '✏️ **Select:**', components: [row], ephemeral: true });
      }

      if (interaction.customId === 'create_ticket') {
        const categoryId = ticketCategories.get(interaction.guild.id);
        if (!categoryId) return interaction.reply({ content: '❌ Category not set! Ask admin to use `!concategory`', ephemeral: true });
        const category = interaction.guild.channels.cache.get(categoryId);
        if (!category) return interaction.reply({ content: '❌ Category not found!', ephemeral: true });
        const existingTicket = interaction.guild.channels.cache.find(ch => ch.name === `ticket-${interaction.user.username.toLowerCase()}` && ch.parentId === categoryId);
        if (existingTicket) return interaction.reply({ content: `❌ You already have a ticket: <#${existingTicket.id}>`, ephemeral: true });
        const modal = new ModalBuilder().setCustomId('ticket_modal').setTitle('Create Ticket');
        const serviceInput = new TextInputBuilder().setCustomId('service_type').setLabel('Service?').setPlaceholder('Describe service').setStyle(TextInputStyle.Paragraph).setRequired(true);
        const actionRow = new ActionRowBuilder().addComponents(serviceInput);
        modal.addComponents(actionRow);
        await interaction.showModal(modal);
      }

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
        await interaction.update({ content: `✅ Removed **${itemName}**!`, components: [] });
      }

      if (interaction.customId === 'shop_cancel_remove') {
        await interaction.update({ content: '❌ Cancelled.', components: [] });
      }

      if (interaction.customId === 'close_ticket') {
        if (!interaction.channel.name.startsWith('ticket-') && !interaction.channel.name.startsWith('shop-')) return interaction.reply({ content: '❌ Not a ticket!', ephemeral: true });
        await interaction.reply('🔒 Closing in 5s...');
        setTimeout(async () => {
          const ticketId = interaction.channel.id;
          const createdChannels = ticketChannels.get(ticketId) || [];
          for (const channelId of createdChannels) {
            const ch = interaction.guild.channels.cache.get(channelId);
            if (ch) await ch.delete().catch(console.error);
          }
          ticketChannels.delete(ticketId);
          ticketOwners.delete(ticketId);
          await saveData();
          await interaction.channel.delete().catch(console.error);
        }, 5000);
      }

      if (interaction.customId === 'done_ticket') {
        if (!interaction.channel.name.startsWith('ticket-')) return interaction.reply({ content: '❌ Not a ticket!', ephemeral: true });
        const ticketOwnerName = interaction.channel.name.replace('ticket-', '');
        const ticketOwner = interaction.guild.members.cache.find(m => m.user.username.toLowerCase() === ticketOwnerName.toLowerCase());
        if (ticketOwner && interaction.user.id !== ticketOwner.id) return interaction.reply({ content: '❌ Only ticket creator can mark as done!', ephemeral: true });
        const confirmButton = new ButtonBuilder().setCustomId('confirm_done').setLabel('Confirm').setEmoji('✅').setStyle(ButtonStyle.Success);
        const denyButton = new ButtonBuilder().setCustomId('deny_done').setLabel('Deny').setEmoji('❌').setStyle(ButtonStyle.Danger);
        const confirmRow = new ActionRowBuilder().addComponents(confirmButton, denyButton);
        await interaction.reply({ content: `⏳ **${interaction.user}** marked done!\n\n**Admins:** Confirm?`, components: [confirmRow] });
      }

      if (interaction.customId === 'owner_done_confirmation') {
        if (!interaction.channel.name.startsWith('ticket-')) return interaction.reply({ content: '❌ Not a ticket!', ephemeral: true });
        const ticketOwnerName = interaction.channel.name.replace('ticket-', '');
        const ticketOwner = interaction.guild.members.cache.find(m => m.user.username.toLowerCase() === ticketOwnerName.toLowerCase());
        if (ticketOwner && interaction.user.id !== ticketOwner.id) return interaction.reply({ content: '❌ Only ticket creator!', ephemeral: true });
        const confirmButton = new ButtonBuilder().setCustomId('confirm_done').setLabel('Confirm').setEmoji('✅').setStyle(ButtonStyle.Success);
        const denyButton = new ButtonBuilder().setCustomId('deny_done').setLabel('Deny').setEmoji('❌').setStyle(ButtonStyle.Danger);
        const confirmRow = new ActionRowBuilder().addComponents(confirmButton, denyButton);
        await interaction.update({ content: `⏳ **${interaction.user}** marked done!\n\n**Admins:** Confirm?`, components: [confirmRow] });
      }

      if (interaction.customId === 'owner_cancel_done') {
        if (!interaction.channel.name.startsWith('ticket-')) return interaction.reply({ content: '❌ Not a ticket!', ephemeral: true });
        await interaction.update({ content: `❌ **${interaction.user}** cancelled.\n\nTicket still open.`, components: [] });
      }

      if (interaction.customId === 'confirm_done') {
        const isOwner = interaction.user.id === OWNER_ID;
        const admins = adminUsers.get(interaction.guild.id) || [];
        const isAdmin = admins.includes(interaction.user.id);
        if (!isOwner && !isAdmin) return interaction.reply({ content: '❌ Only admins can confirm!', ephemeral: true });
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
        } catch (err) {}
        const doneChannelId = doneChannels.get(interaction.guild.id);
        if (doneChannelId) {
          const doneChannel = interaction.guild.channels.cache.get(doneChannelId);
          if (doneChannel) {
            const currentTimestamp = Math.floor(Date.now() / 1000);
            const doneMessage = `╔═══════════════════════════════════╗
║     ✅ 𝗦𝗘𝗥𝗩𝗜𝗖𝗘 𝗖𝗢𝗠𝗣𝗟𝗘𝗧𝗘𝗗     ║
╚═══════════════════════════════════╝

🎉 **${ticketOwner ? ticketOwner.user.tag : ticketOwnerName} received service!**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 **𝗦𝗘𝗥𝗩𝗜𝗖𝗘:**
${serviceDescription}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 **𝗖𝗨𝗦𝗧𝗢𝗠𝗘𝗥:** ${ticketOwner ? ticketOwner.user : ticketOwnerName}
✅ **𝗖𝗢𝗡𝗙𝗜𝗥𝗠𝗘𝗗 𝗕𝗬:** ${interaction.user}
⏰ <t:${currentTimestamp}:F>`;
            try {
              const sentMessage = await doneChannel.send(doneMessage);
              await sentMessage.react('✅');
              await sentMessage.react('🎉');
            } catch (err) {
              console.error('Done channel send error:', err);
            }
          }
        }
        await interaction.update({ content: `✅ **Confirmed by ${interaction.user}!**\n\nClosing in 5s...`, components: [] });
        setTimeout(async () => {
          const ticketId = interaction.channel.id;
          const createdChannels = ticketChannels.get(ticketId) || [];
          for (const channelId of createdChannels) {
            const ch = interaction.guild.channels.cache.get(channelId);
            if (ch) await ch.delete().catch(console.error);
          }
          ticketChannels.delete(ticketId);
          ticketOwners.delete(ticketId);
          await saveData();
          await interaction.channel.delete().catch(console.error);
        }, 5000);
      }

      if (interaction.customId === 'deny_done') {
        const isOwner = interaction.user.id === OWNER_ID;
        const admins = adminUsers.get(interaction.guild.id) || [];
        const isAdmin = admins.includes(interaction.user.id);
        if (!isOwner && !isAdmin) return interaction.reply({ content: '❌ Only admins!', ephemeral: true });
        await interaction.update({ content: `❌ **Denied by ${interaction.user}.**\n\nTicket not done.`, components: [] });
      }

      if (interaction.customId.startsWith('shop_buyer_mark_done_')) {
        const parts = interaction.customId.replace('shop_buyer_mark_done_', '').split('_');
        const sellerId = parts[0];
        const buyerId = parts[1];
        const itemId = parts[2];
        if (interaction.user.id !== buyerId) return interaction.reply({ content: '❌ Only buyer can mark as done!', ephemeral: true });
        const confirmButton = new ButtonBuilder().setCustomId(`shop_buyer_confirm_${sellerId}_${buyerId}_${itemId}`).setLabel('Yes, Received').setEmoji('✅').setStyle(ButtonStyle.Success);
        const cancelButton = new ButtonBuilder().setCustomId('shop_buyer_cancel').setLabel('Not Yet').setEmoji('❌').setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);
        await interaction.update({ content: `${interaction.user}\n\n**Received item?**\nConfirm:`, components: [row] });
      }

      if (interaction.customId.startsWith('shop_buyer_confirm_')) {
        const parts = interaction.customId.replace('shop_buyer_confirm_', '').split('_');
        const sellerId = parts[0];
        const buyerId = parts[1];
        const itemId = parts[2];
        if (interaction.user.id !== buyerId) return interaction.reply({ content: '❌ Only buyer!', ephemeral: true });
        const confirmButton = new ButtonBuilder().setCustomId(`shop_admin_confirm_${sellerId}_${buyerId}_${itemId}`).setLabel('Confirm').setEmoji('✅').setStyle(ButtonStyle.Success);
        const denyButton = new ButtonBuilder().setCustomId('shop_admin_deny').setLabel('Deny').setEmoji('❌').setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder().addComponents(confirmButton, denyButton);
        await interaction.update({ content: `✅ **${interaction.user} confirmed!**\n\n**Admins:** Verify?`, components: [row] });
      }

      if (interaction.customId === 'shop_buyer_cancel') {
        await interaction.update({ content: `❌ **${interaction.user}** cancelled.\n\nNot done.`, components: [] });
      }

      if (interaction.customId.startsWith('shop_admin_confirm_')) {
        const isOwner = interaction.user.id === OWNER_ID;
        const admins = adminUsers.get(interaction.guild.id) || [];
        const isAdmin = admins.includes(interaction.user.id);
        if (!isOwner && !isAdmin) return interaction.reply({ content: '❌ Only admins!', ephemeral: true });
        const parts = interaction.customId.replace('shop_admin_confirm_', '').split('_');
        const sellerId = parts[0];
        const buyerId = parts[1];
        const itemId = parts[2];
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
            const buyer = await interaction.client.users.fetch(buyerId).catch(() => null);
            const currentTimestamp = Math.floor(Date.now() / 1000);
            const tradeMessage = `╔═══════════════════════════════════╗
║        ✅ 𝗧𝗥𝗔𝗗𝗘 𝗖𝗢𝗠𝗣𝗟𝗘𝗧𝗘𝗗        ║
╚═══════════════════════════════════╝

🎮 **𝗚𝗔𝗠𝗘:** \`${item.gameCategory || 'N/A'}\`
🛍️ **𝗜𝗧𝗘𝗠:** \`${item.name}\`
💰 **𝗣𝗥𝗜𝗖𝗘:** \`${item.price}\`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 **𝗦𝗘𝗟𝗟𝗘𝗥:** ${seller || `<@${sellerId}>`}
🛒 **𝗕𝗨𝗬𝗘𝗥:** ${buyer || `<@${buyerId}>`}
✅ **𝗖𝗢𝗡𝗙𝗜𝗥𝗠𝗘𝗗 𝗕𝗬:** ${interaction.user}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 **𝗦𝗧𝗢𝗖𝗞 𝗟𝗘𝗙𝗧:** \`${item.stock}\`

⏰ <t:${currentTimestamp}:F>`;
            try {
              const sentMessage = await tradeChannel.send(tradeMessage);
              await sentMessage.react('✅');
              await sentMessage.react('🎉');
            } catch (err) {
              console.error('Trade channel send error:', err);
            }
          }
        }
        await interaction.update({ content: `✅ **Trade confirmed!**\nStock remaining: **${item.stock}**\n\nClosing in 5s...`, components: [] });
        setTimeout(async () => {
          await interaction.channel.delete().catch(console.error);
        }, 5000);
      }

      if (interaction.customId === 'shop_admin_deny') {
        const isOwner = interaction.user.id === OWNER_ID;
        const admins = adminUsers.get(interaction.guild.id) || [];
        const isAdmin = admins.includes(interaction.user.id);
        if (!isOwner && !isAdmin) return interaction.reply({ content: '❌ Only admins!', ephemeral: true });
        await interaction.update({ content: `❌ **Denied by ${interaction.user}.**`, components: [] });
      }
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'ticket_modal') {
        const serviceDescription = interaction.fields.getTextInputValue('service_type');
        const categoryId = ticketCategories.get(interaction.guild.id);
        if (!categoryId) return interaction.reply({ content: '❌ Category not configured!', ephemeral: true });

        try {
          const ticketChannel = await interaction.guild.channels.create({ 
            name: `ticket-${interaction.user.username}`, 
            type: ChannelType.GuildText, 
            parent: categoryId, 
            permissionOverwrites: [
              { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] }, 
              { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }, 
              { id: interaction.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
            ] 
          });

          const staffRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase().includes('staff') || r.name.toLowerCase().includes('admin') || r.name.toLowerCase().includes('mod'));
          if (staffRole) {
            await ticketChannel.permissionOverwrites.create(staffRole, { 
              ViewChannel: true, 
              SendMessages: true, 
              ReadMessageHistory: true 
            }).catch(console.error);
          }

          await ticketChannel.permissionOverwrites.create(OWNER_ID, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true
          }).catch(console.error);

          const admins = adminUsers.get(interaction.guild.id) || [];
          for (const adminId of admins) {
            await ticketChannel.permissionOverwrites.create(adminId, {
              ViewChannel: true,
              SendMessages: true,
              ReadMessageHistory: true
            }).catch(console.error);
          }

          const doneButton = new ButtonBuilder().setCustomId('done_ticket').setLabel('Done').setEmoji('✅').setStyle(ButtonStyle.Success);
          const closeButton = new ButtonBuilder().setCustomId('close_ticket').setLabel('Close').setEmoji('🔒').setStyle(ButtonStyle.Danger);
          const row = new ActionRowBuilder().addComponents(doneButton, closeButton);

          await ticketChannel.send({ 
            content: `@everyone\n\n🎫 **Ticket created by ${interaction.user}**\n\n**Service Request:**\n${serviceDescription}`, 
            components: [row], 
            allowedMentions: { parse: ['everyone'] } 
          });

          ticketOwners.set(ticketChannel.id, interaction.user.id);
          await saveData();

          const orderChannelId = orderChannels.get(interaction.guild.id);
          if (orderChannelId) {
            const orderChannel = interaction.guild.channels.cache.get(orderChannelId);
            if (orderChannel) {
              const orderTimestamp = Math.floor(Date.now() / 1000);
              const orderEmbed = new EmbedBuilder()
                .setColor('#FF6B35')
                .setAuthor({ name: '📦 New Order Received', iconURL: interaction.guild.iconURL() })
                .setTitle(`${interaction.user.tag}`)
                .setDescription(`\`\`\`${serviceDescription}\`\`\``)
                .addFields(
                  { name: '👤 Customer', value: `${interaction.user}`, inline: true },
                  { name: '🎫 Channel', value: `<#${ticketChannel.id}>`, inline: true },
                  { name: '⏰ Time', value: `<t:${orderTimestamp}:F>`, inline: false }
                )
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter({ text: `Order ID: ${ticketChannel.id}` })
                .setTimestamp();

              try {
                const orderMsg = await orderChannel.send({ embeds: [orderEmbed] });
                await orderMsg.react('👀');
                await orderMsg.react('✅');
              } catch (err) {
                console.error('Order channel send error:', err);
              }
            }
          }

          await interaction.reply({ content: `✅ Ticket created! <#${ticketChannel.id}>`, ephemeral: true });
        } catch (err) {
          console.error('Ticket creation error:', err);
          await interaction.reply({ content: '❌ Failed to create ticket! Please contact an administrator.', ephemeral: true });
        }
      }

      if (interaction.customId.startsWith('shop_add_modal_')) {
        const gameCategory = interaction.customId.replace('shop_add_modal_', '');
        const itemName = interaction.fields.getTextInputValue('item_name');
        const itemStockStr = interaction.fields.getTextInputValue('item_stock');
        const itemPrice = interaction.fields.getTextInputValue('item_price');

        const itemStock = parseInt(itemStockStr);
        if (isNaN(itemStock) || itemStock < 0) {
          return interaction.reply({ content: '❌ Invalid stock number!', ephemeral: true });
        }

        const guildShops = shopListings.get(interaction.guild.id) || new Map();
        let userItems = guildShops.get(interaction.user.id) || [];
        const itemId = `${Date.now()}_${interaction.user.id}`;

        userItems.push({ 
          id: itemId, 
          name: itemName, 
          price: itemPrice, 
          stock: itemStock, 
          seller: interaction.user.tag, 
          gameCategory: gameCategory 
        });

        guildShops.set(interaction.user.id, userItems);
        shopListings.set(interaction.guild.id, guildShops);
        await saveData();

        const newsChannelId = shopNews.get(interaction.guild.id);
        if (newsChannelId) {
          const newsChannel = interaction.guild.channels.cache.get(newsChannelId);
          if (newsChannel) {
            const newsEmbed = new EmbedBuilder()
              .setColor('#00FF00')
              .setAuthor({ name: '🆕 New Item Listed!', iconURL: interaction.guild.iconURL() })
              .setTitle(`${itemName}`)
              .setDescription(`A fresh item just hit the shop!`)
              .addFields(
                { name: '🎮 Game', value: `\`${gameCategory}\``, inline: true },
                { name: '💰 Price', value: `\`${itemPrice}\``, inline: true },
                { name: '📦 Stock', value: `\`${itemStock}\``, inline: true },
                { name: '👤 Seller', value: `${interaction.user}`, inline: false }
              )
              .setThumbnail(interaction.user.displayAvatarURL())
              .setFooter({ text: 'Use !shop to browse' })
              .setTimestamp();

            try {
              const sentMessage = await newsChannel.send({ embeds: [newsEmbed] });
              await sentMessage.react('🛍️');
              await sentMessage.react('🔥');
            } catch (err) {
              console.error('News channel send error:', err);
            }
          }
        }

        await interaction.reply({ content: `✅ Successfully added **${itemName}** to your shop!`, ephemeral: true });
      }

      if (interaction.customId.startsWith('shop_change_modal_')) {
        const itemId = interaction.customId.replace('shop_change_modal_', '');
        const itemName = interaction.fields.getTextInputValue('item_name');
        const itemStockStr = interaction.fields.getTextInputValue('item_stock');
        const itemPrice = interaction.fields.getTextInputValue('item_price');

        const itemStock = parseInt(itemStockStr);
        if (isNaN(itemStock) || itemStock < 0) {
          return interaction.reply({ content: '❌ Invalid stock number!', ephemeral: true });
        }

        const guildShops = shopListings.get(interaction.guild.id) || new Map();
        let userItems = guildShops.get(interaction.user.id) || [];
        const itemIndex = userItems.findIndex(i => i.id === itemId);

        if (itemIndex === -1) {
          return interaction.reply({ content: '❌ Item not found!', ephemeral: true });
        }

        userItems[itemIndex].name = itemName;
        userItems[itemIndex].price = itemPrice;
        userItems[itemIndex].stock = itemStock;

        guildShops.set(interaction.user.id, userItems);
        shopListings.set(interaction.guild.id, guildShops);
        await saveData();

        await interaction.reply({ content: `✅ Successfully updated **${itemName}**!`, ephemeral: true });
      }
    }

    if (interaction.isStringSelectMenu()) {
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
                label: `${item.name} - ${item.price}`, 
                description: `Stock: ${item.stock || 0} | Seller: ${userName}`, 
                value: `${userId}-${item.id}` 
              });
              optionCount++;
            }
          }
        }

        if (selectOptions.length === 0) {
          return interaction.update({ content: `❌ No items available for **${selectedGame}**!`, components: [] });
        }

        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId('shop_select_item')
          .setPlaceholder('Select an item to purchase')
          .addOptions(selectOptions);

        const row = new ActionRowBuilder().addComponents(selectMenu);
        await interaction.update({ content: `🎮 **${selectedGame}** - Select item:`, components: [row] });
      }

      if (interaction.customId === 'shop_add_select_game') {
        const selectedGame = interaction.values[0];
        const modal = new ModalBuilder()
          .setCustomId(`shop_add_modal_${selectedGame}`)
          .setTitle(`Add Item - ${selectedGame}`);

        const nameInput = new TextInputBuilder()
          .setCustomId('item_name')
          .setLabel('Item Name')
          .setPlaceholder('e.g., Diamond Sword')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(100);

        const stockInput = new TextInputBuilder()
          .setCustomId('item_stock')
          .setLabel('Stock Quantity')
          .setPlaceholder('e.g., 10')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(10);

        const priceInput = new TextInputBuilder()
          .setCustomId('item_price')
          .setLabel('Price')
          .setPlaceholder('e.g., 100 PHP or 5 USD')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(50);

        const row1 = new ActionRowBuilder().addComponents(nameInput);
        const row2 = new ActionRowBuilder().addComponents(stockInput);
        const row3 = new ActionRowBuilder().addComponents(priceInput);

        modal.addComponents(row1, row2, row3);
        await interaction.showModal(modal);
      }

      if (interaction.customId === 'shop_remove_select') {
        const itemId = interaction.values[0];
        const guildShops = shopListings.get(interaction.guild.id) || new Map();
        let userItems = guildShops.get(interaction.user.id) || [];
        const item = userItems.find(i => i.id === itemId);

        if (!item) {
          return interaction.reply({ content: '❌ Item not found!', ephemeral: true });
        }

        const confirmButton = new ButtonBuilder()
          .setCustomId(`shop_confirm_remove_${itemId}`)
          .setLabel('Confirm Remove')
          .setStyle(ButtonStyle.Danger);

        const cancelButton = new ButtonBuilder()
          .setCustomId('shop_cancel_remove')
          .setLabel('Cancel')
          .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);
        await interaction.update({ content: `⚠️ Are you sure you want to remove **${item.name}**?`, components: [row] });
      }

      if (interaction.customId === 'shop_change_select') {
        const itemId = interaction.values[0];
        const guildShops = shopListings.get(interaction.guild.id) || new Map();
        const userItems = guildShops.get(interaction.user.id) || [];
        const item = userItems.find(i => i.id === itemId);

        if (!item) {
          return interaction.reply({ content: '❌ Item not found!', ephemeral: true });
        }

        const modal = new ModalBuilder()
          .setCustomId(`shop_change_modal_${itemId}`)
          .setTitle('Edit Item');

        const nameInput = new TextInputBuilder()
          .setCustomId('item_name')
          .setLabel('Item Name')
          .setValue(item.name)
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(100);

        const stockInput = new TextInputBuilder()
          .setCustomId('item_stock')
          .setLabel('Stock Quantity')
          .setValue(String(item.stock || 0))
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(10);

        const priceInput = new TextInputBuilder()
          .setCustomId('item_price')
          .setLabel('Price')
          .setValue(item.price)
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMaxLength(50);

        const row1 = new ActionRowBuilder().addComponents(nameInput);
        const row2 = new ActionRowBuilder().addComponents(stockInput);
        const row3 = new ActionRowBuilder().addComponents(priceInput);

        modal.addComponents(row1, row2, row3);
        await interaction.showModal(modal);
      }

      if (interaction.customId === 'shop_select_item') {
        const [sellerId, itemId] = interaction.values[0].split('-');
        const guildShops = shopListings.get(interaction.guild.id) || new Map();
        const sellerItems = guildShops.get(sellerId) || [];
        const item = sellerItems.find(i => i.id === itemId);

        if (!item) {
          return interaction.reply({ content: '❌ Item not found!', ephemeral: true });
        }

        if ((item.stock || 0) <= 0) {
          return interaction.reply({ content: '❌ This item is out of stock!', ephemeral: true });
        }

        const seller = await interaction.client.users.fetch(sellerId).catch(() => null);
        const buyer = interaction.user;
        const categoryId = shopCategories.get(interaction.guild.id) || ticketCategories.get(interaction.guild.id);

        if (!categoryId) {
          return interaction.reply({ content: '❌ Shop category not configured! Ask admin to use `!conshop`', ephemeral: true });
        }

        try {
          const ticketChannel = await interaction.guild.channels.create({ 
            name: `shop-${buyer.username}-${seller ? seller.username : 'seller'}`, 
            type: ChannelType.GuildText, 
            parent: categoryId, 
            permissionOverwrites: [
              { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] }, 
              { id: buyer.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }, 
              { id: sellerId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }, 
              { id: interaction.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
            ] 
          });

          const staffRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase().includes('staff') || r.name.toLowerCase().includes('admin') || r.name.toLowerCase().includes('mod'));
          if (staffRole) {
            await ticketChannel.permissionOverwrites.create(staffRole, { 
              ViewChannel: true, 
              SendMessages: true, 
              ReadMessageHistory: true 
            }).catch(console.error);
          }

          await ticketChannel.permissionOverwrites.create(OWNER_ID, { 
            ViewChannel: true, 
            SendMessages: true, 
            ReadMessageHistory: true 
          }).catch(console.error);

          const admins = adminUsers.get(interaction.guild.id) || [];
          for (const adminId of admins) {
            await ticketChannel.permissionOverwrites.create(adminId, { 
              ViewChannel: true, 
              SendMessages: true, 
              ReadMessageHistory: true 
            }).catch(console.error);
          }

          const doneButton = new ButtonBuilder()
            .setCustomId(`shop_buyer_mark_done_${sellerId}_${buyer.id}_${itemId}`)
            .setLabel('Mark Done')
            .setEmoji('✅')
            .setStyle(ButtonStyle.Success);

          const closeButton = new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('Close')
            .setEmoji('🔒')
            .setStyle(ButtonStyle.Danger);

          const row = new ActionRowBuilder().addComponents(doneButton, closeButton);

          const itemEmbed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🛍️ Shop Transaction')
            .setDescription(`**Transaction Steps:**\n1️⃣ Seller delivers the item\n2️⃣ Buyer clicks "Mark Done" after receiving\n3️⃣ Buyer confirms received\n4️⃣ Admin verifies and completes\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
            .addFields(
              { name: '👤 Buyer', value: `${buyer}`, inline: true },
              { name: '💼 Seller', value: `<@${sellerId}>`, inline: true },
              { name: '\u200b', value: '\u200b', inline: true },
              { name: '🎮 Game', value: `\`${item.gameCategory || 'N/A'}\``, inline: true },
              { name: '🛍️ Item', value: `\`${item.name}\``, inline: true },
              { name: '💰 Price', value: `\`${item.price}\``, inline: true },
              { name: '📦 Available Stock', value: `\`${item.stock}\``, inline: false }
            )
            .setFooter({ text: '⚠️ Only the buyer can mark this as done' })
            .setTimestamp();

          await ticketChannel.send({ 
            content: `${buyer} <@${sellerId}>`, 
            embeds: [itemEmbed], 
            components: [row] 
          });

          await interaction.update({ content: `✅ Transaction channel created! <#${ticketChannel.id}>`, components: [] });
        } catch (err) {
          console.error('Shop channel creation error:', err);
          await interaction.reply({ content: '❌ Failed to create transaction channel! Please contact an administrator.', ephemeral: true });
        }
      }
    }
  } catch (error) {
    console.error('Interaction error:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: '❌ Something went wrong! Please try again.', ephemeral: true }).catch(console.error);
    }
  }
});

client.login(process.env.TOKEN);