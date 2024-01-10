// clearCommand.js
module.exports = {
    data: {
      name: 'clearmaize',
      description: 'Clears the Maize input file.',
    },
    execute: async (interaction) => {
      try {
        // Check if the user has the necessary permissions or any other conditions if needed
        if (interaction.user.id !== '416645304830394368') {
          await interaction.reply({ content: 'You are not authorized to use this command.', ephemeral: true });
          return;
        }
  
        // Import the clearMaizeInputFile function from the bot.js file
        const { clearMaizeInputFile } = require('../bot.js');
  
        // Call the clearMaizeInputFile function
        clearMaizeInputFile();
  
      // Send an ephemeral message indicating success
      await interaction.reply({ content: 'Maize input file cleared successfully.', ephemeral: true });
    } catch (error) {
      console.error(error);
      // Send an ephemeral message indicating an error
      await interaction.reply({ content: 'An error occurred while clearing the Maize input file.', ephemeral: true });
    }
    },
  };
  