const { scheduleJob } = require('node-schedule');
const { SlashCommandBuilder, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('schedule')
    .setDescription('Schedule a message')
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('Select where to post the message')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    )
    .addIntegerOption((option) =>
      option
        .setName('time')
        .setDescription('Specify the time to schedule the message in Unix time')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('message')
        .setDescription('Input the message to be posted')
        .setRequired(true)
        .setMaxLength(2000)
    ),
  async execute(interaction) {
    try {
      const channel = interaction.options.getChannel('channel');
      const unixTime = interaction.options.getInteger('time');
      const messageContent = interaction.options.getString('message');

      // PG-NOTES: Consider that these aren't stored somewhere,
      // so if the bot goes down, the messages are lost
      // Schedule the message
      const scheduledTime = new Date(unixTime * 1000); // Convert Unix time to milliseconds
      scheduleJob(scheduledTime, () => {
        channel.send(messageContent);
      });

      await interaction.reply(`Message scheduled for ${scheduledTime}`);
    } catch (error) {
      console.error('Error scheduling message:', error);
      interaction.reply({
        content: 'An error occurred while scheduling the message.',
        ephemeral: true,
      });
    }
  },
};
