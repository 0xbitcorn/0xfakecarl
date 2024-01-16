const { scheduleJob } = require('node-schedule');
const { SlashCommandBuilder, ChannelType} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('schedule')
    .setDescription('Schedule a message')
    .addChannelOption(option =>
        option.setName('channel')
        .setDescription('Select where to post the message')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText))
    .addIntegerOption(option =>
        option.setName("time")
        .setDescription("Enter when the message should be sent (UNIX)")
        .setRequired(true))
    .addStringOption(option =>
        option.setName("message")
        .setDescription("Input the message to be posted")
        .setRequired(true)
        .setMaxLength(2000)),    
async execute(interaction) {
    try{
      // Check if the user has the necessary permissions or any other conditions if needed

                  // Check if the user has the PuzzleGang role
                  const requiredRoleId = '970758538681012315';
                  const member = interaction.member;
          
                  if (!member || !member.roles || !member.roles.cache.has(requiredRoleId)) {
                      // User doesn't have the required role
                      await interaction.reply({
                      content: 'You do not have the required role to use this command.',
                      ephemeral: true,
                      });
                      return;
                  }

        const channel = interaction.options.getChannel('channel');
        const unixTime = interaction.options.getInteger('time');
        const messageContent = interaction.options.getString('message');

        const scheduledTime = new Date(unixTime * 1000); // Convert Unix time to milliseconds
        scheduleJob(scheduledTime, () => {
          channel.send(messageContent);
        });
    
        await interaction.reply({content: `Message scheduled for ${scheduledTime}`, ephemeral: true});
    } catch (error){
        console.error('Error scheduling message:', error);
        interaction.reply({ content: 'An error occurred while scheduling the message.', ephemeral: true });
    }
  },
};
