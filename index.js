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
    adminUsers: Object.fromEntries(adminUsers),
    gamePrices: Object.fromEntries(gamePrices),
    gameList: Object.fromEntries(gameList),
    announcementChannel: Object.fromEntries(announcementChannel),
    ticketCategories: Object.fromEntries(ticketCategories),
    orderChannels: Object.fromEntries(orderChannels),
    doneChannels: Object.fromEntries(doneChannels),
    ticketChannels: Object.fromEntries(ticketChannels),
    webCategories: Object.fromEntries(webCategories),
    ticketOwners: Object.fromEntries(ticketOwners),
    ticketClaims: Object.fromEntries(ticketClaims)
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
    adminUsers: new Map(Object.entries(data.adminUsers || {})),
    gamePrices: new Map(Object.entries(data.gamePrices || {})),
    gameList: new Map(Object.entries(data.gameList || {}).map(([k, v]) => [k, v || []])),
    announcementChannel: new Map(Object.entries(data.announcementChannel || {})),
    ticketCategories: new Map(Object.entries(data.ticketCategories || {})),
    orderChannels: new Map(Object.entries(data.orderChannels || {})),
    doneChannels: new Map(Object.entries(data.doneChannels || {})),
    ticketChannels: new Map(Object.entries(data.ticketChannels || {}).map(([k, v]) => [k, v || []])),
    webCategories: new Map(Object.entries(data.webCategories || {})),
    ticketOwners: new Map(Object.entries(data.ticketOwners || {})),
    ticketClaims: new Map(Object.entries(data.ticketClaims || {}))
  };
}

function getEmptyData() {
  return {
    adminUsers: new Map(),
    gamePrices: new Map(),
    gameList: new Map(),
    announcementChannel: new Map(),
    ticketCategories: new Map(),
    orderChannels: new Map(),
    doneChannels: new Map(),
    ticketChannels: new Map(),
    webCategories: new Map(),
    ticketOwners: new Map(),
    ticketClaims: new Map()
  };
}

// Global data maps
let adminUsers = new Map();
let gamePrices = new Map();
let gameList = new Map();
let announcementChannel = new Map();
let ticketCategories = new Map();
let orderChannels = new Map();
let doneChannels = new Map();
let ticketChannels = new Map();
let webCategories = new Map();
let ticketOwners = new Map();
let ticketClaims = new Map();

// ==================== BOT READY ====================

