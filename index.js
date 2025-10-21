// Discord Multi-Function Bot v2.0 - Complete Version
// Features: Tickets, Shop (3-step verification), Stock Management, Webhooks, Embeds, Admin System

if (!global.ReadableStream) {
  global.ReadableStream = require('stream/web').ReadableStream;
}

const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder } = require('discord.js');
const https = require('https');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const PREFIX = '!';
const OWNER_ID = '730629579533844512';
const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY || '';
const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID || '';

async function loadData() {
  if (!JSONBIN_API_KEY || !JSONBIN_BIN_ID) {
    console.log('⚠️ JSONBin not configured');
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
          resolve(parseData(json.record || {}));
        } catch (err) {
          console.error('Parse error:', err.message);
          resolve(getEmptyData());
        }
      });
    });
    req.on('error', (err) => {
      console.error('Load error:', err.message);
      resolve(getEmptyData());
    });
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
    doneRoles: Object.fromEntries(doneRoles),
    newsChannels: Object.fromEntries(newsChannels)
  };
  return new Promise((resolve) => {
    const jsonData = JSON.stringify(data);
    const options = {
      hostname: 'api.jsonbin.io',
      path: `/v3/b/${JSONBIN_BIN_ID}`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Master-Key': JSONBIN_API_KEY, 'Content-Length': Buffer.byteLength(jsonData) }
    };
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) console.log('💾 Saved');
        resolve();
      });
    });
    req.on('error', () => resolve());
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
    doneRoles: new Map(Object.entries(data.doneRoles || {})),
    newsChannels: new Map(Object.entries(data.newsChannels || {}))
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
    doneRoles: new Map(),
    newsChannels: new Map()
  };
}

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
let ticketCreationCooldown = new Map();
let doneRoles = new Map();
let newsChannels = new Map(); // Store news channel for shop updates // Store role to give when ticket marked done

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
  doneRoles = loadedData.doneRoles;
  newsChannels = loadedData.newsChannels;
  console.log('✅ Data loaded');
  setInterval(async () => {
    console.log('🧹 Cleanup...');
    let cleaned = false;
    for (const [ticketId] of ticketChannels.entries()) {
      const guild = client.guilds.cache.find(g => g.channels.cache.has(ticketId));
      if (!guild) {
        ticketChannels.delete(ticketId);
        ticketOwners.delete(ticketId);
        cleaned = true;
      }
    }
    for (const [guildId, shops] of shopListings.entries()) {
      const guild = client.guilds.cache.get(guildId);
      if (!guild) {
        shopListings.delete(guildId);
        cleaned = true;
        continue;
      }
      for (const [userId] of shops.entries()) {
        const member = await guild.members.fetch(userId).catch(() => null);
        if (!member) {
          shops.delete(userId);
          cleaned = true;
        }
      }
    }
    if (cleaned) await saveData();
  }, 3600000);
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
    if (!isOwner) return message.reply('❌ Owner only!');
    const userId = args[0];
    if (!userId) return message.reply('Usage: `!admadm USER_ID`');
    const guildAdmins = adminUsers.get(message.guild.id) || [];
    if (guildAdmins.includes(userId)) return message.reply('❌ Already admin!');
    guildAdmins.push(userId);
    adminUsers.set(message.guild.id, guildAdmins);
    saveData();
    const user = await client.users.fetch(userId).catch(() => null);
    message.reply(`✅ Added **${user ? user.tag : userId}** as admin!`);
  }

  if (command === 'admrem') {
    if (!isOwner) return message.reply('❌ Owner only!');
    const userId = args[0];
    if (!userId) return message.reply('Usage: `!admrem USER_ID`');
    const guildAdmins = adminUsers.get(message.guild.id) || [];
    const index = guildAdmins.indexOf(userId);
    if (index === -1) return message.reply('❌ Not admin!');
    guildAdmins.splice(index, 1);
    adminUsers.set(message.guild.id, guildAdmins);
    saveData();
    const user = await client.users.fetch(userId).catch(() => null);
    message.reply(`✅ Removed **${user ? user.tag : userId}**!`);
  }

  if (command === 'admlist') {
    if (!canUseCommands) return message.reply('❌ No permission!');
    const guildAdmins = adminUsers.get(message.guild.id) || [];
    if (guildAdmins.length === 0) return message.reply('📋 No admins!');
    let adminList = '📋 **Admins:**\n\n';
    for (const userId of guildAdmins) {
      const user = await client.users.fetch(userId).catch(() => null);
      adminList += `• ${user ? user.tag : userId}\n`;
    }
    message.reply(adminList);
  }

  if (!canUseCommands && command !== 'admadm' && command !== 'admrem' && command !== 'admlist') {
    const hasModerator = message.member.roles.cache.some(r => 
      r.name.toLowerCase().includes('moderator') || 
      r.name.toLowerCase().includes('mod') ||
      r.permissions.has(PermissionFlagsBits.Administrator)
    );
    if (!hasModerator) return message.reply('❌ No permission!');
  }

  if (command === 'embed') {
    const text = args.join(' ');
    if (!text) return message.reply('Usage: `!embed message`');
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setDescription(text)
      .setTimestamp()
      .setFooter({ text: `By ${message.author.username}`, iconURL: message.author.displayAvatarURL() });
    try {
      await message.delete();
      const sentMessage = await message.channel.send({ embeds: [embed] });
      await sentMessage.react('✨');
    } catch (err) {
      console.error(err);
    }
  }

  if (command === 'fancy') {
    const fullText = args.join(' ');
    if (!fullText) return message.reply('Usage: `!fancy Title\\nMessage`');
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
    if (!text) return message.reply('Usage: `!announce message`');
    const embed = new EmbedBuilder()
      .setColor('#FFA500')
      .setTitle('📢 ANNOUNCEMENT')
      .setDescription(text)
      .setTimestamp()
      .setFooter({ text: `By ${message.author.username}`, iconURL: message.author.displayAvatarURL() });
    try {
      await message.delete();
      const sentMessage = await message.channel.send({ embeds: [embed] });
      await sentMessage.react('📢');
    } catch (err) {
      console.error(err);
    }
  }

  if (command === 'auto') {
    let text = args.join(' ');
    if (!text) return message.reply('Usage: `!auto message`');
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
      .setFooter({ text: `By ${message.author.username}`, iconURL: message.author.displayAvatarURL() });
    try {
      await message.delete();
      const sentMessage = await message.channel.send({ embeds: [embed] });
      await sentMessage.react('✨');
    } catch (err) {
      console.error(err);
    }
  }

  if (command === 'concategory') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ Admin only!');
    const categoryId = args[0];
    if (!categoryId) return message.reply('Usage: `!concategory ID`');
    const category = message.guild.channels.cache.get(categoryId);
    if (!category || category.type !== ChannelType.GuildCategory) return message.reply('❌ Invalid!');
    ticketCategories.set(message.guild.id, categoryId);
    saveData();
    message.reply(`✅ Ticket category: **${category.name}**`);
  }

  if (command === 'conweb') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ Admin only!');
    const categoryId = args[0];
    if (!categoryId) return message.reply('Usage: `!conweb ID`');
    const category = message.guild.channels.cache.get(categoryId);
    if (!category || category.type !== ChannelType.GuildCategory) return message.reply('❌ Invalid!');
    webCategories.set(message.guild.id, categoryId);
    saveData();
    message.reply(`✅ Webhook category: **${category.name}**`);
  }

  if (command === 'conorders') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ Admin only!');
    const channelId = args[0];
    if (!channelId) return message.reply('Usage: `!conorders ID`');
    const channel = message.guild.channels.cache.get(channelId);
    if (!channel || channel.type !== ChannelType.GuildText) return message.reply('❌ Invalid!');
    orderChannels.set(message.guild.id, channelId);
    saveData();
    message.reply(`✅ Orders: <#${channelId}>`);
  }

  if (command === 'condone') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ Admin only!');
    const channelId = args[0];
    if (!channelId) return message.reply('Usage: `!condone ID`');
    const channel = message.guild.channels.cache.get(channelId);
    if (!channel || channel.type !== ChannelType.GuildText) return message.reply('❌ Invalid!');
    doneChannels.set(message.guild.id, channelId);
    saveData();
    message.reply(`✅ Done: <#${channelId}>`);
  }

  if (command === 'conshop') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ Admin only!');
    const categoryId = args[0];
    if (!categoryId) return message.reply('Usage: `!conshop ID`');
    const category = message.guild.channels.cache.get(categoryId);
    if (!category || category.type !== ChannelType.GuildCategory) return message.reply('❌ Invalid!');
    shopCategories.set(message.guild.id, categoryId);
    saveData();
    message.reply(`✅ Shop category: **${category.name}**`);
  }

  if (command === 'contrade') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ Admin only!');
    const channelId = args[0];
    if (!channelId) return message.reply('Usage: `!contrade ID`');
    const channel = message.guild.channels.cache.get(channelId);
    if (!channel || channel.type !== ChannelType.GuildText) return message.reply('❌ Invalid!');
    tradeChannels.set(message.guild.id, channelId);
    saveData();
    message.reply(`✅ Trade log: <#${channelId}>`);
  }

  if (command === 'conrole') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ Admin only!');
    const roleId = args[0];
    if (!roleId) return message.reply('Usage: `!conrole ROLE_ID`');
    const role = message.guild.roles.cache.get(roleId);
    if (!role) return message.reply('❌ Invalid role!');
    doneRoles.set(message.guild.id, roleId);
    saveData();
    message.reply(`✅ Done role set to: **${role.name}**\nTicket owners will receive this role when ticket is marked done.`);
  }

  if (command === 'connews') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ Admin only!');
    const channelId = args[0];
    if (!channelId) return message.reply('Usage: `!connews CHANNEL_ID`');
    const channel = message.guild.channels.cache.get(channelId);
    if (!channel || channel.type !== ChannelType.GuildText) return message.reply('❌ Invalid channel!');
    newsChannels.set(message.guild.id, channelId);
    saveData();
    message.reply(`✅ Shop news channel set to: <#${channelId}>\nAll shop updates will be posted here!`);
  }

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
        const webhook = await newChannel.createWebhook({ name: `${channelName}-webhook`, reason: `By ${message.author.tag}` });
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

  if (command === 'done') {
    if (!message.channel.name.startsWith('ticket-')) return message.reply('❌ Only in tickets!');
    const ticketOwnerName = message.channel.name.replace('ticket-', '');
    const ticketOwner = message.guild.members.cache.find(m => m.user.username.toLowerCase() === ticketOwnerName.toLowerCase());
    if (!ticketOwner) {
      console.log(`⚠️ Ticket owner not found: ${ticketOwnerName}`);
      return message.reply('❌ Ticket owner not found! Channel may need manual closure.');
    }
    const doneButton = new ButtonBuilder().setCustomId('owner_done_confirmation').setLabel('Yes, Mark Done').setEmoji('✅').setStyle(ButtonStyle.Success);
    const cancelButton = new ButtonBuilder().setCustomId('owner_cancel_done').setLabel('Not Yet').setEmoji('❌').setStyle(ButtonStyle.Danger);
    const row = new ActionRowBuilder().addComponents(doneButton, cancelButton);
    await message.channel.send({ content: `${ticketOwner.user}\n\n**Mark done?**`, components: [row] });
    await message.delete().catch(() => {});
  }

  if (command === 'ticket') {
    const fullText = args.join(' ');
    if (!fullText) return message.reply('Usage: `!ticket Title\\nDescription`');
    const lines = fullText.split('\n');
    const title = lines[0];
    const text = lines.slice(1).join('\n');
    const embed = new EmbedBuilder()
      .setColor('#00FFFF')
      .setAuthor({ name: 'Support Ticket', iconURL: message.guild.iconURL() })
      .setTitle(`🎫 ${title}`)
      .setDescription(text || 'Click below to create ticket')
      .addFields({ name: '📋 Next?', value: 'Team will assist shortly', inline: false })
      .setThumbnail(message.guild.iconURL())
      .setFooter({ text: 'Click below' })
      .setTimestamp();
    const button = new ButtonBuilder().setCustomId('create_ticket').setLabel('Create Ticket').setEmoji('🎫').setStyle(ButtonStyle.Primary);
    const row = new ActionRowBuilder().addComponents(button);
    try {
      await message.delete();
      await message.channel.send('@everyone');
      await message.channel.send({ embeds: [embed], components: [row] });
    } catch (err) {
      console.error(err);
    }
  }

  if (command === 'shop') {
    const embed = new EmbedBuilder().setColor('#FFD700').setTitle('🛒 Shop').setDescription('Welcome! Browse or manage your shop.').setTimestamp().setFooter({ text: 'Shop System' });
    const shopButton = new ButtonBuilder().setCustomId('shop_browse').setLabel('Shop').setEmoji('🛍️').setStyle(ButtonStyle.Primary);
    const manageButton = new ButtonBuilder().setCustomId('shop_manage').setLabel('Manage').setEmoji('⚙️').setStyle(ButtonStyle.Secondary);
    const row = new ActionRowBuilder().addComponents(shopButton, manageButton);
    try {
      await message.delete();
      await message.channel.send({ embeds: [embed], components: [row] });
    } catch (err) {
      console.error(err);
    }
  }

  if (command === 'stock') {
    if (!message.channel.name.startsWith('shop-')) return message.reply('❌ Only in shop tickets!');
    const operation = args[0];
    if (!operation || (!operation.startsWith('+') && !operation.startsWith('-'))) {
      return message.reply('Usage: `!stock +1000` or `!stock -1000`');
    }
    const amount = parseInt(operation);
    if (isNaN(amount)) return message.reply('❌ Invalid amount!');
    const channelId = message.channel.id;
    if (!global.shopTicketData) global.shopTicketData = new Map();
    const shopData = global.shopTicketData.get(channelId);
    if (!shopData) return message.reply('❌ Shop data not found!');
    if (message.author.id !== shopData.sellerId) return message.reply('❌ Only seller!');
    const guildShops = shopListings.get(message.guild.id) || new Map();
    const sellerItems = guildShops.get(shopData.sellerId) || [];
    const item = sellerItems.find(i => i.id === shopData.itemId);
    if (!item) return message.reply('❌ Item not found!');
    const oldStock = item.stock || 0;
    const newStock = Math.max(0, oldStock + amount);
    item.stock = newStock;
    guildShops.set(shopData.sellerId, sellerItems);
    shopListings.set(message.guild.id, guildShops);
    await saveData();
    shopData.stockAdjusted = true;
    shopData.stockChange = amount;
    shopData.oldStock = oldStock;
    shopData.newStock = newStock;
    
    // Post to news channel
    await postShopNews(message.guild, 'stock', message.author, item.name, { change: amount, newStock: newStock });
    
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('📊 Stock Adjusted')
      .setDescription(`**Item:** ${item.name}\n**Change:** ${operation}\n**Old:** ${oldStock}\n**New:** ${newStock}`)
      .setFooter({ text: `By ${message.author.tag}` })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
    await message.delete().catch(() => {});
  }

  if (command === 'help') {
    const helpEmbed = new EmbedBuilder()
      .setColor('#5865F2')