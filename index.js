// Fix for ReadableStream error in Replit
if (!global.ReadableStream) {
  global.ReadableStream = require('stream/web').ReadableStream;
}

const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const PREFIX = '!';

// Store data
const ticketCategories = new Map();
const orderChannels = new Map();
const doneChannels = new Map();
const adminUsers = new Map();
const ticketChannels = new Map();
const webCategories = new Map();
const shopListings = new Map();

const OWNER_ID = '730629579533844512';

client.once('ready', () => {
  console.log(`✅ Bot is online as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // Check if user is owner or admin
  const isOwner = message.author.id === OWNER_ID;
  const admins = adminUsers.get(message.guild.id) || [];
  const isAdmin = admins.includes(message.author.id);
  const canUseCommands = isOwner || isAdmin;

  // Also check if user has Moderator or Administrator role
  const hasModerator = message.member.roles.cache.some(r => 
    r.name.toLowerCase().includes('moderator') || 
    r.name.toLowerCase().includes('mod') ||
    r.permissions.has(PermissionFlagsBits.Administrator)
  );

  // Admin management commands (owner only)
  if (command === 'admadm') {
    if (!isOwner) {
      return message.reply('❌ Only the owner can use this command!');
    }

    const userId = args[0];
    if (!userId) {
      return message.reply('Usage: `!admadm USER_ID`');
    }

    const guildAdmins = adminUsers.get(message.guild.id) || [];
    if (guildAdmins.includes(userId)) {
      return message.reply('❌ This user is already an admin!');
    }

    guildAdmins.push(userId);
    adminUsers.set(message.guild.id, guildAdmins);

    const user = await client.users.fetch(userId).catch(() => null);
    message.reply(`✅ Added **${user ? user.tag : userId}** as admin!`);
  }

  if (command === 'admrem') {
    if (!isOwner) {
      return message.reply('❌ Only the owner can use this command!');
    }

    const userId = args[0];
    if (!userId) {
      return message.reply('Usage: `!admrem USER_ID`');
    }

    const guildAdmins = adminUsers.get(message.guild.id) || [];
    const index = guildAdmins.indexOf(userId);

    if (index === -1) {
      return message.reply('❌ This user is not an admin!');
    }

    guildAdmins.splice(index, 1);
    adminUsers.set(message.guild.id, guildAdmins);

    const user = await client.users.fetch(userId).catch(() => null);
    message.reply(`✅ Removed **${user ? user.tag : userId}** from admins!`);
  }

  if (command === 'admlist') {
    if (!canUseCommands) {
      return message.reply('❌ You don\'t have permission to use this command!');
    }

    const guildAdmins = adminUsers.get(message.guild.id) || [];

    if (guildAdmins.length === 0) {
      return message.reply('📋 No admins added yet!');
    }

    let adminList = '📋 **Admin List:**\n\n';
    for (const userId of guildAdmins) {
      const user = await client.users.fetch(userId).catch(() => null);
      adminList += `• ${user ? user.tag : userId} (${userId})\n`;
    }

    message.reply(adminList);
  }

  // Check permissions for all other commands
  if (!canUseCommands && command !== 'admadm' && command !== 'admrem' && command !== 'admlist') {
    if (!hasModerator) {
      return message.reply('❌ You don\'t have permission to use bot commands!');
    }
  }

  // Configuration commands
  if (command === 'concategory') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('❌ You need Administrator permission to use this command!');
    }

    const categoryId = args[0];
    if (!categoryId) {
      return message.reply('Please provide a category ID! Usage: `!concategory CATEGORY_ID`');
    }

    const category = message.guild.channels.cache.get(categoryId);
    if (!category || category.type !== ChannelType.GuildCategory) {
      return message.reply('❌ Invalid category ID! Make sure it\'s a category, not a channel.');
    }

    ticketCategories.set(message.guild.id, categoryId);
    message.reply(`✅ Ticket category set to: **${category.name}**`);
  }

  if (command === 'conweb') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('❌ You need Administrator permission to use this command!');
    }

    const categoryId = args[0];
    if (!categoryId) {
      return message.reply('Please provide a category ID! Usage: `!conweb CATEGORY_ID`');
    }

    const category = message.guild.channels.cache.get(categoryId);
    if (!category || category.type !== ChannelType.GuildCategory) {
      return message.reply('❌ Invalid category ID! Make sure it\'s a category, not a channel.');
    }

    webCategories.set(message.guild.id, categoryId);
    message.reply(`✅ Webhook channel category set to: **${category.name}**`);
  }

  if (command === 'conorders') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('❌ You need Administrator permission to use this command!');
    }

    const channelId = args[0];
    if (!channelId) {
      return message.reply('Please provide a channel ID! Usage: `!conorders CHANNEL_ID`');
    }

    const channel = message.guild.channels.cache.get(channelId);
    if (!channel || channel.type !== ChannelType.GuildText) {
      return message.reply('❌ Invalid channel ID! Make sure it\'s a text channel.');
    }

    orderChannels.set(message.guild.id, channelId);
    message.reply(`✅ Orders log channel set to: <#${channelId}>`);
  }

  if (command === 'condone') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('❌ You need Administrator permission to use this command!');
    }

    const channelId = args[0];
    if (!channelId) {
      return message.reply('Please provide a channel ID! Usage: `!condone CHANNEL_ID`');
    }

    const channel = message.guild.channels.cache.get(channelId);
    if (!channel || channel.type !== ChannelType.GuildText) {
      return message.reply('❌ Invalid channel ID! Make sure it\'s a text channel.');
    }

    doneChannels.set(message.guild.id, channelId);
    message.reply(`✅ Done log channel set to: <#${channelId}>`);
  }

  // !createweb command
  if (command === 'createweb') {
    const channelName = args.join('-').toLowerCase();

    if (!channelName) {
      return message.reply('Please provide a channel name! Usage: `!createweb channel-name`');
    }

    const botMember = message.guild.members.cache.get(client.user.id);
    if (!botMember.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply('❌ I don\'t have **Manage Channels** permission!');
    }
    if (!botMember.permissions.has(PermissionFlagsBits.ManageWebhooks)) {
      return message.reply('❌ I don\'t have **Manage Webhooks** permission!');
    }

    try {
      let permissionOverwrites = [];
      let ticketOwner = null;

      if (message.channel.name.startsWith('ticket-')) {
        const ticketOwnerName = message.channel.name.replace('ticket-', '');
        ticketOwner = message.guild.members.cache.find(m => m.user.username.toLowerCase() === ticketOwnerName.toLowerCase());
      }

      permissionOverwrites.push({
        id: message.guild.id,
        deny: [PermissionFlagsBits.ViewChannel],
      });

      permissionOverwrites.push({
        id: client.user.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageWebhooks],
      });

      if (ticketOwner) {
        permissionOverwrites.push({
          id: ticketOwner.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
        });
      }

      permissionOverwrites.push({
        id: OWNER_ID,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
      });

      const admins = adminUsers.get(message.guild.id) || [];
      for (const adminId of admins) {
        permissionOverwrites.push({
          id: adminId,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
        });
      }

      const staffRole = message.guild.roles.cache.find(r => 
        r.name.toLowerCase().includes('staff') || 
        r.name.toLowerCase().includes('admin') ||
        r.name.toLowerCase().includes('mod')
      );

      if (staffRole) {
        permissionOverwrites.push({
          id: staffRole.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
        });
      }

      const webCategoryId = webCategories.get(message.guild.id);
      const newChannel = await message.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: webCategoryId || null,
        permissionOverwrites: permissionOverwrites,
      });

      if (message.channel.name.startsWith('ticket-')) {
        const ticketId = message.channel.id;
        if (!ticketChannels.has(ticketId)) {
          ticketChannels.set(ticketId, []);
        }
        ticketChannels.get(ticketId).push(newChannel.id);
      }

      try {
        const webhook = await newChannel.createWebhook({
          name: `${channelName}-webhook`,
          reason: `Created by ${message.author.tag}`,
        });

        await message.channel.send(`✅ Channel created: <#${newChannel.id}>`);
        await message.channel.send(webhook.url);
      } catch (webhookError) {
        console.error('Webhook Creation Error:', webhookError);
        await message.channel.send(`✅ Channel created: <#${newChannel.id}>\n\n❌ Webhook creation failed: ${webhookError.message}`);
      }

    } catch (err) {
      console.error('CreateWeb Error:', err);
      message.reply(`❌ Failed to create channel!\n**Error:** ${err.message}`);
    }
  }

  // !done command
  if (command === 'done') {
    if (!message.channel.name.startsWith('ticket-')) {
      return message.reply('❌ This command can only be used in ticket channels!');
    }

    const ticketOwnerName = message.channel.name.replace('ticket-', '');
    const ticketOwner = message.guild.members.cache.find(m => m.user.username.toLowerCase() === ticketOwnerName.toLowerCase());

    if (!ticketOwner) {
      return message.reply('❌ Could not find ticket owner!');
    }

    const doneButton = new ButtonBuilder()
      .setCustomId('owner_done_confirmation')
      .setLabel('Yes, Mark as Done')
      .setEmoji('✅')
      .setStyle(ButtonStyle.Success);

    const cancelButton = new ButtonBuilder()
      .setCustomId('owner_cancel_done')
      .setLabel('Not Yet')
      .setEmoji('❌')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(doneButton, cancelButton);

    await message.channel.send({ 
      content: `${ticketOwner.user}\n\n**Do you want to mark this ticket as done?**\nClick the button below to confirm.`,
      components: [row]
    });

    await message.delete().catch(() => {});
  }

  // !ticket command
  if (command === 'ticket') {
    const fullText = args.join(' ');
    if (!fullText) {
      return message.reply('Please provide a message! Usage: `!ticket Title\nYour message here`');
    }

    const lines = fullText.split('\n');
    const title = lines[0];
    const text = lines.slice(1).join('\n');

    const embed = new EmbedBuilder()
      .setColor('#00BFFF')
      .setTitle(`🎫 ${title}`)
      .setTimestamp()
      .setFooter({ text: 'Click the button below to create a ticket' });

    if (text.trim()) {
      embed.setDescription(text);
    }

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
      message.reply('❌ Failed to create ticket panel!');
    }
  }

  // !embed command
  if (command === 'embed') {
    const text = args.join(' ');
    if (!text) {
      return message.reply('Please provide a message! Usage: `!embed Your message here`');
    }

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
      message.reply('❌ Failed to create embed. Make sure I have permissions!');
    }
  }

  // !auto command
  if (command === 'auto') {
    let text = args.join(' ');
    if (!text) {
      return message.reply('Please provide a message! Usage: `!auto Your message here`');
    }

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
      const lowerLine = line.toLowerCase();

      if (lowerLine.includes('service') || lowerLine.includes('offer')) return `💸 ${line}`;
      if (lowerLine.includes('pilot')) return `✈️ ${line}`;
      if (lowerLine.includes('broly') || lowerLine.includes('strong')) return `💪 ${line}`;
      if (lowerLine.includes('goku') || lowerLine.includes('fire')) return `🔥 ${line}`;
      if (lowerLine.includes('vegeta') || lowerLine.includes('power')) return `⚡ ${line}`;
      if (lowerLine.includes('php') || lowerLine.includes('price') || lowerLine.includes('=')) return `💰 ${line}`;
      if (lowerLine.includes('diamond') || lowerLine.includes('rare')) return `💎 ${line}`;
      if (lowerLine.includes('premium') || lowerLine.includes('vip')) return `👑 ${line}`;
      if (lowerLine.includes('rank') || lowerLine.includes('top')) return `🏆 ${line}`;
      if (lowerLine.includes('boost')) return `🚀 ${line}`;
      if (lowerLine.includes('new')) return `🆕 ${line}`;
      if (lowerLine.includes('sale') || lowerLine.includes('hot')) return `🔥 ${line}`;
      if (lowerLine.includes('discount')) return `💥 ${line}`;

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

  // !fancy command
  if (command === 'fancy') {
    if (args.length < 1) {
      return message.reply('Please provide a title and message! Usage: `!fancy Pilot Your message here`');
    }

    const title = args[0];
    const text = args.slice(1).join(' ');

    const embed = new EmbedBuilder()
      .setColor('#FF00FF')
      .setTitle(`✨ ${title} ✨`)
      .setTimestamp()
      .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() })
      .setThumbnail(message.author.displayAvatarURL());

    if (text.trim()) {
      embed.setDescription(`>>> ${text}`);
    }

    try {
      await message.delete();
      const sentMessage = await message.channel.send({ embeds: [embed] });
      await sentMessage.react('💖');
    } catch (err) {
      console.error(err);
    }
  }

  // Other embed commands...
  if (command === 'announce') {
    const text = args.join(' ');
    if (!text) {
      return message.reply('Please provide a message! Usage: `!announce Your announcement here`');
    }

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
    if (!text) {
      return message.reply('Please provide a message! Usage: `!quote Your quote here`');
    }

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

    if (!color || !text) {
      return message.reply('Usage: `!colorembed #FF0000 Your message here`');
    }

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
      message.reply('❌ Invalid color code! Use hex format like #FF0000');
    }
  }

  if (command === 'success') {
    const text = args.join(' ');
    if (!text) {
      return message.reply('Please provide a message! Usage: `!success Your message here`');
    }

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('✅ Success')
      .setDescription(text)
      .setTimestamp();

    try {
      await message.delete();
      const sentMessage = await message.channel.send({ embeds: [embed] });
      await sentMessage.react('✅');
    } catch (err) {
      console.error(err);
    }
  }

  if (command === 'error') {
    const text = args.join(' ');
    if (!text) {
      return message.reply('Please provide a message! Usage: `!error Your message here`');
    }

    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('❌ Error')
      .setDescription(text)
      .setTimestamp();

    try {
      await message.delete();
      const sentMessage = await message.channel.send({ embeds: [embed] });
      await sentMessage.react('❌');
    } catch (err) {
      console.error(err);
    }
  }

  if (command === 'info') {
    const text = args.join(' ');
    if (!text) {
      return message.reply('Please provide a message! Usage: `!info Your message here`');
    }

    const embed = new EmbedBuilder()
      .setColor('#00BFFF')
      .setTitle('ℹ️ Information')
      .setDescription(text)
      .setTimestamp();

    try {
      await message.delete();
      const sentMessage = await message.channel.send({ embeds: [embed] });
      await sentMessage.react('ℹ️');
    } catch (err) {
      console.error(err);
    }
  }

  // !help command
  if (command === 'help') {
    const helpEmbed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🎨 Message Designer Bot - Commands')
      .setDescription('Transform your messages with cool embeds!')
      .addFields(
        { name: '!embed <message>', value: 'Creates a basic stylish embed', inline: false },
        { name: '!auto <message>', value: '✨ Auto-adds emojis and fancy fonts', inline: false },
        { name: '!fancy <message>', value: 'Creates a fancy gradient embed (first line = title)', inline: false },
        { name: '!ticket <message>', value: '🎫 Creates a ticket panel with button', inline: false },
        { name: '!createweb <n>', value: '🔗 Creates private channel with webhook', inline: false },
        { name: '!done', value: '✅ Mark ticket as done (Admin/Owner, ticket only)', inline: false },
        { name: '!concategory <id>', value: '⚙️ Set ticket category (Admin only)', inline: false },
        { name: '!conweb <id>', value: '⚙️ Set webhook channel category (Admin only)', inline: false },
        { name: '!conorders <id>', value: '⚙️ Set orders log channel (Admin only)', inline: false },
        { name: '!condone <id>', value: '⚙️ Set done log channel (Admin only)', inline: false },
        { name: '!admadm <user_id>', value: '👑 Add admin (Owner only)', inline: false },
        { name: '!admrem <user_id>', value: '👑 Remove admin (Owner only)', inline: false },
        { name: '!admlist', value: '👑 List all admins', inline: false },
        { name: '!announce <message>', value: 'Creates an announcement embed', inline: false },
        { name: '!quote <message>', value: 'Creates a quote-style embed', inline: false },
        { name: '!colorembed <#hex> <message>', value: 'Creates an embed with custom color', inline: false },
        { name: '!success <message>', value: 'Creates a success message', inline: false },
        { name: '!error <message>', value: 'Creates an error message', inline: false },
        { name: '!info <message>', value: 'Creates an info message', inline: false }
      )
      .setFooter({ text: 'Made with ❤️ by your team' })
      .setTimestamp();

    message.reply({ embeds: [helpEmbed] });
  }
});

