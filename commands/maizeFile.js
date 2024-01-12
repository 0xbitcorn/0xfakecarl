// maizeFile.js
module.exports = {
  data: {
    name: 'maize',
    description: 'Clears the Maize input file.',
    options: [
      {
        name: 'operation',
        type: 3, // STRING
        description: 'Select operation to perform.',
        required: true,
        choices: [
          { name: 'Clear Input.txt', value: 'clear' },
          { name: 'Process Distribution', value: 'sendit' },
        ],
      },
    ],
  },
  execute: async (interaction) => {
    try {
      // Check if the user has the necessary permissions or any other conditions if needed
      if (interaction.user.id !== '416645304830394368') {
        await interaction.reply({ content: 'Sorry bro. Only bitcorn is allowed to play with this fire.', ephemeral: true });
        return;
      }

      // Import the functions from the bot.js file
      const { clearMaizeInputFile, processDistribution } = require('../bot.js');

      // Get the selected operation from the user's choice
      const operation = interaction.options.getString('operation');

      // Call the appropriate function based on the selected operation
      switch (operation) {
        case 'clear':
          clearMaizeInputFile();
          await interaction.reply({ content: 'Maize input file cleared successfully.', ephemeral: true });
          break;
        case 'sendit':
          processDistribution();
          await interaction.reply({ content: '[THIS IS WHERE IT WOULD PROCESS, IF WE HAD THAT FUNCTION]', ephemeral: true });
          break;
        default:
          await interaction.reply({ content: 'Invalid operation specified.', ephemeral: true });
          break;
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'An error occurred while processing the command.', ephemeral: true });
    }
  },
};