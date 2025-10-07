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

// Store ticket category per server
const ticketCategories = new Map();
const orderChannels = new Map();
const doneChannels = new Map();
const adminUsers = new Map(); // Store admins per server
const ticketChannels = new Map(); // Store created channels per ticket

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
    return message.reply('❌ You don\'t have permission to use bot commands!');
  }

  // !embed <message> - Creates a stylish embed
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

  // !fancy <message> - Creates a fancy gradient embed with first line as title
  if (command === 'fancy') {
    const fullText = args.join(' ');
    if (!fullText) {
      return message.reply('Please provide a message! Usage: `!fancy Title\nYour message here`');
    }

    // Split by line breaks - first line is title, rest is description
    const lines = fullText.split('\n');
    const title = lines[0]; // First line = title
    const text = lines.slice(1).join('\n'); // Rest = description

    const embed = new EmbedBuilder()
      .setColor('#FF00FF')
      .setTitle(`✨ ${title} ✨`)
      .setTimestamp()
      .setFooter({ text: message.author.username, iconURL: message.author.displayAvatarURL() })
      .setThumbnail(message.author.displayAvatarURL());

    // Only add description if there's text after the title
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

  // !announce <message> - Creates an announcement embed
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

  // !quote <message> - Creates a quote embed
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

  // !colorembed <color> <message> - Creates a custom colored embed
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

  // !success <message> - Success message embed
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
      await message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error(err);
    }
  }

  // !error <message> - Error message embed
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
      await message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error(err);
    }
  }

  // !info <message> - Info message embed
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
      await message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error(err);
    }
  }

  // !auto <message> - Auto-adds emojis to keywords and fancy fonts
  if (command === 'auto') {
    let text = args.join(' ');
    if (!text) {
      return message.reply('Please provide a message! Usage: `!auto Your message here`');
    }

    // Convert text to fancy font
    const fancyFont = (str) => {
      const normal = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const fancy = '𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵';
      
      return str.split('').map(char => {
        const index = normal.indexOf(char);
        return index !== -1 ? fancy[index] : char;
      }).join('');
    };

    // Convert to fancy font first
    text = fancyFont(text);

    // Split into lines and add emojis at the start of relevant lines
    const lines = text.split('\n');
    const processedLines = lines.map(line => {
      const lowerLine = line.toLowerCase();
      
      // Check what the line is about and add appropriate emoji at the start
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
      
      return `✨ ${line}`; // Default emoji for other lines
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

  // !concategory <category_id> - Set ticket category
  if (command === 'concategory') {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply('❌ You need Administrator permission to use this command!');
    }

    const categoryId = args[0];
    if (!categoryId) {
      return message.reply('Please provide a category ID! Usage: `!concategory CATEGORY_ID`\nRight-click a category → Copy ID (enable Developer Mode first)');
    }

    const category = message.guild.channels.cache.get(categoryId);
    if (!category || category.type !== ChannelType.GuildCategory) {
      return message.reply('❌ Invalid category ID! Make sure it\'s a category, not a channel.');
    }

    ticketCategories.set(message.guild.id, categoryId);
    message.reply(`✅ Ticket category set to: **${category.name}**`);
  }

  // !conorders <channel_id> - Set orders log channel
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

  // !condone <channel_id> - Set done log channel
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

  // !createweb <channel_name> - Creates a channel with webhook (Admin/Owner only, always private)
  if (command === 'createweb') {
    const channelName = args.join('-').toLowerCase();
    
    if (!channelName) {
      return message.reply('Please provide a channel name! Usage: `!createweb channel-name`');
    }

    try {
      let permissionOverwrites = [];
      let ticketOwner = null;

      // Check if command is used in a ticket to get ticket owner
      if (message.channel.name.startsWith('ticket-')) {
        const ticketOwnerName = message.channel.name.replace('ticket-', '');
        ticketOwner = message.guild.members.cache.find(m => m.user.username.toLowerCase() === ticketOwnerName.toLowerCase());
      }

      // Always create as private channel
      // Default permissions - hide from everyone
      permissionOverwrites.push({
        id: message.guild.id,
        deny: [PermissionFlagsBits.ViewChannel],
      });

      // Add bot permissions
      permissionOverwrites.push({
        id: client.user.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageWebhooks],
      });

      // Add ticket owner permissions if in ticket
      if (ticketOwner) {
        permissionOverwrites.push({
          id: ticketOwner.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
        });
      }

      // Add owner permissions
      permissionOverwrites.push({
        id: OWNER_ID,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
      });

      // Add admin permissions
      const admins = adminUsers.get(message.guild.id) || [];
      for (const adminId of admins) {
        permissionOverwrites.push({
          id: adminId,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
        });
      }

      // Add staff role permissions if exists
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

      // Create the channel
      const newChannel = await message.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        permissionOverwrites: permissionOverwrites,
      });

      // If in a ticket, store the channel ID to delete later
      if (message.channel.name.startsWith('ticket-')) {
        const ticketId = message.channel.id;
        if (!ticketChannels.has(ticketId)) {
          ticketChannels.set(ticketId, []);
        }
        ticketChannels.get(ticketId).push(newChannel.id);
      }

      // Create webhook in the new channel
      const webhook = await newChannel.createWebhook({
        name: `${channelName}-webhook`,
        avatar: client.user.displayAvatarURL(),
      });

      // Send webhook URL (not embedded for easy copy)
      await message.channel.send(`✅ Channel created: <#${newChannel.id}>\n\n**Webhook URL:**\n${webhook.url}`);

    } catch (err) {
      console.error(err);
      message.reply('❌ Failed to create channel/webhook! Make sure I have proper permissions.');
    }
  }

  // !done - Ask ticket owner to mark as done (Admin/Owner only, must be in ticket)
  if (command === 'done') {
    if (!message.channel.name.startsWith('ticket-')) {
      return message.reply('❌ This command can only be used in ticket channels!');
    }

    // Get the ticket creator from channel name
    const ticketOwnerName = message.channel.name.replace('ticket-', '');
    const ticketOwner = message.guild.members.cache.find(m => m.user.username.toLowerCase() === ticketOwnerName.toLowerCase());

    if (!ticketOwner) {
      return message.reply('❌ Could not find ticket owner!');
    }

    // Create Done button for ticket owner
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

    // Delete the command message
    await message.delete().catch(() => {});
  }

  // !ticket <message> - Create ticket panel with button
  if (command === 'ticket') {
    const fullText = args.join(' ');
    if (!fullText) {
      return message.reply('Please provide a message! Usage: `!ticket Title\nDescription here`');
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
      await message.channel.send({ embeds: [embed], components: [row] });
    } catch (err) {
      console.error(err);
      message.reply('❌ Failed to create ticket panel!');
    }
  }

  // !help - Shows all available commands
  if (command === 'help') {
    const helpEmbed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🎨 Message Designer Bot - Commands')
      .setDescription('Transform your messages with cool embeds!')
      .addFields(
        { name: '!embed <message>', value: 'Creates a basic stylish embed', inline: false },
        { name: '!auto <message>', value: '✨ Auto-adds emojis to keywords in your message', inline: false },
        { name: '!fancy <message>', value: 'Creates a fancy gradient embed with your avatar', inline: false },
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

client.login(process.env.TOKEN);

// Handle button clicks for ticket creation
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

      // Check if user already has an open ticket
      const existingTicket = interaction.guild.channels.cache.find(
        ch => ch.name === `ticket-${interaction.user.username.toLowerCase()}` && ch.parentId === categoryId
      );

      if (existingTicket) {
        return interaction.reply({ 
          content: `❌ You already have an open ticket: <#${existingTicket.id}>`, 
          ephemeral: true 
        });
      }

      // Show modal form
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
        // Delete any channels created with !createweb for this ticket
        const ticketId = interaction.channel.id;
        const createdChannels = ticketChannels.get(ticketId) || [];
        
        for (const channelId of createdChannels) {
          const channelToDelete = interaction.guild.channels.cache.get(channelId);
          if (channelToDelete) {
            await channelToDelete.delete().catch(console.error);
          }
        }
        
        // Remove from map
        ticketChannels.delete(ticketId);
        
        // Delete the ticket channel
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

      // Get the ticket creator from channel name
      const ticketOwnerName = interaction.channel.name.replace('ticket-', '');
      const ticketOwner = interaction.guild.members.cache.find(m => m.user.username.toLowerCase() === ticketOwnerName.toLowerCase());

      // Check if the person clicking is the ticket creator
      if (ticketOwner && interaction.user.id !== ticketOwner.id) {
        return interaction.reply({ 
          content: '❌ Only the ticket creator can mark this as done!', 
          ephemeral: true 
        });
      }

      // Create confirmation buttons for admins
      const confirmButton = new ButtonBuilder()
        .setCustomId('confirm_done')
        .setLabel('Confirm Done')
        .setEmoji('✅')
        .setStyle(ButtonStyle.Success);

      const denyButton = new ButtonBuilder()
        .setCustomId('deny_done')
        .setLabel('Deny')
        .setEmoji('❌')
        .setStyle(ButtonStyle.Danger);

      const confirmRow = new ActionRowBuilder().addComponents(confirmButton, denyButton);

      await interaction.reply({ 
        content: `⏳ **${interaction.user}** marked this ticket as done!\n\n**Admins/Staff:** Please confirm if the service was completed.`,
        components: [confirmRow]
      });
    }

    if (interaction.customId === 'owner_done_confirmation') {
      if (!interaction.channel.name.startsWith('ticket-')) {
        return interaction.reply({ 
          content: '❌ This is not a ticket channel!', 
          ephemeral: true 
        });
      }

      // Get the ticket creator from channel name
      const ticketOwnerName = interaction.channel.name.replace('ticket-', '');
      const ticketOwner = interaction.guild.members.cache.find(m => m.user.username.toLowerCase() === ticketOwnerName.toLowerCase());

      // Check if the person clicking is the ticket creator
      if (ticketOwner && interaction.user.id !== ticketOwner.id) {
        return interaction.reply({ 
          content: '❌ Only the ticket creator can click this!', 
          ephemeral: true 
        });
      }

      // Create confirmation buttons for admins
      const confirmButton = new ButtonBuilder()
        .setCustomId('confirm_done')
        .setLabel('Confirm Done')
        .setEmoji('✅')
        .setStyle(ButtonStyle.Success);

      const denyButton = new ButtonBuilder()
        .setCustomId('deny_done')
        .setLabel('Deny')
        .setEmoji('❌')
        .setStyle(ButtonStyle.Danger);

      const confirmRow = new ActionRowBuilder().addComponents(confirmButton, denyButton);

      await interaction.update({ 
        content: `⏳ **${interaction.user}** marked this ticket as done!\n\n**Admins/Staff:** Please confirm if the service was completed.`,
        components: [confirmRow]
      });
    }

    if (interaction.customId === 'owner_cancel_done') {
      if (!interaction.channel.name.startsWith('ticket-')) {
        return interaction.reply({ 
          content: '❌ This is not a ticket channel!', 
          ephemeral: true 
        });
      }

      // Get the ticket creator from channel name
      const ticketOwnerName = interaction.channel.name.replace('ticket-', '');
      const ticketOwner = interaction.guild.members.cache.find(m => m.user.username.toLowerCase() === ticketOwnerName.toLowerCase());

      // Check if the person clicking is the ticket creator
      if (ticketOwner && interaction.user.id !== ticketOwner.id) {
        return interaction.reply({ 
          content: '❌ Only the ticket creator can click this!', 
          ephemeral: true 
        });
      }

      await interaction.update({ 
        content: `❌ **${interaction.user}** cancelled the done request.\n\nTicket will remain open.`,
        components: []
      });
    }

    if (interaction.customId === 'confirm_done') {
      // Check if user is owner or admin
      const isOwner = interaction.user.id === OWNER_ID;
      const admins = adminUsers.get(interaction.guild.id) || [];
      const isAdmin = admins.includes(interaction.user.id);

      if (!isOwner && !isAdmin) {
        return interaction.reply({ 
          content: '❌ Only admins can confirm this!', 
          ephemeral: true 
        });
      }

      // Get the ticket creator from channel name
      const ticketOwnerName = interaction.channel.name.replace('ticket-', '');
      const ticketOwner = interaction.guild.members.cache.find(m => m.user.username.toLowerCase() === ticketOwnerName.toLowerCase());

      // Get service description from first message
      const messages = await interaction.channel.messages.fetch({ limit: 1 });
      const firstMessage = messages.first();
      let serviceDescription = 'N/A';
      
      if (firstMessage && firstMessage.content.includes('Service Request:')) {
        serviceDescription = firstMessage.content.split('Service Request:')[1].trim();
      }

      // Send to done log channel
      const doneChannelId = doneChannels.get(interaction.guild.id);
      if (doneChannelId) {
        const doneChannel = interaction.guild.channels.cache.get(doneChannelId);
        if (doneChannel) {
          const doneEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('✅ Service Completed')
            .setDescription(`**${ticketOwner ? ticketOwner.user.tag : ticketOwnerName}** Received His Service\n\nConfirmed by: ${interaction.user}`)
            .addFields({ name: 'Service Ordered:', value: serviceDescription })
            .setTimestamp();

          const sentMessage = await doneChannel.send({ 
            content: `${ticketOwner ? ticketOwner.user : ticketOwnerName}`, 
            embeds: [doneEmbed] 
          });
          
          // Add checkmark reaction as proof
          await sentMessage.react('✅');
        }
      }

      await interaction.update({ 
        content: `✅ **Service confirmed as completed by ${interaction.user}!**\n\nClosing ticket in 5 seconds...`,
        components: []
      });

      setTimeout(async () => {
        // Delete any channels created with !createweb for this ticket
        const ticketId = interaction.channel.id;
        const createdChannels = ticketChannels.get(ticketId) || [];
        
        for (const channelId of createdChannels) {
          const channelToDelete = interaction.guild.channels.cache.get(channelId);
          if (channelToDelete) {
            await channelToDelete.delete().catch(console.error);
          }
        }
        
        // Remove from map
        ticketChannels.delete(ticketId);
        
        // Delete the ticket channel
        await interaction.channel.delete();
      }, 5000);
    }

    if (interaction.customId === 'deny_done') {
      // Check if user is owner or admin
      const isOwner = interaction.user.id === OWNER_ID;
      const admins = adminUsers.get(interaction.guild.id) || [];
      const isAdmin = admins.includes(interaction.user.id);

      if (!isOwner && !isAdmin) {
        return interaction.reply({ 
          content: '❌ Only admins can deny this!', 
          ephemeral: true 
        });
      }

      await interaction.update({ 
        content: `❌ **Request denied by ${interaction.user}.**\n\nThe service is not yet complete. Please continue working on it.`,
        components: []
      });
    }
  }

  // Handle modal submission
  if (interaction.isModalSubmit()) {
    if (interaction.customId === 'ticket_modal') {
      const serviceDescription = interaction.fields.getTextInputValue('service_type');
      const categoryId = ticketCategories.get(interaction.guild.id);
      
      try {
        // Create ticket channel
        const ticketChannel = await interaction.guild.channels.create({
          name: `ticket-${interaction.user.username}`,
          type: ChannelType.GuildText,
          parent: categoryId,
          permissionOverwrites: [
            {
              id: interaction.guild.id,
              deny: [PermissionFlagsBits.ViewChannel],
            },
            {
              id: interaction.user.id,
              allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
            },
            {
              id: interaction.client.user.id,
              allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
            },
          ],
        });

        // Add staff role permissions if exists
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

        // Create buttons
        const doneButton = new ButtonBuilder()
          .setCustomId('done_ticket')
          .setLabel('Done')
          .setEmoji('✅')
          .setStyle(ButtonStyle.Success);

        const closeButton = new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('Close Ticket')
          .setEmoji('🔒')
          .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(doneButton, closeButton);

        // Send simple message without embed
        await ticketChannel.send({ 
          content: `@everyone\n\n🎫 **Ticket Created by ${interaction.user}**\n\n**Service Request:**\n${serviceDescription}`, 
          components: [row],
          allowedMentions: { parse: ['everyone'] }
        });

        // Send to orders log channel
        const orderChannelId = orderChannels.get(interaction.guild.id);
        if (orderChannelId) {
          const orderChannel = interaction.guild.channels.cache.get(orderChannelId);
          if (orderChannel) {
            const orderEmbed = new EmbedBuilder()
              .setColor('#FFA500')
              .setTitle('📦 New Order')
              .setDescription(`**${interaction.user.tag}** has ordered`)
              .addFields({ name: 'Service Ordered:', value: serviceDescription })
              .setTimestamp();

            await orderChannel.send({ embeds: [orderEmbed] });
          }
        }

        interaction.reply({ 
          content: `✅ Ticket created! <#${ticketChannel.id}>`, 
          ephemeral: true 
        });

      } catch (err) {
        console.error(err);
        interaction.reply({ 
          content: '❌ Failed to create ticket! Make sure the bot has proper permissions.', 
          ephemeral: true 
        });
      }
    }
  }
});