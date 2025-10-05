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

client.once('ready', () => {
  console.log(`✅ Bot is online as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

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
            .setDescription(`**${ticketOwner ? ticketOwner.user.tag : ticketOwnerName}** Received His Service`)
            .addFields({ name: 'Service Ordered:', value: serviceDescription })
            .setTimestamp();

          const sentMessage = await doneChannel.send({ 
            content: `${interaction.user}`, 
            embeds: [doneEmbed] 
          });
          
          // Add checkmark reaction as proof
          await sentMessage.react('✅');
        }
      }

      await interaction.reply('✅ Service marked as done! Closing ticket in 5 seconds...');

      setTimeout(async () => {
        await interaction.channel.delete();
      }, 5000);
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