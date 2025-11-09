// ==================== MODAL SUBMISSIONS ====================

  if (interaction.isModalSubmit()) {

    // ========== ADMIN PRICE MODAL ==========

    if (interaction.customId.startsWith('admin_price_modal_')) {
      await interaction.deferReply({ ephemeral: true });

      const gameName = interaction.customId.replace('admin_price_modal_', '');
      const newPriceList = interaction.fields.getTextInputValue('price_list');
      const changeLog = interaction.fields.getTextInputValue('change_log');

      // Get old prices
      const guildPrices = gamePrices.get(interaction.guild.id) || new Map();
      const oldPrices = guildPrices.get(gameName) || '';

      // Save new prices
      guildPrices.set(gameName, newPriceList);
      gamePrices.set(interaction.guild.id, guildPrices);
      await saveData();

      await interaction.editReply({ content: `✅ Updated prices for **${gameName}**!` });

      // Announce update in update channel
      const updateChannelId = updateChannels.get(interaction.guild.id);
      if (updateChannelId) {
        const updateChannel = interaction.guild.channels.cache.get(updateChannelId);
        if (updateChannel) {
          // Determine change type
          let changeType = '';
          let changeEmoji = '';

          if (!oldPrices || oldPrices.trim() === '') {
            changeType = 'New Price List Added';
            changeEmoji = '🆕';
          } else {
            changeType = 'Price List Updated';
            changeEmoji = '📝';
          }

          const updateEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setAuthor({ name: `${changeEmoji} ${changeType}`, iconURL: interaction.user.displayAvatarURL() })
            .setTitle(`🎮 ${gameName}`)
            .setDescription(`${interaction.user} has updated the price list!`)
            .addFields(
              { name: '📋 What Changed?', value: `\`\`\`\n${changeLog}\n\`\`\``, inline: false },
              { name: '💰 Updated Price List', value: `\`\`\`\n${newPriceList}\n\`\`\``, inline: false }
            )
            .setFooter({ text: `Updated by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

          try {
            const sentMessage = await updateChannel.send({ 
              content: '@everyone', 
              embeds: [updateEmbed], 
              allowedMentions: { parse: ['everyone'] } 
            });
            await sentMessage.react('💰');
            await sentMessage.react('✅');
          } catch (err) {
            console.error('Error sending update notification:', err);
          }
        }
      }
    }

    // ========== TICKET MODAL ==========// Fix for ReadableStream error in Replit
if (!global.ReadableStream) {
  global.ReadableStream = require('stream/web').ReadableStream;
}

const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
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
    ticketCategories: Object.fromEntries(ticketCategories),
    orderChannels: Object.fromEntries(orderChannels),
    doneChannels: Object.fromEntries(doneChannels),
    adminUsers: Object.fromEntries(adminUsers),
    ticketChannels: Object.fromEntries(ticketChannels),
    webCategories: Object.fromEntries(webCategories),
    ticketOwners: Object.fromEntries(ticketOwners),
    transcriptChannels: Object.fromEntries(transcriptChannels),
    ticketClaims: Object.fromEntries(ticketClaims),
    priceListGames: Object.fromEntries(priceListGames),
    priceListMessages: Object.fromEntries(priceListMessages),
    gamePrices: Object.fromEntries(
      Array.from(gamePrices.entries()).map(([guildId, gameMap]) => [
        guildId,
        Object.fromEntries(gameMap)
      ])
    ),
    updateChannels: Object.fromEntries(updateChannels)
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
    ticketOwners: new Map(Object.entries(data.ticketOwners || {})),
    transcriptChannels: new Map(Object.entries(data.transcriptChannels || {})),
    ticketClaims: new Map(Object.entries(data.ticketClaims || {})),
    priceListGames: new Map(Object.entries(data.priceListGames || {}).map(([k, v]) => [k, v || []])),
    priceListMessages: new Map(Object.entries(data.priceListMessages || {})),
    gamePrices: new Map(Object.entries(data.gamePrices || {}).map(([guildId, gameMap]) => [guildId, new Map(Object.entries(gameMap || {}))])),
    updateChannels: new Map(Object.entries(data.updateChannels || {}))
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
    ticketOwners: new Map(),
    transcriptChannels: new Map(),
    ticketClaims: new Map(),
    priceListGames: new Map(),
    priceListMessages: new Map(),
    gamePrices: new Map(),
    updateChannels: new Map()
  };
}

// Global data maps
let ticketCategories = new Map();
let orderChannels = new Map();
let doneChannels = new Map();
let adminUsers = new Map();
let ticketChannels = new Map();
let webCategories = new Map();
let ticketOwners = new Map();
let transcriptChannels = new Map();
let ticketClaims = new Map();
let priceListGames = new Map();
let priceListMessages = new Map();
let gamePrices = new Map();
let updateChannels = new Map();

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
  ticketOwners = loadedData.ticketOwners;
  transcriptChannels = loadedData.transcriptChannels;
  ticketClaims = loadedData.ticketClaims || new Map();
  priceListGames = loadedData.priceListGames || new Map();
  priceListMessages = loadedData.priceListMessages || new Map();
  gamePrices = loadedData.gamePrices || new Map();
  updateChannels = loadedData.updateChannels || new Map();
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
        saveData();
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

  // ========== ADD TICKET COMMAND ==========

  if (command === 'addticket') {
    if (!message.channel.name.startsWith('ticket-')) return message.reply('❌ Only in tickets!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));

    const isOwner = message.author.id === OWNER_ID;
    const admins = adminUsers.get(message.guild.id) || [];
    const isAdmin = admins.includes(message.author.id);

    if (!isOwner && !isAdmin) {
      return message.reply('❌ Only admins can use this command!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }

    const ticketOwnerName = message.channel.name.replace('ticket-', '');
    const ticketOwner = message.guild.members.cache.find(m => m.user.username.toLowerCase() === ticketOwnerName.toLowerCase());

    if (!ticketOwner) {
      return message.reply('❌ Ticket owner not found!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }

    const categoryId = ticketCategories.get(message.guild.id);
    if (!categoryId) {
      return message.reply('❌ Ticket category not configured!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }

    // Count existing tickets for this user
    const existingTickets = message.guild.channels.cache.filter(ch => 
      ch.name.startsWith(`ticket-${ticketOwnerName.toLowerCase()}`) && 
      ch.parentId === categoryId
    );

    const ticketNumber = existingTickets.size + 1;
    const newTicketName = `ticket-${ticketOwnerName.toLowerCase()}-${ticketNumber}`;

    try {
      const newTicketChannel = await message.guild.channels.create({
        name: newTicketName,
        type: ChannelType.GuildText,
        parent: categoryId,
        permissionOverwrites: [
          { id: message.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
          { id: ticketOwner.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
          { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
        ],
      });

      const staffRole = message.guild.roles.cache.find(r => 
        r.name.toLowerCase().includes('staff') || 
        r.name.toLowerCase().includes('admin') || 
        r.name.toLowerCase().includes('mod')
      );

      if (staffRole) {
        await newTicketChannel.permissionOverwrites.create(staffRole, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
      }

      // Add owner permissions
      try {
        await message.guild.members.fetch(OWNER_ID);
        await newTicketChannel.permissionOverwrites.create(OWNER_ID, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
      } catch (err) {
        console.log('⚠️ Owner not in guild');
      }

      // Add admin permissions
      const guildAdmins = adminUsers.get(message.guild.id) || [];
      for (const adminId of guildAdmins) {
        try {
          await message.guild.members.fetch(adminId);
          await newTicketChannel.permissionOverwrites.create(adminId, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
        } catch (err) {
          console.log(`⚠️ Admin ${adminId} not in guild`);
        }
      }

      const claimButton = new ButtonBuilder().setCustomId('claim_ticket').setLabel('Claim Ticket').setEmoji('🎯').setStyle(ButtonStyle.Primary);
      const doneButton = new ButtonBuilder().setCustomId('done_ticket').setLabel('Done').setEmoji('✅').setStyle(ButtonStyle.Success);
      const closeButton = new ButtonBuilder().setCustomId('close_ticket').setLabel('Close').setEmoji('🔒').setStyle(ButtonStyle.Danger);
      const row = new ActionRowBuilder().addComponents(claimButton, doneButton, closeButton);

      await newTicketChannel.send({ 
        content: `${ticketOwner.user}\n\n🎫 **Additional Ticket #${ticketNumber}**\n\n**Created by:** ${message.author}\n**For:** ${ticketOwner.user.tag}\n\nThis is an additional ticket for the same user.`, 
        components: [row] 
      });

      ticketOwners.set(newTicketChannel.id, ticketOwner.id);
      await saveData();

      message.reply(`✅ Created additional ticket: <#${newTicketChannel.id}>`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
      message.delete().catch(() => {});

      // Notify in order channel if configured
      const orderChannelId = orderChannels.get(message.guild.id);
      if (orderChannelId) {
        const orderChannel = message.guild.channels.cache.get(orderChannelId);
        if (orderChannel) {
          const orderTimestamp = Math.floor(Date.now() / 1000);
          const orderEmbed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setAuthor({ name: '➕ Additional Ticket Created', iconURL: message.guild.iconURL() })
            .setTitle(`Ticket #${ticketNumber} for ${ticketOwner.user.tag}`)
            .setDescription(`🎉 **New additional ticket created!**\n\n**Customer:** ${ticketOwner.user}\n**Created by:** ${message.author}`)
            .addFields(
              { name: '👤 Customer', value: `${ticketOwner.user}`, inline: true },
              { name: '⏰ Created', value: `<t:${orderTimestamp}:F>`, inline: false }
            )
            .setThumbnail(ticketOwner.user.displayAvatarURL({ size: 256 }))
            .setTimestamp();
          await orderChannel.send({ embeds: [orderEmbed] });
        }
      }
    } catch (err) {
      console.error('AddTicket Error:', err);
      message.reply('❌ Failed to create additional ticket!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }
  }

  // ========== PING UPDATE CHANNEL ==========

  if (command === 'pingupdate') {
    if (!canUseCommands) return message.reply('❌ You don\'t have permission!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const channelId = args[0];
    if (!channelId) return message.reply('Usage: `!pingupdate CHANNEL_ID`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const channel = message.guild.channels.cache.get(channelId);
    if (!channel || channel.type !== ChannelType.GuildText) return message.reply('❌ Invalid channel!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    updateChannels.set(message.guild.id, channelId);
    await saveData();
    message.reply(`✅ Update notification channel set to: <#${channelId}>`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    message.delete().catch(() => {});
  }

  // ========== ADMIN PANEL ==========

  if (command === 'adminpanel') {
    if (!canUseCommands) return message.reply('❌ You don\'t have permission!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));

    const embed = new EmbedBuilder()
      .setColor('#FF6B35')
      .setAuthor({ name: 'Admin Price List Panel', iconURL: message.guild.iconURL() })
      .setTitle('🔧 Admin Controls')
      .setDescription('Click "Edit Prices" to manage game prices.')
      .setThumbnail(message.guild.iconURL())
      .setFooter({ text: 'Admin Panel' })
      .setTimestamp();

    const editButton = new ButtonBuilder()
      .setCustomId('admin_edit_prices')
      .setLabel('Edit Prices')
      .setEmoji('✏️')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(editButton);

    try {
      await message.delete();
      await message.channel.send({ embeds: [embed], components: [row] });
    } catch (err) {
      console.error(err);
      message.reply('❌ Failed!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }
  }

  // ========== PRICE LIST PANEL ==========

  if (command === 'pricelist') {
    if (!canUseCommands) return message.reply('❌ You don\'t have permission!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setAuthor({ name: 'Price List', iconURL: message.guild.iconURL() })
      .setTitle('🎮 Select a Game')
      .setDescription('Click a button below to view prices for that game.')
      .setThumbnail(message.guild.iconURL())
      .setFooter({ text: 'Price List System' })
      .setTimestamp();

    const guildGames = priceListGames.get(message.guild.id) || [];

    if (guildGames.length === 0) {
      return message.reply('❌ No games added yet! Use `!addlist Game Name` to add one.').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }

    // Create buttons for each game (max 5 per row, max 25 total)
    const rows = [];
    let currentRow = new ActionRowBuilder();
    let buttonCount = 0;

    for (const game of guildGames.slice(0, 25)) {
      const button = new ButtonBuilder()
        .setCustomId(`pricelist_${game}`)
        .setLabel(game)
        .setStyle(ButtonStyle.Primary);

      currentRow.addComponents(button);
      buttonCount++;

      if (buttonCount % 5 === 0) {
        rows.push(currentRow);
        currentRow = new ActionRowBuilder();
      }
    }

    if (currentRow.components.length > 0) {
      rows.push(currentRow);
    }

    try {
      await message.delete();
      const sentMessage = await message.channel.send({ embeds: [embed], components: rows });

      // Store the message ID so we can update it later
      priceListMessages.set(message.guild.id, {
        channelId: message.channel.id,
        messageId: sentMessage.id
      });
      await saveData();
    } catch (err) {
      console.error(err);
      message.reply('❌ Failed!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }
  }

  // ========== ADD LIST COMMAND ==========

  if (command === 'addlist') {
    if (!canUseCommands) return message.reply('❌ You don\'t have permission!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const gameName = args.join(' ');
    if (!gameName) return message.reply('Usage: `!addlist Game Name`\nExample: `!addlist Anime Vanguard`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));

    const guildGames = priceListGames.get(message.guild.id) || [];
    if (guildGames.includes(gameName)) {
      return message.reply(`❌ **${gameName}** already exists!`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }

    if (guildGames.length >= 25) {
      return message.reply('❌ Maximum 25 games allowed!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }

    guildGames.push(gameName);
    priceListGames.set(message.guild.id, guildGames);
    await saveData();

    message.reply(`✅ Added game: **${gameName}**`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    message.delete().catch(() => {});

    // Update the price list panel if it exists
    await updatePriceListPanel(message.guild.id);
  }

  // ========== REMOVE LIST COMMAND ==========

  if (command === 'removelist') {
    if (!canUseCommands) return message.reply('❌ You don\'t have permission!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    const gameName = args.join(' ');
    if (!gameName) return message.reply('Usage: `!removelist Game Name`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));

    const guildGames = priceListGames.get(message.guild.id) || [];
    const index = guildGames.indexOf(gameName);
    if (index === -1) {
      return message.reply(`❌ **${gameName}** not found!`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }

    guildGames.splice(index, 1);
    priceListGames.set(message.guild.id, guildGames);
    await saveData();

    message.reply(`✅ Removed game: **${gameName}**`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    message.delete().catch(() => {});

    // Update the price list panel if it exists
    await updatePriceListPanel(message.guild.id);
  }

  // ========== LIST GAMES COMMAND ==========

  if (command === 'listgames') {
    const guildGames = priceListGames.get(message.guild.id) || [];
    if (guildGames.length === 0) {
      return message.reply('📋 No games yet! Use `!addlist Game Name` to add one.').then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
    }

    let gameList = '🎮 **Price List Games:**\n\n';
    guildGames.forEach((game, index) => {
      gameList += `${index + 1}. ${game}\n`;
    });
    message.reply(gameList).then(msg => setTimeout(() => msg.delete().catch(() => {}), 30000));
    message.delete().catch(() => {});
  }

  // ========== TICKET PANEL (REMOVED) ==========

  // Removed !ticket command - use !pricelist instead

  // ========== HELP COMMAND ==========

  if (command === 'help') {
    const helpEmbed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🎨 Bot Commands - Complete Guide')
      .setDescription('**All available commands and features**')
      .addFields(
        { name: '📝 Embed Commands', value: '`!embed <msg>` - Basic embed\n`!auto <msg>` - Auto-styled embed\n`!fancy <title>\\n<msg>` - Fancy embed\n`!announce <msg>` - Announcement\n`!quote <msg>` - Quote style\n`!colorembed #HEX <msg>` - Custom color\n`!success <msg>` - Success message\n`!error <msg>` - Error message\n`!info <msg>` - Info message', inline: false },
        { name: '🎫 Ticket System', value: '`!ticket <title>\\n<desc>` - Create ticket panel\n`!done` - Mark ticket as done\n`!createweb <name>` - Create webhook channel', inline: false },
        { name: '⚙️ Configuration (Admin Only)', value: '`!concategory <id>` - Set ticket category\n`!conweb <id>` - Set webhook category\n`!conorders <id>` - Set orders log\n`!condone <id>` - Set done log\n`!contranscript <id>` - Set transcript log', inline: false },
        { name: '👑 Admin Management (Owner Only)', value: '`!admadm <user_id>` - Add admin\n`!admrem <user_id>` - Remove admin\n`!admlist` - List all admins', inline: false },
        { name: '✨ Features', value: '✅ Anti-duplicate tickets\n✅ Ticket claim system\n✅ Admin-only confirmation\n✅ Auto message cleanup\n✅ Webhook integration\n✅ Transcript logging', inline: false }
      )
      .setFooter({ text: 'Made with ❤️ | Ticket Bot' })
      .setTimestamp();
    message.reply({ embeds: [helpEmbed] }).then(msg => setTimeout(() => msg.delete().catch(() => {}), 60000));
    message.delete().catch(() => {});
  }
});

// ==================== UPDATE PRICE LIST PANEL ====================

async function updatePriceListPanel(guildId) {
  const panelData = priceListMessages.get(guildId);
  if (!panelData) return;

  const guild = client.guilds.cache.get(guildId);
  if (!guild) return;

  const channel = guild.channels.cache.get(panelData.channelId);
  if (!channel) return;

  try {
    const message = await channel.messages.fetch(panelData.messageId);
    if (!message) return;

    const guildGames = priceListGames.get(guildId) || [];

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setAuthor({ name: 'Price List', iconURL: guild.iconURL() })
      .setTitle('🎮 Select a Game')
      .setDescription('Click a button below to view prices for that game.')
      .setThumbnail(guild.iconURL())
      .setFooter({ text: 'Price List System' })
      .setTimestamp();

    const rows = [];
    let currentRow = new ActionRowBuilder();
    let buttonCount = 0;

    for (const game of guildGames.slice(0, 25)) {
      const button = new ButtonBuilder()
        .setCustomId(`pricelist_${game}`)
        .setLabel(game)
        .setStyle(ButtonStyle.Primary);

      currentRow.addComponents(button);
      buttonCount++;

      if (buttonCount % 5 === 0) {
        rows.push(currentRow);
        currentRow = new ActionRowBuilder();
      }
    }

    if (currentRow.components.length > 0) {
      rows.push(currentRow);
    }

    await message.edit({ embeds: [embed], components: rows });
    console.log('✅ Price list panel updated');
  } catch (err) {
    console.error('Error updating price list panel:', err);
  }
}

// ==================== BUTTON INTERACTIONS ====================

client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton()) {

    // ========== ADMIN EDIT PRICES ==========

    if (interaction.customId === 'admin_edit_prices') {
      const isOwner = interaction.user.id === OWNER_ID;
      const admins = adminUsers.get(interaction.guild.id) || [];
      const isAdmin = admins.includes(interaction.user.id);

      if (!isOwner && !isAdmin) {
        return interaction.reply({ content: '❌ Only admins can use this!', ephemeral: true });
      }

      const guildGames = priceListGames.get(interaction.guild.id) || [];

      if (guildGames.length === 0) {
        return interaction.reply({ content: '❌ No games added yet! Use `!addlist Game Name` to add one.', ephemeral: true });
      }

      const rows = [];
      let currentRow = new ActionRowBuilder();
      let buttonCount = 0;

      for (const game of guildGames.slice(0, 25)) {
        const button = new ButtonBuilder()
          .setCustomId(`admin_edit_game_${game}`)
          .setLabel(game)
          .setStyle(ButtonStyle.Secondary);

        currentRow.addComponents(button);
        buttonCount++;

        if (buttonCount % 5 === 0) {
          rows.push(currentRow);
          currentRow = new ActionRowBuilder();
        }
      }

      if (currentRow.components.length > 0) {
        rows.push(currentRow);
      }

      await interaction.reply({ 
        content: '📝 **Select a game to edit prices:**', 
        components: rows, 
        ephemeral: true 
      });
    }

    // ========== ADMIN EDIT SPECIFIC GAME ==========

    if (interaction.customId.startsWith('admin_edit_game_')) {
      const gameName = interaction.customId.replace('admin_edit_game_', '');

      const modal = new ModalBuilder()
        .setCustomId(`admin_price_modal_${gameName}`)
        .setTitle(`Edit ${gameName} Prices`);

      const priceInput = new TextInputBuilder()
        .setCustomId('price_list')
        .setLabel('Price List (one per line: Item = Price)')
        .setPlaceholder('Dio = 250\nGoku = 300\nVegeta = 350')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      const changeLogInput = new TextInputBuilder()
        .setCustomId('change_log')
        .setLabel('What did you update?')
        .setPlaceholder('Added: Dio = 250\nRemoved: Old Item\nUpdated: Goku price from 250 to 300')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      // Get current prices if they exist
      const guildPrices = gamePrices.get(interaction.guild.id) || new Map();
      const currentPrices = guildPrices.get(gameName) || '';

      if (currentPrices) {
        priceInput.setValue(currentPrices);
      }

      const actionRow1 = new ActionRowBuilder().addComponents(priceInput);
      const actionRow2 = new ActionRowBuilder().addComponents(changeLogInput);
      modal.addComponents(actionRow1, actionRow2);

      await interaction.showModal(modal);
    }

    // ========== PRICE LIST BUTTON (USER SIDE) ==========

    if (interaction.customId.startsWith('pricelist_')) {
      const gameName = interaction.customId.replace('pricelist_', '');

      // Get prices for this game
      const guildPrices = gamePrices.get(interaction.guild.id) || new Map();
      const prices = guildPrices.get(gameName);

      // Check for existing ticket
      const categoryId = ticketCategories.get(interaction.guild.id);
      if (!categoryId) return interaction.reply({ content: '❌ Ticket category not configured!', ephemeral: true });

      const category = interaction.guild.channels.cache.get(categoryId);
      if (!category) return interaction.reply({ content: '❌ Category not found!', ephemeral: true });

      const existingTicket = interaction.guild.channels.cache.find(ch => 
        ch.name === `ticket-${interaction.user.username.toLowerCase()}` && 
        ch.parentId === categoryId
      );

      if (existingTicket) return interaction.reply({ content: `❌ You already have a ticket: <#${existingTicket.id}>`, ephemeral: true });

      if (prices && prices.trim()) {
        // Show prices in an embed with "Create Ticket" button
        const priceEmbed = new EmbedBuilder()
          .setColor('#FFD700')
          .setAuthor({ name: gameName, iconURL: interaction.guild.iconURL() })
          .setTitle('💰 Price List')
          .setDescription(`\`\`\`\n${prices}\n\`\`\``)
          .setFooter({ text: 'Click "Create Ticket" below to place your order' })
          .setTimestamp();

        const createTicketButton = new ButtonBuilder()
          .setCustomId(`create_ticket_${gameName}`)
          .setLabel('Create Ticket')
          .setEmoji('🎫')
          .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(createTicketButton);

        await interaction.reply({ embeds: [priceEmbed], components: [row], ephemeral: true });
      } else {
        // No prices set yet, show message
        const noPriceEmbed = new EmbedBuilder()
          .setColor('#FFA500')
          .setAuthor({ name: gameName, iconURL: interaction.guild.iconURL() })
          .setTitle('⚠️ Price List Not Available')
          .setDescription('The price list for this game hasn\'t been set up yet.\n\nYou can still create a ticket to inquire about pricing!')
          .setFooter({ text: 'Click "Create Ticket" below' })
          .setTimestamp();

        const createTicketButton = new ButtonBuilder()
          .setCustomId(`create_ticket_${gameName}`)
          .setLabel('Create Ticket')
          .setEmoji('🎫')
          .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(createTicketButton);

        await interaction.reply({ embeds: [noPriceEmbed], components: [row], ephemeral: true });
      }
    }

    // ========== CREATE TICKET BUTTON ==========

    if (interaction.customId.startsWith('create_ticket_')) {
      const gameName = interaction.customId.replace('create_ticket_', '');

      const categoryId = ticketCategories.get(interaction.guild.id);
      if (!categoryId) return interaction.reply({ content: '❌ Ticket category not configured!', ephemeral: true });

      const category = interaction.guild.channels.cache.get(categoryId);
      if (!category) return interaction.reply({ content: '❌ Category not found!', ephemeral: true });

      const existingTicket = interaction.guild.channels.cache.find(ch => 
        ch.name === `ticket-${interaction.user.username.toLowerCase()}` && 
        ch.parentId === categoryId
      );

      if (existingTicket) return interaction.reply({ content: `❌ You already have a ticket: <#${existingTicket.id}>`, ephemeral: true });

      const modal = new ModalBuilder()
        .setCustomId(`ticket_modal_${gameName}`)
        .setTitle(`${gameName} - Create Ticket`);

      const serviceInput = new TextInputBuilder()
        .setCustomId('service_type')
        .setLabel('What would you like to order?')
        .setPlaceholder('Example: Dio, Goku x2, Vegeta')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      const actionRow = new ActionRowBuilder().addComponents(serviceInput);
      modal.addComponents(actionRow);

      await interaction.showModal(modal);
    }

    // ========== CREATE ORDER BUTTON (REMOVED - REPLACED WITH create_ticket_) ==========

    // ========== CLAIM TICKET ==========

    if (interaction.customId === 'claim_ticket') {
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

    // ========== CLOSE TICKET ==========

    if (interaction.customId === 'close_ticket') {
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

    if (interaction.customId === 'deny_done') {
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
  }

  // ==================== MODAL SUBMISSIONS ====================

  if (interaction.isModalSubmit()) {

    // ========== TICKET MODAL ==========

    if (interaction.customId.startsWith('ticket_modal_')) {
      // Defer the reply immediately to avoid timeout
      await interaction.deferReply({ ephemeral: true });

      const gameName = interaction.customId.replace('ticket_modal_', '');
      const serviceDescription = interaction.fields.getTextInputValue('service_type');
      const categoryId = ticketCategories.get(interaction.guild.id);

      if (!categoryId) {
        return interaction.editReply({ content: '❌ Ticket category not configured!' });
      }

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

        // Add owner and admin permissions
        try {
          await interaction.guild.members.fetch(OWNER_ID);
          await ticketChannel.permissionOverwrites.create(OWNER_ID, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
        } catch (err) {
          console.log('⚠️ Owner not in guild');
        }

        const admins = adminUsers.get(interaction.guild.id) || [];
        for (const adminId of admins) {
          try {
            await interaction.guild.members.fetch(adminId);
            await ticketChannel.permissionOverwrites.create(adminId, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
          } catch (err) {
            console.log(`⚠️ Admin ${adminId} not in guild`);
          }
        }

        const claimButton = new ButtonBuilder().setCustomId('claim_ticket').setLabel('Claim Ticket').setEmoji('🎯').setStyle(ButtonStyle.Primary);
        const doneButton = new ButtonBuilder().setCustomId('done_ticket').setLabel('Done').setEmoji('✅').setStyle(ButtonStyle.Success);
        const closeButton = new ButtonBuilder().setCustomId('close_ticket').setLabel('Close').setEmoji('🔒').setStyle(ButtonStyle.Danger);
        const row = new ActionRowBuilder().addComponents(claimButton, doneButton, closeButton);

        await ticketChannel.send({ 
          content: `@everyone\n\n🎫 **Ticket by ${interaction.user}**\n🎮 **Game:** ${gameName}\n\n**Service Request:**\n${serviceDescription}`, 
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
              .setDescription(`🎉 **New order placed!**\n\n🎮 **Game:** ${gameName}\n📋 **Details:**\n${serviceDescription}`)
              .addFields(
                { name: '👤 Customer', value: `${interaction.user}`, inline: true },
                { name: '🎮 Game', value: `${gameName}`, inline: true },
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
  }
});

// ==================== BOT LOGIN ====================

client.login(process.env.TOKEN);