// Button interactions
client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton()) {
    if (interaction.customId === 'create_ticket') {
      const categoryId = ticketCategories.get(interaction.guild.id);

      if (!categoryId) {
        return interaction.reply({ 
          content: '❌ Ticket category not set! Ask an admin to use `!concategory <category_id>`', 
          ephemeral: true 
        });
      }

      const category = interaction.guild.channels.cache.get(categoryId);
      if (!category) {
        return interaction.reply({ 
          content: '❌ Ticket category no longer exists!', 
          ephemeral: true 
        });
      }

      const existingTicket = interaction.guild.channels.cache.find(
        ch => ch.name === `ticket-${interaction.user.username.toLowerCase()}` && ch.parentId === categoryId
      );

      if (existingTicket) {
        return interaction.reply({ 
          content: `❌ You already have an open ticket: <#${existingTicket.id}>`, 
          ephemeral: true 
        });
      }

      const modal = new ModalBuilder()
        .setCustomId('ticket_modal')
        .setTitle('Create Support Ticket');

      const serviceInput = new TextInputBuilder()
        .setCustomId('service_type')
        .setLabel('What Service You Will Avail?')
        .setPlaceholder('Describe Your Service You Want')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      const actionRow = new ActionRowBuilder().addComponents(serviceInput);
      modal.addComponents(actionRow);

      await interaction.showModal(modal);
    }

    if (interaction.customId === 'close_ticket') {
      if (!interaction.channel.name.startsWith('ticket-')) {
        return interaction.reply({ 
          content: '❌ This is not a ticket channel!', 
          ephemeral: true 
        });
      }

      await interaction.reply('🔒 Closing ticket in 5 seconds...');

      setTimeout(async () => {
        const ticketId = interaction.channel.id;
        const createdChannels = ticketChannels.get(ticketId) || [];

        for (const channelId of createdChannels) {
          const channelToDelete = interaction.guild.channels.cache.get(channelId);
          if (channelToDelete) {
            await channelToDelete.delete().catch(console.error);
          }
        }

        ticketChannels.delete(ticketId);
        await interaction.channel.delete();
      }, 5000);
    }

    if (interaction.customId === 'done_ticket') {
      if (!interaction.channel.name.startsWith('ticket-')) {
        return interaction.reply({ 
          content: '❌ This is not a ticket channel!', 
          ephemeral: true 
        });
      }

      const ticketOwnerName = interaction.channel.name.replace('ticket-', '');
      const ticketOwner = interaction.guild.members.cache.find(m => m.user.username.toLowerCase() === ticketOwnerName.toLowerCase());

      if (!ticketOwner) {
        return interaction.reply({ 
          content: '❌ Could not find ticket owner!', 
          ephemeral: true 
        });
      }

      const doneButton = new ButtonBuilder()
        .setCustomId('owner_done_confirmation')
        .setLabel('Yes, Mark as Done')
        .setEmoji('✅')
        .setStyle(ButtonStyle.Success);

      const cancelButton = new ButtonBuilder()
        .setCustomId('owner_cancel_done')
        .setLabel('Not Yet')
        .setEmoji('❌')
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(doneButton, cancelButton);

      await interaction.reply({ 
        content: `${ticketOwner.user}\n\n**Do you want to mark this ticket as done?**\nClick the button below to confirm.`,
        components: [row]
      });
    }

    if (interaction.customId === 'owner_done_confirmation') {
      const doneChannelId = doneChannels.get(interaction.guild.id);

      if (doneChannelId) {
        const doneChannel = interaction.guild.channels.cache.get(doneChannelId);
        if (doneChannel) {
          const logEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('✅ Ticket Marked as Done')
            .addFields(
              { name: 'Ticket', value: interaction.channel.name, inline: true },
              { name: 'Closed By', value: `${interaction.user.tag}`, inline: true },
              { name: 'Time', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
            )
            .setTimestamp();

          await doneChannel.send({ embeds: [logEmbed] });
        }
      }

      await interaction.update({ 
        content: '✅ Ticket marked as done! Closing in 5 seconds...', 
        components: [] 
      });

      setTimeout(async () => {
        const ticketId = interaction.channel.id;
        const createdChannels = ticketChannels.get(ticketId) || [];

        for (const channelId of createdChannels) {
          const channelToDelete = interaction.guild.channels.cache.get(channelId);
          if (channelToDelete) {
            await channelToDelete.delete().catch(console.error);
          }
        }

        ticketChannels.delete(ticketId);
        await interaction.channel.delete();
      }, 5000);
    }

    if (interaction.customId === 'owner_cancel_done') {
      await interaction.update({ 
        content: '❌ Cancelled. Ticket remains open.', 
        components: [] 
      });
    }
  }

  // Modal submission
  if (interaction.isModalSubmit()) {
    if (interaction.customId === 'ticket_modal') {
      const serviceType = interaction.fields.getTextInputValue('service_type');
      const categoryId = ticketCategories.get(interaction.guild.id);

      try {
        const ticketChannel = await interaction.guild.channels.create({
          name: `ticket-${interaction.user.username.toLowerCase()}`,
          type: ChannelType.GuildText,
          parent: categoryId,
          permissionOverwrites: [
            {
              id: interaction.guild.id,
              deny: [PermissionFlagsBits.ViewChannel],
            },
            {
              id: interaction.user.id,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory,
              ],
            },
            {
              id: client.user.id,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory,
              ],
            },
            {
              id: OWNER_ID,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory,
              ],
            },
          ],
        });

        const admins = adminUsers.get(interaction.guild.id) || [];
        for (const adminId of admins) {
          await ticketChannel.permissionOverwrites.create(adminId, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true,
          });
        }

        const staffRole = interaction.guild.roles.cache.find(r => 
          r.name.toLowerCase().includes('staff') || 
          r.name.toLowerCase().includes('admin') ||
          r.name.toLowerCase().includes('mod')
        );

        if (staffRole) {
          await ticketChannel.permissionOverwrites.create(staffRole, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true,
          });
        }

        const embed = new EmbedBuilder()
          .setColor('#00BFFF')
          .setTitle('🎫 New Support Ticket')
          .setDescription(`**Ticket Owner:** ${interaction.user}\n**Service Requested:**\n${serviceType}`)
          .addFields(
            { name: 'Status', value: '🟢 Open', inline: true },
            { name: 'Created', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
          )
          .setTimestamp()
          .setFooter({ text: 'Support Team will assist you shortly' });

        const closeButton = new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('Close Ticket')
          .setEmoji('🔒')
          .setStyle(ButtonStyle.Danger);

        const doneButton = new ButtonBuilder()
          .setCustomId('done_ticket')
          .setLabel('Mark as Done')
          .setEmoji('✅')
          .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(doneButton, closeButton);

        await ticketChannel.send({
          content: `${interaction.user} | <@&${staffRole?.id || ''}>`,
          embeds: [embed],
          components: [row],
        });

        const orderChannelId = orderChannels.get(interaction.guild.id);
        if (orderChannelId) {
          const orderChannel = interaction.guild.channels.cache.get(orderChannelId);
          if (orderChannel) {
            const orderEmbed = new EmbedBuilder()
              .setColor('#FFA500')
              .setTitle('📋 New Order/Ticket Created')
              .addFields(
                { name: 'User', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
                { name: 'Channel', value: `<#${ticketChannel.id}>`, inline: true },
                { name: 'Service', value: serviceType, inline: false },
                { name: 'Created At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
              )
              .setTimestamp();

            await orderChannel.send({ embeds: [orderEmbed] });
          }
        }

        await interaction.reply({
          content: `✅ Ticket created! Check <#${ticketChannel.id}>`,
          ephemeral: true,
        });

      } catch (err) {
        console.error('Ticket Creation Error:', err);
        await interaction.reply({
          content: '❌ Failed to create ticket! Please contact an administrator.',
          ephemeral: true,
        });
      }
    }
  }
});

// Login
client.login(process.env.TOKEN);