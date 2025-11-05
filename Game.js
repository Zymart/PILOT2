const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Anime Vanguards traits with their rarities and exact chances
const traits = [
  { name: 'Monarch', rarity: 'Mythical', chance: 0.1, odds: '1 in 1000' },
  { name: 'Ethereal', rarity: 'Mythical', chance: 0.175, odds: '1 in 571.43' },
  { name: 'Deadeye', rarity: 'Legendary', chance: 0.375, odds: '1 in 266.67' },
  { name: 'Solar', rarity: 'Legendary', chance: 0.5, odds: '1 in 200' },
  { name: 'Blitz', rarity: 'Epic', chance: 1.85, odds: '1 in 54.05' },
  { name: 'Fortune', rarity: 'Epic', chance: 2.5, odds: '1 in 40' },
  { name: 'Marksman', rarity: 'Rare', chance: 6.5, odds: '1 in 15.39' },
  { name: 'Scholar', rarity: 'Rare', chance: 10, odds: '1 in 10' },
  { name: 'Vigor I', rarity: 'Common', chance: 8.67, odds: '1 in 3.85' },
  { name: 'Vigor II', rarity: 'Common', chance: 8.67, odds: '1 in 3.85' },
  { name: 'Vigor III', rarity: 'Common', chance: 8.67, odds: '1 in 3.85' },
  { name: 'Swift I', rarity: 'Common', chance: 8.67, odds: '1 in 3.85' },
  { name: 'Swift II', rarity: 'Common', chance: 8.67, odds: '1 in 3.85' },
  { name: 'Swift III', rarity: 'Common', chance: 8.67, odds: '1 in 3.85' },
  { name: 'Range I', rarity: 'Common', chance: 8.67, odds: '1 in 3.85' },
  { name: 'Range II', rarity: 'Common', chance: 8.67, odds: '1 in 3.85' },
  { name: 'Range III', rarity: 'Common', chance: 8.67, odds: '1 in 3.85' },
];

// Rarity colors and emojis for embeds
const rarityData = {
  'Mythical': { color: 0xFF00FF, emoji: '✨' },
  'Legendary': { color: 0xFFD700, emoji: '👑' },
  'Epic': { color: 0x9B59B6, emoji: '💜' },
  'Rare': { color: 0x3498DB, emoji: '💎' },
  'Common': { color: 0x95A5A6, emoji: '⚪' },
};

// Weighted random selection based on chances
function rollTrait() {
  const rand = Math.random() * 100;
  let cumulative = 0;
  
  for (const trait of traits) {
    cumulative += trait.chance;
    if (rand <= cumulative) {
      return trait;
    }
  }
  
  return traits[traits.length - 1];
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log('Bot is ready! Use !roll to roll traits.');
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return;
  
  if (message.content === '!roll') {
    const trait = rollTrait();
    const { color, emoji } = rarityData[trait.rarity];
    
    const embed = {
      color: color,
      title: `${emoji} Trait Roll Result`,
      fields: [
        { name: '✨ Trait', value: `**${trait.name}**`, inline: true },
        { name: '🏆 Rarity', value: trait.rarity, inline: true },
        { name: '📊 Chance', value: `${trait.chance}%`, inline: true },
        { name: '🎲 Odds', value: trait.odds, inline: false },
      ],
      footer: { text: `Rolled by ${message.author.username}` },
      timestamp: new Date(),
    };
    
    message.reply({ embeds: [embed] });
  }
  
  if (message.content === '!traits') {
    let traitList = '**__Mythical__** ✨\n';
    traitList += traits.filter(t => t.rarity === 'Mythical').map(t => `• ${t.name} - ${t.chance}% [${t.odds}]`).join('\n');
    traitList += '\n\n**__Legendary__** 👑\n';
    traitList += traits.filter(t => t.rarity === 'Legendary').map(t => `• ${t.name} - ${t.chance}% [${t.odds}]`).join('\n');
    traitList += '\n\n**__Epic__** 💜\n';
    traitList += traits.filter(t => t.rarity === 'Epic').map(t => `• ${t.name} - ${t.chance}% [${t.odds}]`).join('\n');
    traitList += '\n\n**__Rare__** 💎\n';
    traitList += traits.filter(t => t.rarity === 'Rare').map(t => `• ${t.name} - ${t.chance}% [${t.odds}]`).join('\n');
    traitList += '\n\n**__Common__** ⚪\n';
    traitList += '• Vigor I/II/III - 8.67% each [1 in 3.85]\n';
    traitList += '• Swift I/II/III - 8.67% each [1 in 3.85]\n';
    traitList += '• Range I/II/III - 8.67% each [1 in 3.85]';
    
    const embed = {
      color: 0x5865F2,
      title: '📋 All Anime Vanguards Traits',
      description: traitList,
      footer: { text: 'Use !roll to get a random trait' },
    };
    
    message.reply({ embeds: [embed] });
  }
  
  if (message.content === '!help') {
    const embed = {
      color: 0x00FF00,
      title: '🎮 Anime Vanguards Trait Bot Commands',
      description: '**!roll** - Roll a random trait\n**!traits** - View all available traits\n**!help** - Show this help message',
    };
    
    message.reply({ embeds: [embed] });
  }
});

// Replace 'YOUR_BOT_TOKEN' with your actual Discord bot token
client.login('YOUR_BOT_TOKEN');