const {Client, GatewayIntentBits, EmbedBuilder, AttachmentBuilder} = require('discord.js');	//discord connection

const client = new Client({
	intents: [
	  GatewayIntentBits.Guilds,
	  GatewayIntentBits.GuildMembers,
	  GatewayIntentBits.GuildMessages,
	  GatewayIntentBits.MessageContent,
	  GatewayIntentBits.GuildMessageReactions,
	  GatewayIntentBits.DirectMessages,
	  GatewayIntentBits.DirectMessageReactions,
	  GatewayIntentBits.DirectMessageTyping,
	],
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
  });  


module.exports = {}