client.once('ready', async () => {
  console.log(`✅ Bot is online as ${client.user.tag}`);
  const loadedData = await loadData();
  adminUsers = loadedData.adminUsers;
  gamePrices = loadedData.gamePrices;
  gameList = loadedData.gameList;
  announcementChannel = loadedData.announcementChannel;
  ticketCategories = loadedData.ticketCategories;
  orderChannels = loadedData.orderChannels;
  doneChannels = loadedData.doneChannels;
  ticketChannels = loadedData.ticketChannels;
  webCategories = loadedData.webCategories;
  ticketOwners = loadedData.ticketOwners;
  ticketClaims = loadedData.ticketClaims || new Map();
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
      ticketClaims.delete(ticketId);
      cleaned = true;
      console.log(`🗑️ Removed orphaned ticket ${ticketId}`);
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
    await saveData();
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
    await saveData();
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

  // ========== CONFIGURATION ==========

  if (command === 'conannounce') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ Admin only!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const channelId = args[0];
    if (!channelId) return message.reply('Usage: `!conannounce CHANNEL_ID`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const channel = message.guild.channels.cache.get(channelId);
    if (!channel || channel.type !== ChannelType.GuildText) return message.reply('❌ Invalid channel!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    announcementChannel.set(message.guild.id, channelId);
    await saveData();
    message.reply(`✅ Announcement channel set to: <#${channelId}>`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    message.delete().catch(() => {});
  }

  if (command === 'concategory') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ Admin only!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const categoryId = args[0];
    if (!categoryId) return message.reply('Usage: `!concategory CATEGORY_ID`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const category = message.guild.channels.cache.get(categoryId);
    if (!category || category.type !== ChannelType.GuildCategory) return message.reply('❌ Invalid category!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    ticketCategories.set(message.guild.id, categoryId);
    await saveData();
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
    await saveData();
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
    await saveData();
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
    await saveData();
    message.reply(`✅ Done log set to: <#${channelId}>`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    message.delete().catch(() => {});
  }

  // ========== ADD GAME ==========

  if (command === 'addgame') {
    if (!canUseCommands) return message.reply('❌ You don\'t have permission!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const gameName = args.join(' ');
    if (!gameName) return message.reply('Usage: `!addgame Game Name`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));

    const guildGames = gameList.get(message.guild.id) || [];
    if (guildGames.includes(gameName)) return message.reply('❌ This game already exists!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));

    guildGames.push(gameName);
    gameList.set(message.guild.id, guildGames);
    await saveData();

    message.reply(`✅ Added game: **${gameName}**`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    message.delete().catch(() => {});
  }

  // ========== REMOVE GAME ==========

  if (command === 'removegame') {
    if (!canUseCommands) return message.reply('❌ You don\'t have permission!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const gameName = args.join(' ');
    if (!gameName) return message.reply('Usage: `!removegame Game Name`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));

    const guildGames = gameList.get(message.guild.id) || [];
    const index = guildGames.indexOf(gameName);
    if (index === -1) return message.reply('❌ This game does not exist!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));

    guildGames.splice(index, 1);
    gameList.set(message.guild.id, guildGames);
    await saveData();

    message.reply(`✅ Removed game: **${gameName}**`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    message.delete().catch(() => {});
  }

  // ========== LIST GAMES ==========

  if (command === 'listgames') {
    const guildGames = gameList.get(message.guild.id) || [];
    if (guildGames.length === 0) return message.reply('📋 No games added yet! Use `!addgame Game Name` to add one.').then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));

    let gamesList = '📋 **Available Games:**\n\n';
    guildGames.forEach((game, index) => {
      gamesList += `${index + 1}. ${game}\n`;
    });

    message.reply(gamesList).then(msg => setTimeout(() => msg.delete().catch(() => {}), 30000));
    message.delete().catch(() => {});
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

      permissionOverwrites.push({ 
        id: message.guild.id, 
        deny: [PermissionFlagsBits.ViewChannel] 
      });

      permissionOverwrites.push({ 
        id: client.user.id, 
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageWebhooks] 
      });

      if (ticketOwner) {
        permissionOverwrites.push({ 
          id: ticketOwner.id, 
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] 
        });
      }

      try {
        await message.guild.members.fetch(OWNER_ID);
        permissionOverwrites.push({ 
          id: OWNER_ID, 
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] 
        });
      } catch (err) {
        console.log('⚠️ Owner not in guild, skipping owner permissions');
      }

      const admins = adminUsers.get(message.guild.id) || [];
      for (const adminId of admins) {
        try {
          await message.guild.members.fetch(adminId);
          permissionOverwrites.push({ 
            id: adminId, 
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] 
          });
        } catch (err) {
          console.log(`⚠️ Admin ${adminId} not in guild, skipping`);
        }
      }

      const staffRole = message.guild.roles.cache.find(r => 
        r.name.toLowerCase().includes('staff') || 
        r.name.toLowerCase().includes('admin') || 
        r.name.toLowerCase().includes('mod')
      );

      if (staffRole) {
        permissionOverwrites.push({ 
          id: staffRole.id, 
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] 
        });
      }

      const webCategoryId = webCategories.get(message.guild.id);

      const newChannel = await message.guild.channels.create({ 
        name: channelName, 
        type: ChannelType.GuildText, 
        parent: webCategoryId || null, 
        permissionOverwrites: permissionOverwrites 
      });

      if (message.channel.name.startsWith('ticket-')) {
        const ticketId = message.channel.id;
        if (!ticketChannels.has(ticketId)) ticketChannels.set(ticketId, []);
        ticketChannels.get(ticketId).push(newChannel.id);
        await saveData();
      }

      try {
        const webhook = await newChannel.createWebhook({ 
          name: `${channelName}-webhook`, 
          reason: `Created by ${message.author.tag}` 
        });
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

  // ========== PUBLIC PANEL ==========

  if (command === 'panel') {
    const guildGames = gameList.get(message.guild.id) || [];

    if (guildGames.length === 0) {
      return message.reply('❌ No games added yet! Admins need to use `!addgame Game Name` first.').then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    }

    const embed = new EmbedBuilder()
      .setColor('#00FFFF')
      .setTitle('🎮 Game Panel - View Prices & Create Tickets')
      .setDescription('**Welcome to our game service!**\n\nSelect a game below to view current prices and create a ticket.')
      .addFields(
        { name: '📋 Available Games', value: guildGames.join('\n') || 'No games yet', inline: false },
        { name: '✨ How It Works', value: '1️⃣ Click "View Games" button\n2️⃣ Select your game\n3️⃣ See current prices\n4️⃣ Click "Create Ticket" to order', inline: false }
      )
      .setFooter({ text: 'Select a game to get started!' })
      .setTimestamp();

    const button = new ButtonBuilder()
      .setCustomId('view_games')
      .setLabel('View Games')
      .setEmoji('🎮')
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

  // ========== ADMIN PANEL ==========

  if (command === 'adminpanel') {
    if (!canUseCommands) return message.reply('❌ You don\'t have permission!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));

    const guildGames = gameList.get(message.guild.id) || [];

    if (guildGames.length === 0) {
      return message.reply('❌ No games added yet! Use `!addgame Game Name` to add games first.').then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    }

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🎮 Admin Panel - Price Management')
      .setDescription('**Manage game prices and announcements**\n\nClick the button below to edit prices for any game.')
      .addFields(
        { name: '📋 Available Games', value: guildGames.join('\n') || 'No games yet', inline: false },
        { name: '✨ Features', value: '✅ Edit prices for any game\n✅ Auto-save changes\n✅ Announcement system\n✅ Change log tracking', inline: false }
      )
      .setFooter({ text: 'Admin Panel System' })
      .setTimestamp();

    const button = new ButtonBuilder()
      .setCustomId('edit_prices')
      .setLabel('Edit Prices')
      .setEmoji('💰')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

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
      .setTitle('🎮 Admin Panel Bot - Complete Guide')
      .setDescription('**Complete setup and usage guide**')
      .addFields(
        { name: '⚙️ Setup (Admin Only)', value: '**Step 1:** `!addgame Game Name` - Add games\n**Step 2:** `!conannounce CHANNEL_ID` - Set announcement channel\n**Step 3:** `!concategory CATEGORY_ID` - Set ticket category\n**Step 4:** `!adminpanel` - Create admin panel', inline: false },
        { name: '🎮 Game Management', value: '`!addgame <name>` - Add a game\n`!removegame <name>` - Remove a game\n`!listgames` - List all games', inline: false },
        { name: '💰 How to Edit Prices', value: '**1.** Click "Edit Prices" button\n**2.** Select a game from dropdown\n**3.** Click "Create Ticket" to see prices\n**4.** Modal opens to edit prices\n**5.** Submit and announcement is posted!', inline: false },
        { name: '📝 Example Price Format', value: '```\nDio = 250\nGoku = 300\nVegeta = 350\nBroly = 400\n```', inline: false },
        { name: '🎫 Ticket Commands', value: '`!done` - Mark ticket as done\n`!createweb <name>` - Create webhook channel', inline: false },
        { name: '⚙️ Configuration (Admin)', value: '`!concategory <id>` - Ticket category\n`!conweb <id>` - Webhook category\n`!conorders <id>` - Orders log\n`!condone <id>` - Done log', inline: false },
        { name: '👑 Admin Management (Owner)', value: '`!admadm <id>` - Add admin\n`!admrem <id>` - Remove admin\n`!admlist` - List admins', inline: false }
      )
      .setFooter({ text: 'Made with ❤️ | Admin Panel Bot' })
      .setTimestamp();
    message.reply({ embeds: [helpEmbed] }).then(msg => setTimeout(() => msg.delete().catch(() => {}), 60000));
    message.delete().catch(() => {});
  }
});

// ==================== BUTTON & SELECT MENU INTERACTIONS ====================

client.on('interactionCreate', async (interaction) => {

  // ========== VIEW GAMES BUTTON (PUBLIC PANEL) ==========

  if (interaction.isButton() && interaction.customId === 'view_games') {
    const guildGames = gameList.get(interaction.guild.id) || [];

    if (guildGames.length === 0) {
      return interaction.reply({ content: '❌ No games available yet!', ephemeral: true });
    }

    // Create game selection dropdown (max 25 options)
    const gameOptions = guildGames.slice(0, 25).map(game => ({
      label: game,
      value: `public_${game}`,
      emoji: '🎮'
    }));

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select_game_public')
      .setPlaceholder('Select a game to view prices')
      .addOptions(gameOptions);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
      content: '**Select a game to view prices and create a ticket:**',
      components: [row],
      ephemeral: true
    });
  }

  // ========== PUBLIC GAME SELECTION ==========

  if (interaction.isStringSelectMenu() && interaction.customId === 'select_game_public') {
    const selectedGame = interaction.values[0].replace('public_', '');
    const guildId = interaction.guild.id;

    // Get current prices for this game
    const currentPrices = gamePrices.get(`${guildId}_${selectedGame}`) || 'No prices set yet!';

    const embed = new EmbedBuilder()
      .setColor('#00FFFF')
      .setTitle(`💰 ${selectedGame} - Current Prices`)
      .setDescription('```\n' + currentPrices + '\n```')
      .setFooter({ text: 'Click below to create a ticket' })
      .setTimestamp();

    const createTicketButton = new ButtonBuilder()
      .setCustomId(`create_ticket_${selectedGame}`)
      .setLabel('Create Ticket')
      .setEmoji('🎫')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(createTicketButton);

    await interaction.update({
      content: '',
      embeds: [embed],
      components: [row]
    });
  }

  // ========== EDIT PRICES BUTTON ==========

  if (interaction.isButton() && interaction.customId === 'edit_prices') {
    const isOwner = interaction.user.id === OWNER_ID;
    const admins = adminUsers.get(interaction.guild.id) || [];
    const isAdmin = admins.includes(interaction.user.id);

    if (!isOwner && !isAdmin) {
      return interaction.reply({ content: '❌ Only admins can edit prices!', ephemeral: true });
    }

    const guildGames = gameList.get(interaction.guild.id) || [];

    if (guildGames.length === 0) {
      return interaction.reply({ content: '❌ No games added yet!', ephemeral: true });
    }

    // Create game selection dropdown (max 25 options)
    const gameOptions = guildGames.slice(0, 25).map(game => ({
      label: game,
      value: game,
      emoji: '🎮'
    }));

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select_game')
      .setPlaceholder('Select a game to view/edit prices')
      .addOptions(gameOptions);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
      content: '**Select a game to view/edit prices:**',
      components: [row],
      ephemeral: true
    });
  }

  // ========== GAME SELECTION - SHOW PRICES & CREATE TICKET BUTTON ==========

  if (interaction.isStringSelectMenu() && interaction.customId === 'select_game') {
    const selectedGame = interaction.values[0];
    const guildId = interaction.guild.id;

    // Get current prices for this game
    const currentPrices = gamePrices.get(`${guildId}_${selectedGame}`) || 'No prices set yet!';

    const embed = new EmbedBuilder()
      .setColor('#00FFFF')
      .setTitle(`💰 ${selectedGame} - Current Prices`)
      .setDescription('```\n' + currentPrices + '\n```')
      .setFooter({ text: 'Click below to create a ticket or edit prices' })
      .setTimestamp();

    const createTicketButton = new ButtonBuilder()
      .setCustomId(`create_ticket_${selectedGame}`)
      .setLabel('Create Ticket')
      .setEmoji('🎫')
      .setStyle(ButtonStyle.Primary);

    const editPricesButton = new ButtonBuilder()
      .setCustomId(`edit_price_modal_${selectedGame}`)
      .setLabel('Edit Prices')
      .setEmoji('✏️')
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(createTicketButton, editPricesButton);

    await interaction.update({
      content: '',
      embeds: [embed],
      components: [row]
    });
  }

  // ========== CREATE TICKET BUTTON ==========

  if (interaction.isButton() && interaction.customId.startsWith('create_ticket_')) {
    const gameName = interaction.customId.replace('create_ticket_', '');
    const categoryId = ticketCategories.get(interaction.guild.id);

    if (!categoryId) return interaction.reply({ content: '❌ Ticket category not set! Use `!concategory CATEGORY_ID`', ephemeral: true });

    const category = interaction.guild.channels.cache.get(categoryId);
    if (!category) return interaction.reply({ content: '❌ Category not found!', ephemeral: true });

    const existingTicket = interaction.guild.channels.cache.find(ch => 
      ch.name === `ticket-${interaction.user.username.toLowerCase()}` && 
      ch.parentId === categoryId
    );

    if (existingTicket) return interaction.reply({ content: `❌ You already have a ticket: <#${existingTicket.id}>`, ephemeral: true });

    await interaction.deferReply({ ephemeral: true });

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

      const staffRole = interaction.guild.roles.cache.find(r => 
        r.name.toLowerCase().includes('staff') || 
        r.name.toLowerCase().includes('admin') || 
        r.name.toLowerCase().includes('mod')
      );

      if (staffRole) {
        await ticketChannel.permissionOverwrites.create(staffRole, { 
          ViewChannel: true, 
          SendMessages: true, 
          ReadMessageHistory: true 
        });
      }

      // Add owner and admin permissions
      try {
        await interaction.guild.members.fetch(OWNER_ID);
        await ticketChannel.permissionOverwrites.create(OWNER_ID, { 
          ViewChannel: true, 
          SendMessages: true, 
          ReadMessageHistory: true 
        });
      } catch (err) {
        console.log('⚠️ Owner not in guild');
      }

      const admins = adminUsers.get(interaction.guild.id) || [];
      for (const adminId of admins) {
        try {
          await interaction.guild.members.fetch(adminId);
          await ticketChannel.permissionOverwrites.create(adminId, { 
            ViewChannel: true, 
            SendMessages: true, 
            ReadMessageHistory: true 
          });
        } catch (err) {
          console.log(`⚠️ Admin ${adminId} not in guild`);
        }
      }

      const claimButton = new ButtonBuilder()
        .setCustomId('claim_ticket')
        .setLabel('Claim Ticket')
        .setEmoji('🎯')
        .setStyle(ButtonStyle.Primary);

      const doneButton = new ButtonBuilder()
        .setCustomId('done_ticket')
        .setLabel('Done')
        .setEmoji('✅')
        .setStyle(ButtonStyle.Success);

      const closeButton = new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('Close')
        .setEmoji('🔒')
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(claimButton, doneButton, closeButton);

      const currentPrices = gamePrices.get(`${interaction.guild.id}_${gameName}`) || 'No prices set yet!';

      await ticketChannel.send({ 
        content: `@everyone\n\n🎫 **Ticket by ${interaction.user}**\n\n**Game:** ${gameName}\n\n**Current Prices:**\n\`\`\`\n${currentPrices}\n\`\`\``, 
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
            .setAuthor({ name: '📦 New Order!', iconURL: interaction.guild.iconURL() })
            .setTitle(`Order from ${interaction.user.tag}`)
            .setDescription(`🎉 **New order placed!**\n\n**Game:** ${gameName}\n\n**Prices:**\n\`\`\`\n${currentPrices}\n\`\`\``)
            .addFields(
              { name: '👤 Customer', value: `${interaction.user}`, inline: true },
              { name: '⏰ Ordered', value: `<t:${orderTimestamp}:F>`, inline: false }
            )
            .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
            .setTimestamp();
          await orderChannel.send({ embeds: [orderEmbed] });
        }
      }

      await interaction.editReply({ content: `✅ Ticket created! <#${ticketChannel.id}>` });
    } catch (err) {
      console.error('Ticket Creation Error:', err);
      await interaction.editReply({ content: '❌ Failed to create ticket!' });
    }
  }

  // ========== EDIT PRICE MODAL BUTTON ==========

  if (interaction.isButton() && interaction.customId.startsWith('edit_price_modal_')) {
    const isOwner = interaction.user.id === OWNER_ID;
    const admins = adminUsers.get(interaction.guild.id) || [];
    const isAdmin = admins.includes(interaction.user.id);

    if (!isOwner && !isAdmin) {
      return interaction.reply({ content: '❌ Only admins can edit prices!', ephemeral: true });
    }

    const gameName = interaction.customId.replace('edit_price_modal_', '');
    const guildId = interaction.guild.id;

    // Get current prices for this game
    const currentPrices = gamePrices.get(`${guildId}_${gameName}`) || '';

    // Create modal with two fields
    const modal = new ModalBuilder()
      .setCustomId(`price_modal_${gameName}`)
      .setTitle(`Edit Prices - ${gameName}`);

    const priceInput = new TextInputBuilder()
      .setCustomId('price_list')
      .setLabel('Price List')
      .setPlaceholder('Dio = 250\nGoku = 300\nVegeta = 350')
      .setStyle(TextInputStyle.Paragraph)
      .setValue(currentPrices)
      .setRequired(true);

    const changeLogInput = new TextInputBuilder()
      .setCustomId('change_log')
      .setLabel('What did you update?')
      .setPlaceholder('Added: Vegeta = 350, Broly = 400\nUpdated: Goku 250 → 300')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const firstRow = new ActionRowBuilder().addComponents(priceInput);
    const secondRow = new ActionRowBuilder().addComponents(changeLogInput);

    modal.addComponents(firstRow, secondRow);

    await interaction.showModal(modal);
  }

  // ========== CLAIM TICKET ==========

  if (interaction.isButton() && interaction.customId === 'claim_ticket') {
    const isOwner = interaction.user.id === OWNER_ID;
    const admins = adminUsers.get(interaction.guild.id) || [];
    const isAdmin = admins.includes(interaction.user.id);

    if (!isOwner && !isAdmin) {
      return interaction.reply({ content: '❌ Only admins can claim tickets!', ephemeral: true });
    }

    const ticketId = interaction.channel.id;
    const alreadyClaimed = ticketClaims.get(ticketId);

    if (alreadyClaimed) {
      return interaction.reply({ content: `❌ This ticket has already been claimed by <@${alreadyClaimed}>!`, ephemeral: true });
    }

    ticketClaims.set(ticketId, interaction.user.id);
    await saveData();

    const claimEmbed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('🎯 Ticket Claimed')
      .setDescription(`**${interaction.user}** has claimed this ticket!`)
      .setTimestamp();

    await interaction.update({ 
      content: `${interaction.user} has claimed this ticket!`, 
      embeds: [claimEmbed],
      components: [] 
    });

    await interaction.channel.send(`🎯 **Admin ${interaction.user} has claimed this ticket and will be assisting you!**`);
  }

  // ========== CLOSE TICKET ==========

  if (interaction.isButton() && interaction.customId === 'close_ticket') {
    if (!interaction.channel.name.startsWith('ticket-')) return interaction.reply({ content: '❌ Not a ticket!', ephemeral: true });
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
      ticketClaims.delete(ticketId);
      await saveData();
      await interaction.channel.delete().catch(console.error);
    }, 5000);
  }

  // ========== DONE TICKET ==========

  if (interaction.isButton() && interaction.customId === 'done_ticket') {
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

  if (interaction.isButton() && interaction.customId === 'owner_done_confirmation') {
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

  if (interaction.isButton() && interaction.customId === 'owner_cancel_done') {
    if (!interaction.channel.name.startsWith('ticket-')) return interaction.reply({ content: '❌ Not a ticket!', ephemeral: true });
    await interaction.update({ content: `❌ **${interaction.user}** cancelled.\n\nTicket remains open.`, components: [] });
  }

  // ========== CONFIRM DONE ==========

  if (interaction.isButton() && interaction.customId === 'confirm_done') {
    const ticketId = interaction.channel.id;
    const claimedBy = ticketClaims.get(ticketId);

    // Check if ticket was claimed and if the current user is the one who claimed it
    if (claimedBy && claimedBy !== interaction.user.id) {
      return interaction.reply({ content: `❌ Only <@${claimedBy}> (who claimed this ticket) can confirm!`, ephemeral: true });
    }

    // If not claimed, allow any admin
    if (!claimedBy) {
      const isOwner = interaction.user.id === OWNER_ID;
      const admins = adminUsers.get(interaction.guild.id) || [];
      const isAdmin = admins.includes(interaction.user.id);
      if (!isOwner && !isAdmin) return interaction.reply({ content: '❌ Only admins!', ephemeral: true });
    }

    const ticketOwnerName = interaction.channel.name.replace('ticket-', '');
    const ticketOwner = interaction.guild.members.cache.find(m => m.user.username.toLowerCase() === ticketOwnerName.toLowerCase());

    let serviceDescription = 'N/A';
    let gameName = 'Unknown Game';
    try {
      const messages = await interaction.channel.messages.fetch({ limit: 50 });
      const messagesArray = Array.from(messages.values()).reverse();

      for (const msg of messagesArray) {
        if (msg.content && msg.content.includes('**Game:**')) {
          const parts = msg.content.split('**Game:**');
          if (parts.length > 1) {
            gameName = parts[1].split('\n')[0].trim();
          }
        }
        if (msg.content && msg.content.includes('Service Request:')) {
          const parts = msg.content.split('Service Request:');
          if (parts.length > 1) {
            serviceDescription = parts[1].trim().split('\n')[0].trim();
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
          .setDescription(`🎉 **Service successfully delivered and confirmed!**\n\n**Game:** ${gameName}\n\n📦 **Service Details:**\n${serviceDescription}`)
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
      const createdChannels = ticketChannels.get(ticketId) || [];
      for (const channelId of createdChannels) {
        const channelToDelete = interaction.guild.channels.cache.get(channelId);
        if (channelToDelete) await channelToDelete.delete().catch(console.error);
      }
      ticketChannels.delete(ticketId);
      ticketOwners.delete(ticketId);
      ticketClaims.delete(ticketId);
      await saveData();
      await interaction.channel.delete().catch(console.error);
    }, 5000);
  }

  // ========== DENY DONE ==========

  if (interaction.isButton() && interaction.customId === 'deny_done') {
    const ticketId = interaction.channel.id;
    const claimedBy = ticketClaims.get(ticketId);

    // Check if ticket was claimed and if the current user is the one who claimed it
    if (claimedBy && claimedBy !== interaction.user.id) {
      return interaction.reply({ content: `❌ Only <@${claimedBy}> (who claimed this ticket) can deny!`, ephemeral: true });
    }

    // If not claimed, allow any admin
    if (!claimedBy) {
      const isOwner = interaction.user.id === OWNER_ID;
      const admins = adminUsers.get(interaction.guild.id) || [];
      const isAdmin = admins.includes(interaction.user.id);
      if (!isOwner && !isAdmin) return interaction.reply({ content: '❌ Only admins!', ephemeral: true });
    }

    await interaction.update({ content: `❌ **Denied by ${interaction.user}.**\n\nNot complete yet.`, components: [] });
  }

  // ==================== MODAL SUBMISSIONS ====================

  if (interaction.isModalSubmit() && interaction.customId.startsWith('price_modal_')) {
    await interaction.deferReply({ ephemeral: true });

    const gameName = interaction.customId.replace('price_modal_', '');
    const priceList = interaction.fields.getTextInputValue('price_list');
    const changeLog = interaction.fields.getTextInputValue('change_log');
    const guildId = interaction.guild.id;

    // Save the updated prices
    gamePrices.set(`${guildId}_${gameName}`, priceList);
    await saveData();

    // Get announcement channel
    const announceChannelId = announcementChannel.get(guildId);

    if (!announceChannelId) {
      return interaction.editReply({
        content: '❌ Announcement channel not set! Use `!conannounce CHANNEL_ID` first.'
      });
    }

    const announceChannel = interaction.guild.channels.cache.get(announceChannelId);

    if (!announceChannel) {
      return interaction.editReply({
        content: '❌ Announcement channel not found!'
      });
    }

    // Create announcement
    const announcement = `@everyone

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 **Price List Updated**
🎮 **${gameName}**

${interaction.user} has updated the price list!

📋 **What Changed?**
\`\`\`
${changeLog}
\`\`\`

💰 **Updated Price List**
\`\`\`
${priceList}
\`\`\`

Updated by ${interaction.user.tag}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

    try {
      const sentMessage = await announceChannel.send({
        content: announcement,
        allowedMentions: { parse: ['everyone'] }
      });

      await sentMessage.react('💰');
      await sentMessage.react('✅');

      await interaction.editReply({
        content: `✅ **Price list updated successfully!**\n\n🎮 Game: **${gameName}**\n📢 Announcement posted in <#${announceChannelId}>`
      });
    } catch (err) {
      console.error('Error posting announcement:', err);
      await interaction.editReply({
        content: '❌ Failed to post announcement! Check bot permissions.'
      });
    }
  }
});

// ==================== BOT LOGIN ====================

client.login(process.env.TOKEN);