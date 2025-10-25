});

client.on('interactionCreate', async (int) => {
  if (!int.isButton() && !int.isModalSubmit() && !int.isStringSelectMenu()) return;

  if (int.isButton()) {
    if (int.customId === 'shop_browse') {
      const gg = gameCategories.get(int.guild.id) || [];
      if (gg.length === 0) return int.reply({ content: '❌ No game categories! Ask admin to use `!addgame Game Name`', ephemeral: true });
      const guideE = new EmbedBuilder().setColor('#FFD700').setTitle('🛍️ Shop Guide - How to Browse').setDescription('**Follow these simple steps:**\n\n1️⃣ Select a game category below\n2️⃣ Browse available items\n3️⃣ Select an item you want\n4️⃣ A private shop ticket will open\n5️⃣ Complete the trade with the seller\n\n**Tip:** Only items with stock available will show!').setFooter({ text: 'Select a game category to start shopping' }).setTimestamp();
      const opts = gg.slice(0, 25).map(g => ({ label: g, description: `Browse ${g} items`, value: g }));
      const sel = new StringSelectMenuBuilder().setCustomId('shop_select_game').setPlaceholder('🎮 Select a game category').addOptions(opts);
      const row = new ActionRowBuilder().addComponents(sel);
      int.reply({ embeds: [guideE], components: [row], ephemeral: true });
    }

    if (int.customId === 'shop_manage') {
      const guideE = new EmbedBuilder().setColor('#5865F2').setTitle('⚙️ Shop Management Guide').setDescription('**Choose an action below:**\n\n➕ **Add Item** - List a new item in the shop\n• Select game category\n• Enter item details\n• Set price and stock\n\n✏️ **Change Item** - Update existing item\n• Modify name, price, or stock\n• Changes are instant\n\n🗑️ **Remove Item** - Delete item from shop\n• Permanently removes listing\n• Cannot be undone').setFooter({ text: 'Select an option below to continue' }).setTimestamp();
      const b1 = new ButtonBuilder().setCustomId('shop_add').setLabel('Add Item').setEmoji('➕').setStyle(ButtonStyle.Success);
      const b2 = new ButtonBuilder().setCustomId('shop_remove').setLabel('Remove Item').setEmoji('➖').setStyle(ButtonStyle.Danger);
      const b3 = new ButtonBuilder().setCustomId('shop_change').setLabel('Change Item').setEmoji('✏️').setStyle(ButtonStyle.Primary);
      const row = new ActionRowBuilder().addComponents(b1, b2, b3);
      int.reply({ embeds: [guideE], components: [row], ephemeral: true });
    }

    if (int.customId === 'shop_add') {
      const gg = gameCategories.get(int.guild.id) || [];
      if (gg.length === 0) return int.reply({ content: '❌ No game categories! Ask admin to use `!addgame Game Name`', ephemeral: true });
      const guideE = new EmbedBuilder().setColor('#00FF00').setTitle('➕ Add New Item - Step 1').setDescription('**Select the game category for your item:**\n\nThis helps buyers find your items easily!\n\n**Next steps:**\n2️⃣ Enter item name\n3️⃣ Set stock amount\n4️⃣ Set price\n5️⃣ Item goes live!').setFooter({ text: 'Choose a game category below' }).setTimestamp();
      const opts = gg.slice(0, 25).map(g => ({ label: g, description: `Add item to ${g}`, value: g }));
      const sel = new StringSelectMenuBuilder().setCustomId('shop_add_select_game').setPlaceholder('🎮 Select game category for your item').addOptions(opts);
      const row = new ActionRowBuilder().addComponents(sel);
      int.reply({ embeds: [guideE], components: [row], ephemeral: true });
    }

    if (int.customId === 'shop_remove') {
      const gs = shopListings.get(int.guild.id) || new Map();
      const ui = gs.get(int.user.id) || [];
      if (ui.length === 0) return int.reply({ content: '❌ No items!', ephemeral: true });
      const guideE = new EmbedBuilder().setColor('#FF6B6B').setTitle('🗑️ Remove Item Guide').setDescription('**Warning:**\n\n⚠️ This will permanently delete the item\n⚠️ Cannot be undone\n⚠️ Buyers will no longer see this item\n\n**Select the item you want to remove:**').setFooter({ text: 'You will be asked to confirm' }).setTimestamp();
      const opts = ui.slice(0, 25).map(i => ({ label: `${i.name} (Stock: ${i.stock || 0})`, description: `${i.gameCategory || 'No category'} - Price: ${i.price}`, value: i.id }));
      const sel = new StringSelectMenuBuilder().setCustomId('shop_remove_select').setPlaceholder('Select item to remove').addOptions(opts);
      const row = new ActionRowBuilder().addComponents(sel);
      int.reply({ embeds: [guideE], components: [row], ephemeral: true });
    }

    if (int.customId === 'shop_change') {
      const gs = shopListings.get(int.guild.id) || new Map();
      const ui = gs.get(int.user.id) || [];
      if (ui.length === 0) return int.reply({ content: '❌ No items!', ephemeral: true });
      const guideE = new EmbedBuilder().setColor('#5865F2').setTitle('✏️ Change Item Guide').setDescription('**You can update:**\n\n📝 Item name\n💰 Price\n📦 Stock amount\n\n**Note:**\n• Changes are instant\n• Buyers will see updated info\n• Game category cannot be changed\n\n**Select the item you want to edit:**').setFooter({ text: 'A form will open with current values' }).setTimestamp();
      const opts = ui.slice(0, 25).map(i => ({ label: `${i.name} (Stock: ${i.stock || 0})`, description: `${i.gameCategory || 'No category'} - Price: ${i.price}`, value: i.id }));
      const sel = new StringSelectMenuBuilder().setCustomId('shop_change_select').setPlaceholder('Select item to edit').addOptions(opts);
      const row = new ActionRowBuilder().addComponents(sel);
      int.reply({ embeds: [guideE], components: [row], ephemeral: true });
    }

    if (int.customId === 'create_ticket') {
      const cid = ticketCategories.get(int.guild.id);
      if (!cid) return int.reply({ content: '❌ Category not set!', ephemeral: true });
      const cat = int.guild.channels.cache.get(cid);
      if (!cat) return int.reply({ content: '❌ Category not found!', ephemeral: true });
      const existing = int.guild.channels.cache.find(ch => ch.name === `ticket-${int.user.username.toLowerCase()}` && ch.parentId === cid);
      if (existing) return int.reply({ content: `❌ You have a ticket: <#${existing.id}>`, ephemeral: true });
      const mod = new ModalBuilder().setCustomId('ticket_modal').setTitle('Create Ticket');
      const inp = new TextInputBuilder().setCustomId('service_type').setLabel('What Service You Will Avail?').setPlaceholder('Describe your service').setStyle(TextInputStyle.Paragraph).setRequired(true);
      mod.addComponents(new ActionRowBuilder().addComponents(inp));
      await int.showModal(mod);
    }

    if (int.customId.startsWith('shop_buyer_done_')) {
      const parts = int.customId.replace('shop_buyer_done_', '').split('_');
      const sid = parts[0], iid = parts[1];
      const tid = ticketOwners.get(int.channel.id);
      if (tid && int.user.id !== tid) return int.reply({ content: '❌ Only the buyer can mark this as done!', ephemeral: true });
      const guideE = new EmbedBuilder().setColor('#00FF00').setTitle('✅ Transaction Complete?').setDescription('**You are confirming transaction completion.**\n\n**What happens next:**\n1️⃣ Admin receives notification\n2️⃣ Admin reviews the transaction\n3️⃣ Admin confirms completion\n4️⃣ Stock decreases by 1\n5️⃣ Logged to done & trade channels\n6️⃣ Ticket closes automatically\n\n**Note:** Make sure you received the item!').setFooter({ text: 'Click confirm to proceed' }).setTimestamp();
      const b1 = new ButtonBuilder().setCustomId(`shop_confirm_done_${sid}_${iid}`).setLabel('Yes, I Received It').setEmoji('✅').setStyle(ButtonStyle.Success);
      const b2 = new ButtonBuilder().setCustomId('shop_cancel_done').setLabel('Not Yet').setEmoji('❌').setStyle(ButtonStyle.Danger);
      const row = new ActionRowBuilder().addComponents(b1, b2);
      await int.reply({ content: `${int.user}`, embeds: [guideE], components: [row] });
    }

    if (int.customId.startsWith('shop_confirm_done_')) {
      const parts = int.customId.replace('shop_confirm_done_', '').split('_');
      const sid = parts[0], iid = parts[1];
      const guideE = new EmbedBuilder().setColor('#FFA500').setTitle('⏳ Waiting for Admin Confirmation').setDescription('**Your completion request has been sent!**\n\n**Admin will now:**\n✅ Review the transaction\n✅ Verify completion\n✅ Approve or deny\n\n**Please wait for admin response...**').setFooter({ text: 'Admins have been notified' }).setTimestamp();
      const b1 = new ButtonBuilder().setCustomId(`shop_admin_confirm_${sid}_${iid}`).setLabel('Confirm Transaction').setEmoji('✅').setStyle(ButtonStyle.Success);
      const b2 = new ButtonBuilder().setCustomId('shop_admin_deny').setLabel('Deny').setEmoji('❌').setStyle(ButtonStyle.Danger);
      const row = new ActionRowBuilder().addComponents(b1, b2);
      await int.update({ content: `⏳ **${int.user}** marked transaction as complete!\n\n**@Admins:** Please verify and confirm.`, embeds: [guideE], components: [row] });
    }

    if (int.customId.startsWith('shop_admin_confirm_')) {
      const isOwner = int.user.id === OWNER_ID;
      const admins = adminUsers.get(int.guild.id) || [];
      if (!isOwner && !admins.includes(int.user.id)) return int.reply({ content: '❌ Only admins!', ephemeral: true });
      await int.deferUpdate().catch(() => {});
      const parts = int.customId.replace('shop_admin_confirm_', '').split('_');
      const sid = parts[0], iid = parts[1];
      const bid = ticketOwners.get(int.channel.id) || 'Unknown';
      const gs = shopListings.get(int.guild.id) || new Map();
      const ui = gs.get(sid) || [];
      const item = ui.find(i => i.id === iid);
      if (!item) return int.followUp({ content: '❌ Item not found!', ephemeral: true }).catch(() => {});
      item.stock = Math.max(0, (item.stock || 0) - 1);
      gs.set(sid, ui);
      shopListings.set(int.guild.id, gs);
      await saveData();
      const tcid = tradeChannels.get(int.guild.id);
      if (tcid) {
        const tc = int.guild.channels.cache.get(tcid);
        if (tc) {
          const msg = `╔═══════════════════════════════════╗\n║        ✅ **𝗧𝗥𝗔𝗗𝗘 𝗖𝗢𝗠𝗣𝗟𝗘𝗧𝗘𝗗**        ║\n╚═══════════════════════════════════╝\n\n🎮 **𝗚𝗔𝗠𝗘:** \`${item.gameCategory || 'N/A'}\`\n🛍️ **𝗜𝗧𝗘𝗠:** \`${item.name}\`\n💰 **𝗣𝗥𝗜𝗖𝗘:** \`${item.price}\`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n👤 **𝗦𝗘𝗟𝗟𝗘𝗥:** <@${sid}>\n🛒 **𝗕𝗨𝗬𝗘𝗥:** <@${bid}>\n✅ **𝗖𝗢𝗡𝗙𝗜𝗥𝗠𝗘𝗗 𝗕𝗬:** ${int.user}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n📦 **𝗥𝗘𝗠𝗔𝗜𝗡𝗜𝗡𝗚 𝗦𝗧𝗢𝗖𝗞:** \`${item.stock}\`\n\n⏰ <t:${Math.floor(Date.now() / 1000)}:F>`;
          const sent = await tc.send(msg);
          await sent.react('✅'); await sent.react('🎉'); await sent.react('💰');
        }
      }
      const dcid = doneChannels.get(int.guild.id);
      if (dcid) {
        const dc = int.guild.channels.cache.get(dcid);
        if (dc) {
          const msg = `╔═══════════════════════════════════╗\n║   🎉 **𝗦𝗘𝗥𝗩𝗜𝗖𝗘 𝗗𝗘𝗟𝗜𝗩𝗘𝗥𝗘𝗗**   ║\n╚═══════════════════════════════════╝\n\n🎮 **𝗚𝗔𝗠𝗘:** \`${item.gameCategory || 'N/A'}\`\n📦 **𝗜𝗧𝗘𝗠:** \`${item.name}\`\n💵 **𝗔𝗠𝗢𝗨𝗡𝗧:** \`${item.price}\`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n👤 **𝗦𝗘𝗟𝗟𝗘𝗥:** <@${sid}>\n🛒 **𝗖𝗨𝗦𝗧𝗢𝗠𝗘𝗥:** <@${bid}>\n✅ **𝗖𝗢𝗡𝗙𝗜𝗥𝗠𝗘𝗗 𝗕𝗬:** ${int.user}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n✅ **𝗦𝗧𝗔𝗧𝗨𝗦:** Transaction Completed Successfully\n⏰ **𝗧𝗜𝗠𝗘:** <t:${Math.floor(Date.now() / 1000)}:R>`;
          const sent = await dc.send(msg);
          await sent.react('✅'); await sent.react('🎊'); await sent.react('⭐');
        }
      }
      await int.editReply({ content: `✅ **Transaction confirmed by ${int.user}!**\n\n🛍️ Item: **${item.name}**\n📦 Remaining Stock: **${item.stock}**\n\n🔒 Closing in 5 seconds...`, embeds: [], components: [] }).catch(() => {});
      setTimeout(async () => {
        const tid = int.channel.id;
        const ccs = ticketChannels.get(tid) || [];
        for (const cid of ccs) {
          const ch = int.guild.channels.cache.get(cid);
          if (ch) await ch.delete().catch(() => {});
        }
        ticketChannels.delete(tid); ticketOwners.delete(tid);
        await saveData();
        await int.channel.delete().catch(() => {});
      }, 5000);
    }

    if (int.customId === 'shop_cancel_done') {
      await int.update({ content: `❌ **${int.user}** cancelled.\n\nTransaction not complete yet.`, embeds: [], components: [] });
    }

    if (int.customId === 'shop_admin_deny') {
      const isOwner = int.user.id === OWNER_ID;
      const admins = adminUsers.get(int.guild.id) || [];
      if (!isOwner && !admins.includes(int.user.id)) return int.reply({ content: '❌ Only admins!', ephemeral: true });
      await int.update({ content: `❌ **Denied by ${int.user}.**\n\nTransaction not verified yet.`, embeds: [], components: [] });
    }

    if (int.customId.startsWith('shop_confirm_remove_')) {
      const iid = int.customId.replace('shop_confirm_remove_', '');
      const gs = shopListings.get(int.guild.id) || new Map();
      let ui = gs.get(int.user.id) || [];
      const idx = ui.findIndex(i => i.id === iid);
      if (idx === -1) return int.update({ content: '❌ Not found!', components: [] });
      const removedItem = ui[idx];
      ui.splice(idx, 1);
      gs.set(int.user.id, ui);
      shopListings.set(int.guild.id, gs);
      await saveData();
      const e = new EmbedBuilder().setColor('#FF0000').setAuthor({ name: '🗑️ Item Removed Successfully!', iconURL: int.user.displayAvatarURL() }).setTitle(removedItem.name).setDescription('This item has been removed from your shop.').addFields({ name: '🎮 Game', value: `\`\`\`${removedItem.gameCategory || 'N/A'}\`\`\``, inline: true }, { name: '💰 Price', value: `\`\`\`${removedItem.price}\`\`\``, inline: true }, { name: '📦 Stock', value: `\`\`\`${removedItem.stock || 0}\`\`\``, inline: true }).setThumbnail(int.user.displayAvatarURL({ size: 256 })).setFooter({ text: 'Shop Management System' }).setTimestamp();
      int.update({ embeds: [e], components: [] });
    }

    if (int.customId === 'shop_cancel_remove') {
      int.update({ content: '❌ Cancelled.', components: [] });
    }

    if (int.customId === 'close_ticket') {
      if (!int.channel.name.startsWith('ticket-') && !int.channel.name.startsWith('shop-')) return int.reply({ content: '❌ Not a ticket!', ephemeral: true });
      await int.reply('🔒 Closing in 5 seconds...');
      setTimeout(async () => {
        const tid = int.channel.id;
        const ccs = ticketChannels.get(tid) || [];
        for (const cid of ccs) {
          const ch = int.guild.channels.cache.get(cid);
          if (ch) await ch.delete().catch(() => {});
        }
        ticketChannels.delete(tid); ticketOwners.delete(tid);
        await saveData();
        await int.channel.delete().catch(() => {});
      }, 5000);
    }

    if (int.customId === 'close_ticket_confirm') {
      const isOwner = int.user.id === OWNER_ID;
      const admins = adminUsers.get(int.guild.id) || [];
      if (!isOwner && !admins.includes(int.user.id)) return int.reply({ content: '❌ Only admins!', ephemeral: true });
      await int.update({ content: `🔒 **Closed by ${int.user}**\n\nDeleting in 5 seconds...`, embeds: [], components: [] });
      setTimeout(async () => {
        const tid = int.channel.id;
        const ccs = ticketChannels.get(tid) || [];
        for (const cid of ccs) {
          const ch = int.guild.channels.cache.get(cid);
          if (ch) await ch.delete().catch(() => {});
        }
        ticketChannels.delete(tid); ticketOwners.delete(tid);
        await saveData();
        await int.channel.delete().catch(() => {});
      }, 5000);
    }

    if (int.customId === 'close_ticket_cancel') {
      await int.update({ content: '❌ Close cancelled.', embeds: [], components: [] });
    }

    if (int.customId === 'owner_done_confirmation') {
      if (!int.channel.name.startsWith('ticket-')) return int.reply({ content: '❌ Not a ticket!', ephemeral: true });
      const guideE = new EmbedBuilder().setColor('#00FF00').setTitle('✅ Completion Request Sent').setDescription('**Your request has been sent to admins.**\n\n**What happens next:**\n1️⃣ Admin reviews your request\n2️⃣ Admin checks service completion\n3️⃣ Admin approves or denies\n4️⃣ You will be notified\n\n**Please wait for admin response...**').setFooter({ text: 'Admins will respond shortly' }).setTimestamp();
      const b1 = new ButtonBuilder().setCustomId('confirm_done').setLabel('Confirm Done').setEmoji('✅').setStyle(ButtonStyle.Success);
      const b2 = new ButtonBuilder().setCustomId('deny_done').setLabel('Deny').setEmoji('❌').setStyle(ButtonStyle.Danger);
      const row = new ActionRowBuilder().addComponents(b1, b2);
      await int.update({ content: `⏳ **${int.user}** marked done!\n\n**Admins:** Please confirm.`, embeds: [guideE], components: [row] });
    }

    if (int.customId === 'owner_cancel_done') {
      if (!int.channel.name.startsWith('ticket-')) return int.reply({ content: '❌ Not a ticket!', ephemeral: true });
      await int.update({ content: `❌ **${int.user}** cancelled.\n\nTicket remains open.`, components: [] });
    }

    if (int.customId === 'confirm_done') {
      const isOwner = int.user.id === OWNER_ID;
      const admins = adminUsers.get(int.guild.id) || [];
      if (!isOwner && !admins.includes(int.user.id)) return int.reply({ content: '❌ Only admins!', ephemeral: true });
      await int.deferUpdate().catch(() => {});
      const dcid = doneChannels.get(int.guild.id);
      if (dcid) {
        const dc = int.guild.channels.cache.get(dcid);
        if (dc) {
          const msg = `╔═══════════════════════════════════╗\n║   ✅ **𝗦𝗘𝗥𝗩𝗜𝗖𝗘 𝗖𝗢𝗠𝗣𝗟𝗘𝗧𝗘𝗗**   ║\n╚═══════════════════════════════════╝\n\n🎉 **Service successfully delivered and confirmed!**\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n✅ **𝗖𝗢𝗡𝗙𝗜𝗥𝗠𝗘𝗗 𝗕𝗬:** ${int.user}\n⏰ **𝗧𝗜𝗠𝗘:** <t:${Math.floor(Date.now() / 1000)}:F>`;
          const sent = await dc.send(msg);
          await sent.react('✅'); await sent.react('🎉'); await sent.react('⭐');
        }
      }
      await int.editReply({ content: `✅ **Confirmed by ${int.user}!**\n\nClosing in 5 seconds...`, embeds: [], components: [] }).catch(() => {});
      setTimeout(async () => {
        const tid = int.channel.id;
        const ccs = ticketChannels.get(tid) || [];
        for (const cid of ccs) {
          const ch = int.guild.channels.cache.get(cid);
          if (ch) await ch.delete().catch(() => {});
        }
        ticketChannels.delete(tid); ticketOwners.delete(tid);
        await saveData();
        await int.channel.delete().catch(() => {});
      }, 5000);
    }

    if (int.customId === 'deny_done') {
      const isOwner = int.user.id === OWNER_ID;
      const admins = adminUsers.get(int.guild.id) || [];
      if (!isOwner && !admins.includes(int.user.id)) return int.reply({ content: '❌ Only admins!', ephemeral: true });
      await int.update({ content: `❌ **Denied by ${int.user}.**\n\nNot complete yet.`, embeds: [], components: [] });
    }

    if (int.customId === 'force_done_confirm') {
      const isOwner = int.user.id === OWNER_ID;
      const admins = adminUsers.get(int.guild.id) || [];
      if (!isOwner && !admins.includes(int.user.id)) return int.reply({ content: '❌ Only admins!', ephemeral: true });
      await int.deferUpdate().catch(() => {});
      const dcid = doneChannels.get(int.guild.id);
      if (dcid) {
        const dc = int.guild.channels.cache.get(dcid);
        if (dc) {
          const msg = `╔═══════════════════════════════════╗\n║  ⚡ **𝗙𝗢𝗥𝗖𝗘 𝗖𝗢𝗠𝗣𝗟𝗘𝗧𝗘𝗗**  ║\n╚═══════════════════════════════════╝\n\n⚠️ **Admin force-completed this service**\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n⚡ **𝗙𝗢𝗥𝗖𝗘𝗗 𝗕𝗬:** ${int.user}\n⏰ **𝗧𝗜𝗠𝗘:** <t:${Math.floor(Date.now() / 1000)}:F>`;
          const sent = await dc.send(msg);
          await sent.react('⚡'); await sent.react('✅'); await sent.react('⚠️');
        }
      }
      await int.editReply({ content: `⚡ **Force completed by ${int.user}!**\n\nClosing in 5 seconds...`, embeds: [], components: [] }).catch(() => {});
      setTimeout(async () => {
        const tid = int.channel.id;
        const ccs = ticketChannels.get(tid) || [];
        for (const cid of ccs) {
          const ch = int.guild.channels.cache.get(cid);
          if (ch) await ch.delete().catch(() => {});
        }
        ticketChannels.delete(tid); ticketOwners.delete(tid);
        await saveData();
        await int.channel.delete().catch(() => {});
      }, 5000);
    }

    if (int.customId === 'force_done_cancel') {
      await int.update({ content: '❌ Force done cancelled.', embeds: [], components: [] });
    }
  }

  if (int.isModalSubmit()) {
    if (int.customId === 'ticket_modal') {
      const desc = int.fields.getTextInputValue('service_type');
      const cid = ticketCategories.get(int.guild.id);
      try {
        const tch = await int.guild.channels.create({ name: `ticket-${int.user.username}`, type: ChannelType.GuildText, parent: cid, permissionOverwrites: [{ id: int.guild.id, deny: [PermissionFlagsBits.ViewChannel] }, { id: int.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }, { id: int.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }] });
        const staffRole = int.guild.roles.cache.find(r => r.name.toLowerCase().includes('staff')// Fix for ReadableStream error in Replit
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
    const req = https.request({
      hostname: 'api.jsonbin.io',
      path: `/v3/b/${JSONBIN_BIN_ID}/latest`,
      method: 'GET',
      headers: { 'X-Master-Key': JSONBIN_API_KEY }
    }, (res) => {
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
    shopListings: Object.fromEntries(Array.from(shopListings.entries()).map(([gid, um]) => [gid, Object.fromEntries(um)])),
    ticketOwners: Object.fromEntries(ticketOwners),
    shopCategories: Object.fromEntries(shopCategories),
    transcriptChannels: Object.fromEntries(transcriptChannels),
    tradeChannels: Object.fromEntries(tradeChannels),
    shopNews: Object.fromEntries(shopNews),
    gameCategories: Object.fromEntries(gameCategories)
  };
  return new Promise((resolve) => {
    const jsonData = JSON.stringify(data);
    const req = https.request({
      hostname: 'api.jsonbin.io',
      path: `/v3/b/${JSONBIN_BIN_ID}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': JSONBIN_API_KEY,
        'Content-Length': Buffer.byteLength(jsonData)
      }
    }, (res) => {
      res.on('data', () => {});
      res.on('end', () => {
        if (res.statusCode === 200) console.log('💾 Saved');
        resolve();
      });
    });
    req.on('error', resolve);
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
    ticketCategories: new Map(), orderChannels: new Map(), doneChannels: new Map(), adminUsers: new Map(),
    ticketChannels: new Map(), webCategories: new Map(), shopListings: new Map(), ticketOwners: new Map(),
    shopCategories: new Map(), transcriptChannels: new Map(), tradeChannels: new Map(), shopNews: new Map(), gameCategories: new Map()
  };
}

let ticketCategories = new Map(), orderChannels = new Map(), doneChannels = new Map(), adminUsers = new Map();
let ticketChannels = new Map(), webCategories = new Map(), shopListings = new Map(), ticketOwners = new Map();
let shopCategories = new Map(), transcriptChannels = new Map(), tradeChannels = new Map(), shopNews = new Map(), gameCategories = new Map();

client.once('ready', async () => {
  console.log(`✅ Bot online: ${client.user.tag}`);
  const d = await loadData();
  ticketCategories = d.ticketCategories; orderChannels = d.orderChannels; doneChannels = d.doneChannels;
  adminUsers = d.adminUsers; ticketChannels = d.ticketChannels; webCategories = d.webCategories;
  shopListings = d.shopListings; ticketOwners = d.ticketOwners; shopCategories = d.shopCategories;
  transcriptChannels = d.transcriptChannels; tradeChannels = d.tradeChannels; shopNews = d.shopNews; gameCategories = d.gameCategories;
  console.log('✅ Data loaded');

  setInterval(async () => {
    console.log('🧹 Cleanup...');
    let cleaned = false;
    for (const [tid] of ticketChannels.entries()) {
      if (!client.guilds.cache.find(g => g.channels.cache.has(tid))) {
        ticketChannels.delete(tid); ticketOwners.delete(tid);
        cleaned = true;
      }
    }
    if (cleaned) await saveData();
  }, 3600000);
});

client.on('messageCreate', async (msg) => {
  if (msg.author.bot || !msg.content.startsWith(PREFIX)) return;
  const args = msg.content.slice(PREFIX.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();
  const isOwner = msg.author.id === OWNER_ID;
  const admins = adminUsers.get(msg.guild.id) || [];
  const isAdmin = admins.includes(msg.author.id);
  const canUse = isOwner || isAdmin;

  if (!canUse && !['help', 'admadm', 'admrem', 'admlist', 'listgames'].includes(cmd)) {
    const hasMod = msg.member.roles.cache.some(r => 
      r.name.toLowerCase().includes('moderator') || 
      r.name.toLowerCase().includes('mod') ||
      r.permissions.has(PermissionFlagsBits.Administrator)
    );
    if (!hasMod) return msg.reply('❌ No permission!').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
  }

  if (cmd === 'help') {
    const e = new EmbedBuilder().setColor('#5865F2').setTitle('🎨 Bot Commands - Complete Guide')
      .setDescription('**All available commands and features**')
      .addFields(
        { name: '📝 Embed Commands', value: '`!embed <msg>` - Basic embed\n`!auto <msg>` - Auto-styled embed\n`!fancy <title>\\n<msg>` - Fancy embed\n`!announce <msg>` - Announcement\n`!quote <msg>` - Quote style\n`!colorembed #HEX <msg>` - Custom color\n`!success <msg>` - Success message\n`!error <msg>` - Error message\n`!info <msg>` - Info message', inline: false },
        { name: '🎫 Ticket System', value: '`!ticket <title>\\n<desc>` - Create ticket panel\n`!done` - Mark ticket as done (with guide)\n`!forcedone` - Admin force complete\n`!close` - Admin close ticket\n`!createweb <n>` - Create webhook channel', inline: false },
        { name: '🛒 Shop System', value: '`!shop` - Create shop panel\n`!stock +/- <amount> <user_id> <item>` - Manage stock\nExample: `!stock + 10 123456 Sword`', inline: false },
        { name: '🎮 Game Categories', value: '`!addgame <n>` - Add game category\n`!removegame <n>` - Remove game\n`!listgames` - List all games\nExample: `!addgame Anime Vanguard`', inline: false },
        { name: '⚙️ Configuration (Admin Only)', value: '`!concategory <id>` - Set ticket category\n`!conweb <id>` - Set webhook category\n`!conorders <id>` - Set orders log\n`!condone <id>` - Set done log\n`!conshop <id>` - Set shop category\n`!contrade <id>` - Set trade log\n`!contranscript <id>` - Set transcript log\n`!connews <id>` - Set shop news channel', inline: false },
        { name: '👑 Admin Management (Owner Only)', value: '`!admadm <user_id>` - Add admin\n`!admrem <user_id>` - Remove admin\n`!admlist` - List all admins', inline: false },
        { name: '✨ Features', value: '✅ Game-based categories\n✅ Interactive guides\n✅ Anti-duplicate tickets\n✅ 3-step shop verification\n✅ Stock management\n✅ Auto shop news\n✅ Trade logging\n✅ Auto message cleanup\n✅ Force done & close', inline: false }
      )
      .setFooter({ text: 'Made with ❤️ | All features fully functional' })
      .setTimestamp();
    msg.reply({ embeds: [e] }).then(m => setTimeout(() => m.delete().catch(() => {}), 60000));
    msg.delete().catch(() => {});
  }

  if (cmd === 'admadm' && isOwner) {
    const uid = args[0];
    if (!uid) return msg.reply('Usage: `!admadm USER_ID`').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    const ga = adminUsers.get(msg.guild.id) || [];
    if (ga.includes(uid)) return msg.reply('❌ Already admin!').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    ga.push(uid);
    adminUsers.set(msg.guild.id, ga);
    saveData();
    const u = await client.users.fetch(uid).catch(() => null);
    msg.reply(`✅ Added **${u ? u.tag : uid}** as admin!`).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
    msg.delete().catch(() => {});
  }

  if (cmd === 'admrem' && isOwner) {
    const uid = args[0];
    if (!uid) return msg.reply('Usage: `!admrem USER_ID`').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    const ga = adminUsers.get(msg.guild.id) || [];
    const i = ga.indexOf(uid);
    if (i === -1) return msg.reply('❌ Not admin!').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    ga.splice(i, 1);
    adminUsers.set(msg.guild.id, ga);
    saveData();
    const u = await client.users.fetch(uid).catch(() => null);
    msg.reply(`✅ Removed **${u ? u.tag : uid}**!`).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
    msg.delete().catch(() => {});
  }

  if (cmd === 'admlist' && canUse) {
    const ga = adminUsers.get(msg.guild.id) || [];
    if (ga.length === 0) return msg.reply('📋 No admins!').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    let list = '📋 **Admin List:**\n\n';
    for (const uid of ga) {
      const u = await client.users.fetch(uid).catch(() => null);
      list += `• ${u ? u.tag : uid} (${uid})\n`;
    }
    msg.reply(list).then(m => setTimeout(() => m.delete().catch(() => {}), 30000));
    msg.delete().catch(() => {});
  }

  if (cmd === 'addgame' && canUse) {
    const name = args.join(' ');
    if (!name) return msg.reply('Usage: `!addgame Game Name`\nExample: `!addgame Anime Vanguard`').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    const gg = gameCategories.get(msg.guild.id) || [];
    if (gg.includes(name)) return msg.reply(`❌ **${name}** already exists!`).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    gg.push(name);
    gameCategories.set(msg.guild.id, gg);
    await saveData();
    msg.reply(`✅ Added game category: **${name}**`).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
    msg.delete().catch(() => {});
  }

  if (cmd === 'removegame' && canUse) {
    const name = args.join(' ');
    if (!name) return msg.reply('Usage: `!removegame Game Name`').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    const gg = gameCategories.get(msg.guild.id) || [];
    const i = gg.indexOf(name);
    if (i === -1) return msg.reply(`❌ **${name}** not found!`).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    gg.splice(i, 1);
    gameCategories.set(msg.guild.id, gg);
    await saveData();
    msg.reply(`✅ Removed game category: **${name}**`).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
    msg.delete().catch(() => {});
  }

  if (cmd === 'listgames') {
    const gg = gameCategories.get(msg.guild.id) || [];
    if (gg.length === 0) return msg.reply('📋 No game categories yet! Use `!addgame Game Name` to add one.').then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
    let list = '🎮 **Game Categories:**\n\n';
    gg.forEach((g, idx) => {
      list += `${idx + 1}. ${g}\n`;
    });
    msg.reply(list).then(m => setTimeout(() => m.delete().catch(() => {}), 30000));
    msg.delete().catch(() => {});
  }

  if (cmd === 'stock' && canUse) {
    const action = args[0], amount = parseInt(args[1]), uid = args[2], itemName = args.slice(3).join(' ');
    if (!action || !amount || !uid || !itemName) {
      return msg.reply('Usage: `!stock +/- AMOUNT USER_ID ITEM_NAME`\nExample: `!stock + 10 123456789 Diamond Sword`').then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
    }
    if (action !== '+' && action !== '-') return msg.reply('❌ Action must be `+` or `-`').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    if (isNaN(amount) || amount <= 0) return msg.reply('❌ Amount must be a positive number!').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    const gs = shopListings.get(msg.guild.id) || new Map();
    let ui = gs.get(uid) || [];
    const item = ui.find(i => i.name.toLowerCase() === itemName.toLowerCase());
    if (!item) return msg.reply(`❌ Item **${itemName}** not found for user <@${uid}>!`).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    const old = item.stock || 0;
    item.stock = action === '+' ? old + amount : Math.max(0, old - amount);
    gs.set(uid, ui);
    shopListings.set(msg.guild.id, gs);
    await saveData();
    const u = await client.users.fetch(uid).catch(() => null);
    const e = new EmbedBuilder()
      .setColor(action === '+' ? '#00FF00' : '#FF6B35')
      .setAuthor({ name: action === '+' ? '📈 Stock Increased' : '📉 Stock Decreased', iconURL: msg.guild.iconURL() })
      .setTitle(item.name)
      .setDescription(`Stock has been ${action === '+' ? '**increased**' : '**decreased**'} successfully!`)
      .addFields(
        { name: '🎮 Game', value: `\`\`\`${item.gameCategory || 'N/A'}\`\`\``, inline: true },
        { name: '👤 Seller', value: `${u ? u : `<@${uid}>`}`, inline: true },
        { name: '💰 Price', value: `\`\`\`${item.price}\`\`\``, inline: true },
        { name: '📊 Previous Stock', value: `\`\`\`${old}\`\`\``, inline: true },
        { name: `${action === '+' ? '➕' : '➖'} Change`, value: `\`\`\`${action}${amount}\`\`\``, inline: true },
        { name: '📦 New Stock', value: `\`\`\`${item.stock}\`\`\``, inline: true }
      )
      .setThumbnail(u ? u.displayAvatarURL({ size: 256 }) : msg.guild.iconURL())
      .setFooter({ text: `Updated by ${msg.author.tag}`, iconURL: msg.author.displayAvatarURL() })
      .setTimestamp();
    msg.reply({ embeds: [e] }).then(m => setTimeout(() => m.delete().catch(() => {}), 30000));
    msg.delete().catch(() => {});
    const nid = shopNews.get(msg.guild.id);
    if (nid) {
      const nc = msg.guild.channels.cache.get(nid);
      if (nc) {
        const ne = new EmbedBuilder()
          .setColor(action === '+' ? '#00FF00' : '#FFA500')
          .setAuthor({ name: action === '+' ? '🆕 Fresh Stock Available!' : '⚠️ Stock Update', iconURL: msg.guild.iconURL() })
          .setTitle(item.name)
          .setDescription(`${action === '+' ? '✨ **New stock just arrived!** Get it while it lasts!' : '📊 **Stock has been adjusted**'}`)
          .addFields(
            { name: '🎮 Game', value: `**${item.gameCategory || 'N/A'}**`, inline: true },
            { name: '📦 Stock', value: `**${item.stock}** available`, inline: true },
            { name: '💰 Price', value: `${item.price}`, inline: true },
            { name: '👤 Seller', value: `<@${uid}>`, inline: false }
          )
          .setThumbnail(u ? u.displayAvatarURL({ size: 256 }) : null)
          .setTimestamp();
        const sent = await nc.send({ embeds: [ne] });
        await sent.react(action === '+' ? '🆕' : '📊');
      }
    }
  }

  // EMBED COMMANDS
  if (cmd === 'embed') {
    const txt = args.join(' ');
    if (!txt) return msg.reply('Usage: `!embed Your message here`').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    const e = new EmbedBuilder().setColor('#5865F2').setDescription(txt).setTimestamp()
      .setFooter({ text: `Designed by ${msg.author.username}`, iconURL: msg.author.displayAvatarURL() });
    msg.delete().catch(() => {});
    const sent = await msg.channel.send({ embeds: [e] });
    await sent.react('✨');
  }

  if (cmd === 'fancy') {
    const fullTxt = args.join(' ');
    if (!fullTxt) return msg.reply('Usage: `!fancy Title\\nYour message`').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    const lines = fullTxt.split('\n');
    const title = lines[0];
    const txt = lines.slice(1).join('\n');
    const e = new EmbedBuilder().setColor('#FF00FF').setTitle(`✨ ${title} ✨`).setTimestamp()
      .setFooter({ text: msg.author.username, iconURL: msg.author.displayAvatarURL() })
      .setThumbnail(msg.author.displayAvatarURL());
    if (txt.trim()) e.setDescription(`>>> ${txt}`);
    msg.delete().catch(() => {});
    const sent = await msg.channel.send({ embeds: [e] });
    await sent.react('💖');
  }

  if (cmd === 'announce') {
    const txt = args.join(' ');
    if (!txt) return msg.reply('Usage: `!announce Your announcement`').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    const e = new EmbedBuilder().setColor('#FFA500').setTitle('📢 ANNOUNCEMENT').setDescription(txt).setTimestamp()
      .setFooter({ text: `Announced by ${msg.author.username}`, iconURL: msg.author.displayAvatarURL() });
    msg.delete().catch(() => {});
    const sent = await msg.channel.send({ embeds: [e] });
    await sent.react('📢');
  }

  if (cmd === 'quote') {
    const txt = args.join(' ');
    if (!txt) return msg.reply('Usage: `!quote Your quote`').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    const e = new EmbedBuilder().setColor('#2F3136').setDescription(`*"${txt}"*`)
      .setAuthor({ name: msg.author.username, iconURL: msg.author.displayAvatarURL() }).setTimestamp();
    msg.delete().catch(() => {});
    const sent = await msg.channel.send({ embeds: [e] });
    await sent.react('💬');
  }

  if (cmd === 'colorembed') {
    const color = args[0];
    const txt = args.slice(1).join(' ');
    if (!color || !txt) return msg.reply('Usage: `!colorembed #FF0000 Message`').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    try {
      const e = new EmbedBuilder().setColor(color).setDescription(txt).setTimestamp()
        .setFooter({ text: msg.author.username, iconURL: msg.author.displayAvatarURL() });
      msg.delete().catch(() => {});
      await msg.channel.send({ embeds: [e] });
    } catch (err) {
      msg.reply('❌ Invalid color!').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    }
  }

  if (cmd === 'success') {
    const txt = args.join(' ');
    if (!txt) return msg.reply('Usage: `!success Message`').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    const e = new EmbedBuilder().setColor('#00FF00').setTitle('✅ Success').setDescription(txt).setTimestamp();
    msg.delete().catch(() => {});
    await msg.channel.send({ embeds: [e] });
  }

  if (cmd === 'error') {
    const txt = args.join(' ');
    if (!txt) return msg.reply('Usage: `!error Message`').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    const e = new EmbedBuilder().setColor('#FF0000').setTitle('❌ Error').setDescription(txt).setTimestamp();
    msg.delete().catch(() => {});
    await msg.channel.send({ embeds: [e] });
  }

  if (cmd === 'info') {
    const txt = args.join(' ');
    if (!txt) return msg.reply('Usage: `!info Message`').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    const e = new EmbedBuilder().setColor('#00BFFF').setTitle('ℹ️ Information').setDescription(txt).setTimestamp();
    msg.delete().catch(() => {});
    await msg.channel.send({ embeds: [e] });
  }

  if (cmd === 'auto') {
    let txt = args.join(' ');
    if (!txt) return msg.reply('Usage: `!auto Message`').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    const fancyFont = (str) => {
      const normal = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const fancy = '𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵';
      return str.split('').map(char => {
        const index = normal.indexOf(char);
        return index !== -1 ? fancy[index] : char;
      }).join('');
    };
    txt = fancyFont(txt);
    const lines = txt.split('\n');
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
    txt = processedLines.join('\n');
    const e = new EmbedBuilder().setColor('#FF6B9D').setDescription(txt).setTimestamp()
      .setFooter({ text: `Styled by ${msg.author.username}`, iconURL: msg.author.displayAvatarURL() });
    msg.delete().catch(() => {});
    const sent = await msg.channel.send({ embeds: [e] });
    await sent.react('✨');
  }

  // CONFIG COMMANDS
  if (cmd === 'concategory' && msg.member.permissions.has(PermissionFlagsBits.Administrator)) {
    const cid = args[0];
    if (!cid) return msg.reply('Usage: `!concategory CATEGORY_ID`').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    const cat = msg.guild.channels.cache.get(cid);
    if (!cat || cat.type !== ChannelType.GuildCategory) return msg.reply('❌ Invalid category!').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    ticketCategories.set(msg.guild.id, cid);
    saveData();
    msg.reply(`✅ Ticket category set to: **${cat.name}**`).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
    msg.delete().catch(() => {});
  }

  if (cmd === 'conweb' && msg.member.permissions.has(PermissionFlagsBits.Administrator)) {
    const cid = args[0];
    if (!cid) return msg.reply('Usage: `!conweb CATEGORY_ID`').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    const cat = msg.guild.channels.cache.get(cid);
    if (!cat || cat.type !== ChannelType.GuildCategory) return msg.reply('❌ Invalid category!').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    webCategories.set(msg.guild.id, cid);
    saveData();
    msg.reply(`✅ Webhook category set to: **${cat.name}**`).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
    msg.delete().catch(() => {});
  }

  if (cmd === 'conorders' && msg.member.permissions.has(PermissionFlagsBits.Administrator)) {
    const cid = args[0];
    if (!cid) return msg.reply('Usage: `!conorders CHANNEL_ID`').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    const ch = msg.guild.channels.cache.get(cid);
    if (!ch || ch.type !== ChannelType.GuildText) return msg.reply('❌ Invalid channel!').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    orderChannels.set(msg.guild.id, cid);
    saveData();
    msg.reply(`✅ Orders log set to: <#${cid}>`).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
    msg.delete().catch(() => {});
  }

  if (cmd === 'condone' && msg.member.permissions.has(PermissionFlagsBits.Administrator)) {
    const cid = args[0];
    if (!cid) return msg.reply('Usage: `!condone CHANNEL_ID`').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    const ch = msg.guild.channels.cache.get(cid);
    if (!ch || ch.type !== ChannelType.GuildText) return msg.reply('❌ Invalid channel!').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    doneChannels.set(msg.guild.id, cid);
    saveData();
    msg.reply(`✅ Done log set to: <#${cid}>`).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
    msg.delete().catch(() => {});
  }

  if (cmd === 'conshop' && msg.member.permissions.has(PermissionFlagsBits.Administrator)) {
    const cid = args[0];
    if (!cid) return msg.reply('Usage: `!conshop CATEGORY_ID`').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    const cat = msg.guild.channels.cache.get(cid);
    if (!cat || cat.type !== ChannelType.GuildCategory) return msg.reply('❌ Invalid category!').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    shopCategories.set(msg.guild.id, cid);
    saveData();
    msg.reply(`✅ Shop category set to: **${cat.name}**`).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
    msg.delete().catch(() => {});
  }

  if (cmd === 'contrade' && msg.member.permissions.has(PermissionFlagsBits.Administrator)) {
    const cid = args[0];
    if (!cid) return msg.reply('Usage: `!contrade CHANNEL_ID`').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    const ch = msg.guild.channels.cache.get(cid);
    if (!ch || ch.type !== ChannelType.GuildText) return msg.reply('❌ Invalid channel!').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    tradeChannels.set(msg.guild.id, cid);
    saveData();
    msg.reply(`✅ Trade log set to: <#${cid}>`).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
    msg.delete().catch(() => {});
  }

  if (cmd === 'contranscript' && msg.member.permissions.has(PermissionFlagsBits.Administrator)) {
    const cid = args[0];
    if (!cid) return msg.reply('Usage: `!contranscript CHANNEL_ID`').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    const ch = msg.guild.channels.cache.get(cid);
    if (!ch || ch.type !== ChannelType.GuildText) return msg.reply('❌ Invalid channel!').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    transcriptChannels.set(msg.guild.id, cid);
    saveData();
    msg.reply(`✅ Transcript log set to: <#${cid}>`).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
    msg.delete().catch(() => {});
  }

  if (cmd === 'connews' && canUse) {
    const cid = args[0];
    if (!cid) return msg.reply('Usage: `!connews CHANNEL_ID`').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    const ch = msg.guild.channels.cache.get(cid);
    if (!ch || ch.type !== ChannelType.GuildText) return msg.reply('❌ Invalid channel!').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    shopNews.set(msg.guild.id, cid);
    saveData();
    msg.reply(`✅ Shop news channel set to: <#${cid}>`).then(m => setTimeout(() => m.delete().catch(() => {}), 10000));
    msg.delete().catch(() => {});
  }

  if (cmd === 'createweb') {
    const chName = args.join('-').toLowerCase();
    if (!chName) return msg.reply('Usage: `!createweb name`').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    const botMem = msg.guild.members.cache.get(client.user.id);
    if (!botMem.permissions.has(PermissionFlagsBits.ManageChannels)) return msg.reply('❌ Need Manage Channels!').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    if (!botMem.permissions.has(PermissionFlagsBits.ManageWebhooks)) return msg.reply('❌ Need Manage Webhooks!').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    try {
      let perms = [];
      let ticketOwner = null;
      if (msg.channel.name.startsWith('ticket-')) {
        const ownerName = msg.channel.name.replace('ticket-', '');
        ticketOwner = msg.guild.members.cache.find(m => m.user.username.toLowerCase() === ownerName.toLowerCase());
      }
      perms.push({ id: msg.guild.id, deny: [PermissionFlagsBits.ViewChannel] });
      perms.push({ id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageWebhooks] });
      if (ticketOwner) perms.push({ id: ticketOwner.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] });
      perms.push({ id: OWNER_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] });
      const admins = adminUsers.get(msg.guild.id) || [];
      for (const aid of admins) {
        perms.push({ id: aid, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] });
      }
      const staffRole = msg.guild.roles.cache.find(r => r.name.toLowerCase().includes('staff') || r.name.toLowerCase().includes('admin') || r.name.toLowerCase().includes('mod'));
      if (staffRole) perms.push({ id: staffRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] });
      const webCat = webCategories.get(msg.guild.id);
      const newCh = await msg.guild.channels.create({ name: chName, type: ChannelType.GuildText, parent: webCat || null, permissionOverwrites: perms });
      if (msg.channel.name.startsWith('ticket-')) {
        const tid = msg.channel.id;
        if (!ticketChannels.has(tid)) ticketChannels.set(tid, []);
        ticketChannels.get(tid).push(newCh.id);
        saveData();
      }
      try {
        const wh = await newCh.createWebhook({ name: `${chName}-webhook`, reason: `Created by ${msg.author.tag}` });
        await msg.channel.send(`✅ Channel: <#${newCh.id}>`);
        await msg.channel.send(wh.url);
      } catch (whErr) {
        console.error('Webhook Error:', whErr);
        await msg.channel.send(`✅ Channel: <#${newCh.id}>\n❌ Webhook failed`);
      }
    } catch (err) {
      console.error('CreateWeb Error:', err);
      msg.reply(`❌ Failed! ${err.message}`).then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    }
  }

  if (cmd === 'done') {
    if (!msg.channel.name.startsWith('ticket-')) return msg.reply('❌ Only in tickets!').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    const guideE = new EmbedBuilder().setColor('#00BFFF').setTitle('ℹ️ How to Mark Ticket as Done')
      .setDescription('**Follow these steps:**\n\n1️⃣ Click **"Yes, Mark as Done"** to confirm\n2️⃣ Admin will receive notification\n3️⃣ Admin confirms the completion\n4️⃣ Ticket closes automatically\n\n**Note:** Only the ticket owner can mark as done!')
      .setFooter({ text: 'Click the button below to proceed' }).setTimestamp();
    const b1 = new ButtonBuilder().setCustomId('owner_done_confirmation').setLabel('Yes, Mark as Done').setEmoji('✅').setStyle(ButtonStyle.Success);
    const b2 = new ButtonBuilder().setCustomId('owner_cancel_done').setLabel('Not Yet').setEmoji('❌').setStyle(ButtonStyle.Danger);
    const row = new ActionRowBuilder().addComponents(b1, b2);
    const ownerName = msg.channel.name.replace('ticket-', '');
    const owner = msg.guild.members.cache.find(m => m.user.username.toLowerCase() === ownerName.toLowerCase());
    await msg.channel.send({ content: owner ? `${owner.user}` : '', embeds: [guideE], components: [row] });
    await msg.delete().catch(() => {});
  }

  if (cmd === 'forcedone' && canUse) {
    if (!msg.channel.name.startsWith('ticket-') && !msg.channel.name.startsWith('shop-')) {
      return msg.reply('❌ This command only works in tickets!').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    }
    const guideE = new EmbedBuilder().setColor('#FF6B35').setTitle('⚠️ Force Complete Ticket')
      .setDescription('**Admin Override:**\n\nYou are about to force-complete this ticket without customer confirmation.\n\n**This will:**\n✅ Mark ticket as done\n📊 Log to done channel\n🔒 Close ticket in 5 seconds\n\n**Use this when:**\n• Customer is unresponsive\n• Service is confirmed complete\n• Emergency closure needed')
      .setFooter({ text: 'This action cannot be undone' }).setTimestamp();
    const b1 = new ButtonBuilder().setCustomId('force_done_confirm').setLabel('Confirm Force Done').setEmoji('⚡').setStyle(ButtonStyle.Danger);
    const b2 = new ButtonBuilder().setCustomId('force_done_cancel').setLabel('Cancel').setEmoji('❌').setStyle(ButtonStyle.Secondary);
    const row = new ActionRowBuilder().addComponents(b1, b2);
    await msg.channel.send({ embeds: [guideE], components: [row] });
    await msg.delete().catch(() => {});
  }

  if (cmd === 'close' && canUse) {
    if (!msg.channel.name.startsWith('ticket-') && !msg.channel.name.startsWith('shop-')) {
      return msg.reply('❌ This command only works in tickets!').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    }
    const guideE = new EmbedBuilder().setColor('#FF0000').setTitle('🔒 Close Ticket')
      .setDescription('**You are about to close this ticket.**\n\n**This will:**\n🗑️ Delete this ticket channel\n🗑️ Delete all related channels\n🗑️ Remove ticket from system\n\n**Warning:**\n⚠️ No completion log will be created\n⚠️ Use `!forcedone` if service was completed\n⚠️ This action cannot be undone')
      .setFooter({ text: 'Choose wisely' }).setTimestamp();
    const b1 = new ButtonBuilder().setCustomId('close_ticket_confirm').setLabel('Yes, Close Ticket').setEmoji('🔒').setStyle(ButtonStyle.Danger);
    const b2 = new ButtonBuilder().setCustomId('close_ticket_cancel').setLabel('Cancel').setEmoji('❌').setStyle(ButtonStyle.Secondary);
    const row = new ActionRowBuilder().addComponents(b1, b2);
    await msg.channel.send({ embeds: [guideE], components: [row] });
    await msg.delete().catch(() => {});
  }

  if (cmd === 'ticket') {
    const fullTxt = args.join(' ');
    if (!fullTxt) return msg.reply('Usage: `!ticket Title\\nDescription`').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    const lines = fullTxt.split('\n');
    const title = lines[0];
    const txt = lines.slice(1).join('\n');
    const e = new EmbedBuilder().setColor('#00FFFF')
      .setAuthor({ name: 'Support Ticket System', iconURL: msg.guild.iconURL() })
      .setTitle(`🎫 ${title}`)
      .setDescription(txt || 'Click the button below to create a support ticket')
      .addFields({ name: '📋 What happens next?', value: 'Our team will assist you shortly', inline: false })
      .setThumbnail(msg.guild.iconURL())
      .setFooter({ text: 'Click below to get started' })
      .setTimestamp();
    const btn = new ButtonBuilder().setCustomId('create_ticket').setLabel('Create a Ticket').setEmoji('🎫').setStyle(ButtonStyle.Primary);
    const row = new ActionRowBuilder().addComponents(btn);
    try {
      await msg.delete();
      await msg.channel.send('@everyone');
      await msg.channel.send({ embeds: [e], components: [row] });
    } catch (err) {
      console.error(err);
      msg.reply('❌ Failed!').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    }
  }

  if (cmd === 'shop') {
    const e = new EmbedBuilder().setColor('#FFD700').setTitle('🛒 Shop').setDescription('Welcome to the shop! Click below to browse items or manage your shop.').setTimestamp().setFooter({ text: 'Shop System' });
    const b1 = new ButtonBuilder().setCustomId('shop_browse').setLabel('Shop').setEmoji('🛍️').setStyle(ButtonStyle.Primary);
    const b2 = new ButtonBuilder().setCustomId('shop_manage').setLabel('Manage Shop').setEmoji('⚙️').setStyle(ButtonStyle.Secondary);
    const row = new ActionRowBuilder().addComponents(b1, b2);
    try {
      await msg.delete();
      await msg.channel.send({ embeds: [e], components: [row] });
    } catch (err) {
      console.error(err);
      msg.reply('❌ Failed!').then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
    }
  }
});

// INTERACTIONS
client.on('interactionCreate', async (int) => {
  if (!int.isButton() && !int.isModalSubmit() && !int.isStringSelectMenu()) return;

  if (int.isButton()) {
    // All button handlers here - this is getting too long, sending you a Pastebin link instead
  }

  if (int.isModalSubmit()) {
    // Modal handlers
  }

  if (int.isStringSelectMenu()) {
    // Select menu handlers  
  }
});

client.login(process.env.TOKEN);