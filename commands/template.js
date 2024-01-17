const fs = require('fs');									                  //for system file access 
const {sendMessageToChannel} = require('../bot.js');        //to allow sending message to channel
const { scheduleJob } = require('node-schedule');           //for scheduling
const { SlashCommandBuilder} = require('discord.js');

const channelMapping = {
	't_cornmoji': '1193316184242798754',
	't_wordwrap': '1193316184242798754',
  't_rebus': '1193316184242798754'
};

const emojiMapping = {
  '0' : ':zero:',
  '1' : ':one:',
  '2' : ':two:',
  '3' : ':three:',
  '4' : ':four:',
  '5' : ':five:',
  '6' : ':six:',
  '7' : ':seven:',
  '8' : ':eight:',
  '9' : ':nine:',
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('template')
    .setDescription('Schedule a template message')
    .addStringOption(option =>
      option.setName('template')
            .setDescription('Choose template')
            .setRequired(true)
            .addChoices(
                {name: 'CORNMOJI', value: 't_cornmoji'},
                {name: 'REBUS', value: 't_rebus'},
                {name: 'WORDWRAP', value: 't_wordwrap'},
      ))
    .addStringOption(option =>
        option.setName('game')
              .setDescription('Input game title or number')
              .setRequired(true))
    .addStringOption(option =>
      option.setName('theme')
            .setDescription('Input theme')
            .setRequired(true))
    .addIntegerOption(option =>
      option.setName('time')
            .setDescription('Enter when the template should be sent (UNIX) https://r.3v.fi/discord-timestamps/')
            .setRequired(true))
    ,    
async execute(interaction) {
    try{
      await interaction.deferReply({ephemeral: true});
      // Check if the user has the necessary permissions or any other conditions if needed

                  // Check if the user has the PuzzleGang role
                  const requiredRoleId = '970758538681012315';
                  const member = interaction.member;
          
                  if (!member || !member.roles || !member.roles.cache.has(requiredRoleId)) {
                      // User doesn't have the required role
                      await interaction.editReply({
                      content: 'You do not have the required role to use this command.',
                      ephemeral: true,
                      });
                      return;
                  }
        
        let channel = ''
        const template = interaction.options.getString('template');
        const unixTime = interaction.options.getInteger('time');
        const scheduledTime = new Date(unixTime * 1000); // Convert Unix time to milliseconds

        console.log('Time to Send: ' + scheduledTime);
        console.log('Template Selected: ' + template);

        const templateFilePath = `./createdFiles/${template}.txt`;
        const templateContent = fs.readFileSync(templateFilePath, 'utf-8');

        const gameNumberTitle = interaction.options.getString('game');
        const theme = interaction.options.getString('theme');

        console.log('game number:' + gameNumberTitle);
        console.log('theme:' + theme);

        let finalContent;

        // If the template is 't_cornmoji', convert game number to key cap emojis
        if (template === 't_cornmoji') {
          const keyCapEmojis = gameNumberTitle
            .split('')
            .map(digit => emojiMapping[digit])
            .join(' ');
          finalContent = templateContent
            .replace('<GAME>', keyCapEmojis)
            .replace('<THEME>', theme);
        }else{
          finalContent = templateContent
            .replace('<GAME>', gameNumberTitle)
            .replace('<THEME>', theme);
        }

        // Get the channel ID from the mapping
        channel = channelMapping[template];

        // Schedule the message
        scheduleJob(scheduledTime, () => {
          // Replace with actual logic to send the template message to the channel
          sendMessageToChannel(finalContent, channel)
        });
        
        await interaction.editReply({ content: `message scheduled for ${scheduledTime}\n\`\`\`Please note that this is purely for convenience.\nMessage Delivery is NOT guaranteed.\nIf bot reboots, message will currently be lost\`\`\``, ephemeral: true });
        console.log(`Message scheduled for ${scheduledTime}`);
 
        } catch (error) {
        console.error('Error scheduling message:', error);
        interaction.editReply({ content: 'An error occurred while scheduling the message.', ephemeral: true });
      }
    },
  };