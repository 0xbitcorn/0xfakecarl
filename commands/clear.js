const { MessageActionRow, MessageButton } = require('discord.js');
const { del } = require('request');

module.exports = {
  data: {
    name: 'clear',
    description: 'Clear a specified number of messages from the channel.',
    options: [
      {
        name: 'amount',
        description: 'Number of messages to clear',
        type: 4, //'INTEGER',
        required: true,
      },
    ],
  },
  async execute(interaction) {
        // PG-NOTES: The check should be done before the command is executed
        // So that the command doesn't show up in the first place
        // Check if the user has permission to manage messages
        if (!interaction.member.permissions.has('MANAGE_MESSAGES')) {
          return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }
    
        const amount = interaction.options.getInteger('amount');
    
        // Check if the amount is within a valid range
        if (amount < 1 || amount > 100) {
          return interaction.reply({ content: 'Please provide a number between 1 and 100.', ephemeral: true });
        }
    
        try {
          // Fetch the last 'amount + 1' messages, including the command itself
          const messages = await interaction.channel.messages.fetch({ limit: amount + 1 });
    
          // Separate messages into older and newer than 14 days
          const olderThan14Days = [];
          const newerThan14Days = [];

          for (const [snowflake, message] of messages) {
            if (Date.now() - message.createdTimestamp > 14 * 24 * 60 * 60 * 1000) {
               if(olderThan14Days.length + newerThan14Days.length < amount){
                    olderThan14Days.push(message);
               } else{
                    break;
               }
               
            } else {
                if(message.interaction == null){
                    if(olderThan14Days.length + newerThan14Days.length < amount){
                        newerThan14Days.push(message);
                    } else{
                        break;
                    }
                }else{
                    console.log("application command message skipped: " + message);
                }
            }
          }
    
          // Bulk delete newer messages
          if (newerThan14Days.length > 0) {
            await interaction.channel.bulkDelete(newerThan14Days);
          }
    
          // Delete older messages individually
          for (const message of olderThan14Days) {
            await message.delete();
          }
    
          // Send a confirmation message
          interaction.reply({ content: `Cleared ${amount} messages.`, ephemeral: true });
        } catch (error) {
          console.error('Error clearing messages:', error);
          interaction.reply({ content: 'An error occurred while clearing messages.', ephemeral: true });
        }
      },
    };
