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
if (!message.channel.name.startsWith('ticket-') && !message.channel.name.startsWith('shop-')) return message.reply('❌ Only in tickets!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));

const isShopTicket = message.channel.name.startsWith('shop-');
const ticketOwnerName = message.channel.name.replace('ticket-', '').replace('shop-', '').split('-')[0];
const ticketOwner = message.guild.members.cache.find(m => m.user.username.toLowerCase() === ticketOwnerName.toLowerCase());

let serviceDescription = 'N/A';
let itemName = 'N/A';
let itemPrice = 'N/A';
let gameCategory = 'N/A';
let seller = null;
let buyer = null;

try {
  const messages = await message.channel.messages.fetch({ limit: 50 });
  const messagesArray = Array.from(messages.values()).reverse();

  for (const msg of messagesArray) {
    if (msg.embeds && msg.embeds.length > 0) {
      const embed = msg.embeds[0];

      if (isShopTicket && embed.title && embed.title.includes('Shop Transaction')) {
        const fields = embed.fields;
        for (const field of fields) {
          if (field.name.includes('Item')) itemName = field.value.replace(/`/g, '');
          if (field.name.includes('Price')) itemPrice = field.value.replace(/`/g, '');
          if (field.name.includes('Game')) gameCategory = field.value.replace(/`/g, '');
          if (field.name.includes('Buyer')) buyer = field.value;
          if (field.name.includes('Seller')) seller = field.value;
        }
        break;
      }
    }

    if (msg.content && msg.content.includes('Service Request:')) {
      const parts = msg.content.split('Service Request:');
      if (parts.length > 1) {
        serviceDescription = parts[1].trim().split('\n')[0].trim();
      }
    }
  }
} catch (err) {}

const doneChannelId = isShopTicket ? tradeChannels.get(message.guild.id) : doneChannels.get(message.guild.id);

if (doneChannelId) {
  const doneChannel = message.guild.channels.cache.get(doneChannelId);
  if (doneChannel) {
    const currentTimestamp = Math.floor(Date.now() / 1000);

    if (isShopTicket) {
      const shopDoneEmbed = new EmbedBuilder()
        .setColor('#FFD700')
        .setAuthor({ name: '✅ Shop Transaction Completed', iconURL: message.guild.iconURL() })
        .setTitle('🛍️ Trade Successful!')
        .setDescription(`A shop transaction has been force-completed by staff.`)
        .addFields(
          { name: '🎮 Game', value: gameCategory, inline: true },
          { name: '🛍️ Item', value: itemName, inline: true },
          { name: '💰 Price', value: itemPrice, inline: true },
          { name: '👤 Seller', value: seller || 'Unknown', inline: true },
          { name: '🛒 Buyer', value: buyer || 'Unknown', inline: true },
          { name: '\u200b', value: '\u200b', inline: true },
          { name: '⚡ Force Completed By', value: `${message.author}`, inline: false },
          { name: '⏰ Completed At', value: `<t:${currentTimestamp}:F>`, inline: false }
        )
        .setFooter({ text: `Transaction ID: ${message.channel.id}` })
        .setTimestamp();

      const sentMessage = await doneChannel.send({ 
        content: `${seller} ${buyer}`,
        embeds: [shopDoneEmbed],
        allowedMentions: { parse: ['users'] }
      });
      await sentMessage.react('✅');
      await sentMessage.react('🎉');
      await sentMessage.react('💰');
    } else {
      const ticketDoneEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setAuthor({ name: '✅ Service Completed', iconURL: message.guild.iconURL() })
        .setTitle('🎉 Ticket Resolved!')
        .setDescription(`A support ticket has been force-completed.`)
        .addFields(
          { name: '👤 Customer', value: ticketOwner ? `${ticketOwner.user}` : ticketOwnerName, inline: true },
          { name: '📦 Service', value: `\`\`\`${serviceDescription}\`\`\``, inline: false },
          { name: '⚡ Force Completed By', value: `${message.author}`, inline: true },
          { name: '⏰ Completed At', value: `<t:${currentTimestamp}:F>`, inline: true }
        )
        .setThumbnail(ticketOwner ? ticketOwner.user.displayAvatarURL() : message.guild.iconURL())
        .setFooter({ text: `Ticket ID: ${message.channel.id}` })
        .setTimestamp();

      const sentMessage = await doneChannel.send({ 
        content: ticketOwner ? `${ticketOwner.user}` : `@${ticketOwnerName}`,
        embeds: [ticketDoneEmbed],
        allowedMentions: { parse: ['users'] }
      });
      await sentMessage.react('✅');
      await sentMessage.react('🎉');
    }
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

const transcriptChannelId = transcriptChannels.get(message.guild.id);
if (transcriptChannelId) {
  const transcriptChannel = message.guild.channels.cache.get(transcriptChannelId);
  if (transcriptChannel) {
    try {
      const messages = await message.channel.messages.fetch({ limit: 100 });
      const messagesArray = Array.from(messages.values()).reverse();

      let transcript = `📋 TRANSCRIPT - ${message.channel.name}\n`;
      transcript += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      transcript += `Channel: #${message.channel.name}\n`;
      transcript += `Closed: ${new Date().toLocaleString()}\n`;
      transcript += `Closed by: ${message.author.tag}\n`;
      transcript += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

      for (const msg of messagesArray) {
        const time = msg.createdAt.toLocaleTimeString();
        const date = msg.createdAt.toLocaleDateString();
        transcript += `[${date} ${time}] ${msg.author.tag}: ${msg.content}\n`;

        if (msg.embeds.length > 0) {
          transcript += `  └─ [Embed: ${msg.embeds[0].title || 'No title'}]\n`;
        }
      }

      const buffer = Buffer.from(transcript, 'utf-8');
      const attachment = { attachment: buffer, name: `transcript-${message.channel.name}-${Date.now()}.txt` };

      await transcriptChannel.send({ 
        content: `📋 **Transcript saved**\nChannel: ${message.channel.name}\nClosed by: ${message.author}`,
        files: [attachment]
      });
    } catch (err) {
      console.error('Transcript save error:', err);
    }
  }
}

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
  ticketClaims.delete(ticketId);
  ticketTimers.delete(ticketId);
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
const helpEmbed = new EmbedBuilder().setColor('#5865F2').setTitle('🎨 Commands').addFields({ name: '🎫 Ticket', value: '`!ticket` `!done` `!forcedone` `!close` `!createweb` `!claim` `!time`', inline: false }, { name: '🛒 Shop', value: '`!shop` `!stock +/- amt uid item` `!leaderboard`', inline: false }, { name: '🎮 Games', value: '`!addgame` `!removegame` `!listgames`', inline: false }, { name: '⚙️ Config', value: '`!concategory/web/orders/done/shop/trade/transcript/news ID`', inline: false }, { name: '👑 Admin', value: '`!admadm/rem/list`', inline: false }).setTimestamp();
message.reply({ embeds: [helpEmbed] }).then(msg => setTimeout(() => msg.delete().catch(() => {}), 60000));
message.delete().catch(() => {});
}

if (command === 'leaderboard') {
const guildStats = tradeStats.get(message.guild.id) || {};
const entries = Object.entries(guildStats).sort((a, b) => b[1] - a[1]).slice(0, 10);

if (entries.length === 0) {
  return message.reply('📊 No trades yet! Leaderboard is empty.').then(msg => setTimeout(() => msg.delete().catch(() => {}), 10000));
}

let leaderboardText = '';
const medals = ['🥇', '🥈', '🥉'];

for (let i = 0; i < entries.length; i++) {
  const [userId, count] = entries[i];
  const user = await client.users.fetch(userId).catch(() => null);
  const userName = user ? user.username : 'Unknown';
  const medal = i < 3 ? medals[i] : `${i + 1}.`;

  const ratings = sellerRatings.get(userId) || { total: 0, count: 0 };
  const avgRating = ratings.count > 0 ? (ratings.total / ratings.count).toFixed(1) : 'N/A';
  const stars = avgRating !== 'N/A' ? '⭐'.repeat(Math.round(avgRating)) : '⭐';

  leaderboardText += `${medal} **${userName}** - ${count} trades | ${avgRating !== 'N/A' ? avgRating : 'No'} ${stars}\n`;
}

const leaderboardEmbed = new EmbedBuilder()
  .setColor('#FFD700')
  .setAuthor({ name: '🏆 Top Sellers Leaderboard', iconURL: message.guild.iconURL() })
  .setTitle('Most Successful Traders')
  .setDescription(leaderboardText || 'No data yet')
  .setFooter({ text: 'Keep trading to climb the ranks!' })
  .setTimestamp();

message.reply({ embeds: [leaderboardEmbed] }).then(msg => setTimeout(() => msg.delete().catch(() => {}), 60000));
message.delete().catch(() => {});
}

if (command === 'claim') {
if (!canUseCommands) return message.reply('❌ Admin only!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
if (!message.channel.name.startsWith('ticket-') && !message.channel.name.startsWith('shop-')) {
  return message.reply('❌ Only in tickets!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
}

const currentClaim = ticketClaims.get(message.channel.id);
if (currentClaim) {
  const claimer = await client.users.fetch(currentClaim).catch(() => null);
  return message.reply(`❌ Already claimed by **${claimer ? claimer.tag : 'Unknown'}**!`).then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
}

ticketClaims.set(message.channel.id, message.author.id);
await saveData();

const claimEmbed = new EmbedBuilder()
  .setColor('#5865F2')
  .setTitle('🎫 Ticket Claimed')
  .setDescription(`${message.author} is now handling this ticket.`)
  .setTimestamp();

await message.channel.send({ embeds: [claimEmbed] });
message.delete().catch(() => {});
}

if (command === 'time') {
if (!canUseCommands) return message.reply('❌ Admin only!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
if (!message.channel.name.startsWith('ticket-') && !message.channel.name.startsWith('shop-')) {
  return message.reply('❌ Only in tickets!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
}

const timeArg = args[0];
if (!timeArg) return message.reply('Usage: `!time 3d` or `!time +4h` or `!time -2h`').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));

const isModifier = timeArg.startsWith('+') || timeArg.startsWith('-');
const timeStr = isModifier ? timeArg.substring(1) : timeArg;
const match = timeStr.match(/^(\d+)([dhms])$/);

if (!match) return message.reply('❌ Invalid format! Use: 3d, 4h, 30m, or 60s').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));

const value = parseInt(match[1]);
const unit = match[2];

const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
const milliseconds = value * multipliers[unit];

const currentTimer = ticketTimers.get(message.channel.id);
let endTime;

if (isModifier && currentTimer) {
  if (timeArg.startsWith('+')) {
    endTime = currentTimer.endTime + milliseconds;
  } else {
    endTime = currentTimer.endTime - milliseconds;
  }

  if (endTime <= Date.now()) {
    return message.reply('❌ Time cannot be in the past!').then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
  }
} else {
  endTime = Date.now() + milliseconds;
}

ticketTimers.set(message.channel.id, {
  endTime: endTime,
  channelId: message.channel.id,
  guildId: message.guild.id,
  setBy: message.author.id
});
await saveData();

const timeEmbed = new EmbedBuilder()
  .setColor('#FF6B35')
  .setTitle('⏰ Countdown Timer Set')
  .setDescription(`Timer ${isModifier ? 'modified' : 'set'} by ${message.author}`)
  .addFields(
    { name: '⏱️ Ends At', value: `<t:${Math.floor(endTime / 1000)}:F>`, inline: true },
    { name: '⏳ Time Left', value: `<t:${Math.floor(endTime / 1000)}:R>`, inline: true }
  )
  .setFooter({ text: 'Everyone will be pinged when timer ends' })
  .setTimestamp();

await message.channel.send({ embeds: [timeEmbed] });
message.delete().catch(() => {});

setTimeout(async () => {
  const channel = await client.channels.fetch(message.channel.id).catch(() => null);
  if (channel) {
    const endEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('⏰ Timer Finished!')
      .setDescription('The countdown has ended!')
      .setTimestamp();

    await channel.send({ content: '@everyone', embeds: [endEmbed], allowedMentions: { parse: ['everyone'] } });
  }
  ticketTimers.delete(message.channel.id);
  await saveData();
}, endTime - Date.now());
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

    const transcriptChannelId = transcriptChannels.get(interaction.guild.id);
    if (transcriptChannelId) {
      const transcriptChannel = interaction.guild.channels.cache.get(transcriptChannelId);
      if (transcriptChannel) {
        try {
          const messages = await interaction.channel.messages.fetch({ limit: 100 });
          const messagesArray = Array.from(messages.values()).reverse();

          let transcript = `📋 TRANSCRIPT - ${interaction.channel.name}\n`;
          transcript += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          transcript += `Channel: #${interaction.channel.name}\n`;
          transcript += `Closed: ${new Date().toLocaleString()}\n`;
          transcript += `Closed by: ${interaction.user.tag}\n`;
          transcript += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

          for (const msg of messagesArray) {
            const time = msg.createdAt.toLocaleTimeString();
            const date = msg.createdAt.toLocaleDateString();
            transcript += `[${date} ${time}] ${msg.author.tag}: ${msg.content}\n`;

            if (msg.embeds.length > 0) {
              transcript += `  └─ [Embed: ${msg.embeds[0].title || 'No title'}]\n`;
            }
          }

          const buffer = Buffer.from(transcript, 'utf-8');
          const attachment = { attachment: buffer, name: `transcript-${interaction.channel.name}-${Date.now()}.txt` };

          await transcriptChannel.send({ 
            content: `📋 **Transcript saved**\nChannel: ${interaction.channel.name}\nClosed by: ${interaction.user}`,
            files: [attachment]
          });
        } catch (err) {
          console.error('Transcript save error:', err);
        }
      }
    }

    await interaction.update({ content: `✅ **Trade confirmed!**\nRating: ${rating}/5 ⭐\nStock remaining: **${item.stock}**\n\nClosing in 5s...`, components: [] });
    setTimeout(async () => {
      await interaction.channel.delete().catch(console.error);
    }, 5000);
  }

  if (interaction.customId === 'shop_buyer_cancel') {
    await interaction.update({ content: `❌ **${interaction.user}** cancelled.\n\nNot done.`, components: [] });
  } = interaction.guild.channels.cache.get(transcriptChannelId);
      if (transcriptChannel) {
        try {
          const messages = await interaction.channel.messages.fetch({ limit: 100 });
          const messagesArray = Array.from(messages.values()).reverse();

          let transcript = `📋 TRANSCRIPT - ${interaction.channel.name}\n`;
          transcript += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          transcript += `Channel: #${interaction.channel.name}\n`;
          transcript += `Closed: ${new Date().toLocaleString()}\n`;
          transcript += `Closed by: ${interaction.user.tag}\n`;
          transcript += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

          for (const msg of messagesArray) {
            const time = msg.createdAt.toLocaleTimeString();
            const date = msg.createdAt.toLocaleDateString();
            transcript += `[${date} ${time}] ${msg.author.tag}: ${msg.content}\n`;

            if (msg.embeds.length > 0) {
              transcript += `  └─ [Embed: ${msg.embeds[0].title || 'No title'}]\n`;
            }
          }

          const buffer = Buffer.from(transcript, 'utf-8');
          const attachment = { attachment: buffer, name: `transcript-${interaction.channel.name}-${Date.now()}.txt` };

          await transcriptChannel.send({ 
            content: `📋 **Transcript saved**\nChannel: ${interaction.channel.name}\nClosed by: ${interaction.user}`,
            files: [attachment]
          });
        } catch (err) {
          console.error('Transcript save error:', err);
        }
      }
    }

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
      ticketClaims.delete(ticketId);
      ticketTimers.delete(ticketId);
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

    const isShopTicket = interaction.channel.name.startsWith('shop-');
    const ticketOwnerName = interaction.channel.name.replace('ticket-', '').replace('shop-', '').split('-')[0];
    const ticketOwner = interaction.guild.members.cache.find(m => m.user.username.toLowerCase() === ticketOwnerName.toLowerCase());

    let serviceDescription = 'N/A';
    let itemName = 'N/A';
    let itemPrice = 'N/A';
    let gameCategory = 'N/A';
    let seller = null;
    let buyer = null;

    try {
      const messages = await interaction.channel.messages.fetch({ limit: 50 });
      const messagesArray = Array.from(messages.values()).reverse();

      for (const msg of messagesArray) {
        if (msg.embeds && msg.embeds.length > 0) {
          const embed = msg.embeds[0];

          if (isShopTicket && embed.title && embed.title.includes('Shop Transaction')) {
            const fields = embed.fields;
            for (const field of fields) {
              if (field.name.includes('Item')) itemName = field.value.replace(/`/g, '');
              if (field.name.includes('Price')) itemPrice = field.value.replace(/`/g, '');
              if (field.name.includes('Game')) gameCategory = field.value.replace(/`/g, '');
              if (field.name.includes('Buyer')) buyer = field.value;
              if (field.name.includes('Seller')) seller = field.value;
            }
            break;
          }
        }

        if (msg.content && msg.content.includes('Service Request:')) {
          const parts = msg.content.split('Service Request:');
          if (parts.length > 1) {
            serviceDescription = parts[1].trim().split('\n')[0].trim();
          }
        }

        if (msg.embeds && msg.embeds.length > 0) {
          const embed = msg.embeds[0];
          if (embed.fields) {
            for (const field of embed.fields) {
              if (field.name.includes('Your Request')) {
                serviceDescription = field.value.replace(/```/g, '');
              }
            }
          }
        }
      }
    } catch (err) {}

    const doneChannelId = isShopTicket ? tradeChannels.get(interaction.guild.id) : doneChannels.get(interaction.guild.id);

    if (doneChannelId) {
      const doneChannel = interaction.guild.channels.cache.get(doneChannelId);
      if (doneChannel) {
        const currentTimestamp = Math.floor(Date.now() / 1000);

        if (isShopTicket) {
          const shopDoneEmbed = new EmbedBuilder()
            .setColor('#00FF7F')
            .setAuthor({ name: '✅ Shop Transaction Completed', iconURL: interaction.guild.iconURL() })
            .setTitle('🎉 Trade Successful!')
            .setDescription(`A shop transaction has been successfully completed!`)
            .addFields(
              { name: '🎮 Game', value: gameCategory, inline: true },
              { name: '🛍️ Item', value: itemName, inline: true },
              { name: '💰 Price', value: itemPrice, inline: true },
              { name: '👤 Seller', value: seller || 'Unknown', inline: true },
              { name: '🛒 Buyer', value: buyer || 'Unknown', inline: true },
              { name: '\u200b', value: '\u200b', inline: true },
              { name: '✅ Confirmed By', value: `${interaction.user}`, inline: false },
              { name: '⏰ Completed At', value: `<t:${currentTimestamp}:F>`, inline: false }
            )
            .setFooter({ text: `Transaction ID: ${interaction.channel.id}` })
            .setTimestamp();

          try {
            const sentMessage = await doneChannel.send({ 
              content: `${seller} ${buyer}`,
              embeds: [shopDoneEmbed],
              allowedMentions: { parse: ['users'] }
            });
            await sentMessage.react('✅');
            await sentMessage.react('🎉');
            await sentMessage.react('💰');
          } catch (err) {
            console.error('Done channel send error:', err);
          }
        } else {
          const ticketDoneEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setAuthor({ name: '✅ Service Completed', iconURL: interaction.guild.iconURL() })
            .setTitle('🎊 Ticket Resolved!')
            .setDescription(`A support ticket has been successfully completed!`)
            .addFields(
              { name: '👤 Customer', value: ticketOwner ? `${ticketOwner.user}` : ticketOwnerName, inline: true },
              { name: '📦 Service', value: `\`\`\`${serviceDescription}\`\`\``, inline: false },
              { name: '✅ Confirmed By', value: `${interaction.user}`, inline: true },
              { name: '⏰ Completed At', value: `<t:${currentTimestamp}:F>`, inline: true }
            )
            .setThumbnail(ticketOwner ? ticketOwner.user.displayAvatarURL() : interaction.guild.iconURL())
            .setFooter({ text: `Ticket ID: ${interaction.channel.id}` })
            .setTimestamp();

          try {
            const sentMessage = await doneChannel.send({ 
              content: ticketOwner ? `${ticketOwner.user}` : `@${ticketOwnerName}`,
              embeds: [ticketDoneEmbed],
              allowedMentions: { parse: ['users'] }
            });
            await sentMessage.react('✅');
            await sentMessage.react('🎉');
          } catch (err) {
            console.error('Done channel send error:', err);
          }
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

    const transcriptChannelId = transcriptChannels.get(interaction.guild.id);
    if (transcriptChannelId) {
      const transcriptChannel = interaction.guild.channels.cache.get(transcriptChannelId);
      if (transcriptChannel) {
        try {
          const messages = await interaction.channel.messages.fetch({ limit: 100 });
          const messagesArray = Array.from(messages.values()).reverse();

          let transcript = `📋 TRANSCRIPT - ${interaction.channel.name}\n`;
          transcript += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          transcript += `Channel: #${interaction.channel.name}\n`;
          transcript += `Closed: ${new Date().toLocaleString()}\n`;
          transcript += `Closed by: ${interaction.user.tag}\n`;
          transcript += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

          for (const msg of messagesArray) {
            const time = msg.createdAt.toLocaleTimeString();
            const date = msg.createdAt.toLocaleDateString();
            transcript += `[${date} ${time}] ${msg.author.tag}: ${msg.content}\n`;

            if (msg.embeds.length > 0) {
              transcript += `  └─ [Embed: ${msg.embeds[0].title || 'No title'}]\n`;
            }
          }

          const buffer = Buffer.from(transcript, 'utf-8');
          const attachment = { attachment: buffer, name: `transcript-${interaction.channel.name}-${Date.now()}.txt` };

          await transcriptChannel.send({ 
            content: `📋 **Transcript saved**\nChannel: ${interaction.channel.name}\nClosed by: ${interaction.user}`,
            files: [attachment]
          });
        } catch (err) {
          console.error('Transcript save error:', err);
        }
      }
    }

    await interaction.update({ content: `✅ **Trade confirmed!**\nRating: ${rating}/5 ⭐\nStock remaining: **${item.stock}**\n\nClosing in 5s...`, components: [] });
    setTimeout(async () => {
      await interaction.channel.delete().catch(console.error);
    }, 5000);
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

    const guildStats = tradeStats.get(interaction.guild.id) || {};
    guildStats[sellerId] = (guildStats[sellerId] || 0) + 1;
    tradeStats.set(interaction.guild.id, guildStats);

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

    const transcriptChannelId = transcriptChannels.get(interaction.guild.id);
    if (transcriptChannelId) {
      const transcriptChannel = interaction.guild.channels.cache.get(transcriptChannelId);
      if (transcriptChannel) {
        try {
          const messages = await interaction.channel.messages.fetch({ limit: 100 });
          const messagesArray = Array.from(messages.values()).reverse();

          let transcript = `📋 TRANSCRIPT - ${interaction.channel.name}\n`;
          transcript += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
          transcript += `Channel: #${interaction.channel.name}\n`;
          transcript += `Closed: ${new Date().toLocaleString()}\n`;
          transcript += `Closed by: ${interaction.user.tag}\n`;
          transcript += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

          for (const msg of messagesArray) {
            const time = msg.createdAt.toLocaleTimeString();
            const date = msg.createdAt.toLocaleDateString();
            transcript += `[${date} ${time}] ${msg.author.tag}: ${msg.content}\n`;

            if (msg.embeds.length > 0) {
              transcript += `  └─ [Embed: ${msg.embeds[0].title || 'No title'}]\n`;
            }
          }

          const buffer = Buffer.from(transcript, 'utf-8');
          const attachment = { attachment: buffer, name: `transcript-${interaction.channel.name}-${Date.now()}.txt` };

          await transcriptChannel.send({ 
            content: `📋 **Transcript saved**\nChannel: ${interaction.channel.name}\nClosed by: ${interaction.user}`,
            files: [attachment]
          });
        } catch (err) {
          console.error('Transcript save error:', err);
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
    await interaction.deferReply({ ephemeral: true });

    const serviceDescription = interaction.fields.getTextInputValue('service_type');
    const categoryId = ticketCategories.get(interaction.guild.id);
    if (!categoryId) return interaction.editReply({ content: '❌ Category not configured!' });

    const existingTicket = interaction.guild.channels.cache.find(ch => ch.name === `ticket-${interaction.user.username.toLowerCase()}` && ch.parentId === categoryId);
    if (existingTicket) return interaction.editReply({ content: `❌ You already have a ticket: <#${existingTicket.id}>` });

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

      const welcomeEmbed = new EmbedBuilder()
        .setColor('#00FFFF')
        .setAuthor({ name: '🎫 New Service Request', iconURL: interaction.guild.iconURL() })
        .setTitle(`📬 Order Received!`)
        .setDescription(`**${interaction.user.username}** has requested a service!\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n*Our team has been notified and will assist you shortly. Please be patient while we review your request.*`)
        .addFields(
          { name: '📝 Service Details', value: `\`\`\`${serviceDescription}\`\`\``, inline: false },
          { name: '👤 Customer', value: `${interaction.user}`, inline: true },
          { name: '🕐 Submitted', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
          { name: '📊 Status', value: '🟡 **Pending** - Waiting for Staff', inline: false }
        )
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, size: 256 }))
        .setFooter({ text: '💡 Tip: Please remain available to respond to staff questions' })
        .setTimestamp();

      await ticketChannel.send({ 
        content: `${interaction.user} 👋\n\n@everyone 🔔 **New ticket alert!**`, 
        embeds: [welcomeEmbed],
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

      await interaction.editReply({ content: `✅ Ticket created successfully! <#${ticketChannel.id}>` });
    } catch (err) {
      console.error('Ticket creation error:', err);
      await interaction.editReply({ content: '❌ Failed to create ticket! Please contact an administrator.' });
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
    await interaction.deferUpdate();

    const [sellerId, itemId] = interaction.values[0].split('-');
    const guildShops = shopListings.get(interaction.guild.id) || new Map();
    const sellerItems = guildShops.get(sellerId) || [];
    const item = sellerItems.find(i => i.id === itemId);

    if (!item) {
      return interaction.editReply({ content: '❌ Item not found!', components: [] });
    }

    if ((item.stock || 0) <= 0) {
      return interaction.editReply({ content: '❌ This item is out of stock!', components: [] });
    }

    const seller = await interaction.client.users.fetch(sellerId).catch(() => null);
    const buyer = interaction.user;
    const categoryId = shopCategories.get(interaction.guild.id) || ticketCategories.get(interaction.guild.id);

    if (!categoryId) {
      return interaction.editReply({ content: '❌ Shop category not configured! Ask admin to use `!conshop`', components: [] });
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
        .setDescription(`**📋 Transaction Steps:**

1️⃣ **Buyer pays seller first** - Send payment to seller
2️⃣ **Seller delivers item** - After payment received
3️⃣ **Buyer clicks "Mark Done"** - After receiving item
4️⃣ **Buyer confirms** - Verify you received item
5️⃣ **Admin verifies** - Final confirmation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ **IMPORTANT:** Buyer must pay seller FIRST before item delivery!`)
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

      await interaction.editReply({ content: `✅ Transaction channel created! <#${ticketChannel.id}>`, components: [] });
    } catch (err) {
      console.error('Shop channel creation error:', err);
      await interaction.editReply({ content: '❌ Failed to create transaction channel! Please contact an administrator.', components: [] });
    }
  }
}
} catch (error) {
console.error('Interaction error:', error);
if (!interaction.replied && !interaction.deferred) {
  await interaction.reply({ content: '❌ Something went wrong! Please try again.', ephemeral: true }).catch(console.error);
} else if (interaction.deferred) {
  await interaction.editReply({ content: '❌ Something went wrong! Please try again.' }).catch(console.error);
}
}
});

client.login(process.env.TOKEN);