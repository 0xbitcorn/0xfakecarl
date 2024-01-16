// sqlCommand.js
const { AttachmentBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: {
    name: 'sql',
    description: 'Execute a SQL query and save the result in a file.',
    options: [
      {
        name: 'query',
        type: 3, //STRING
        description: 'The SQL query to execute.',
        required: true,
      },
    ],
  },
  execute: async (interaction, pgClient) => {
    try {
        // Check if the user has the necessary permissions or any other conditions if needed
        if (interaction.user.id !== '416645304830394368') {
          await interaction.reply({ content: 'You are not authorized to use this command.', ephemeral: true });
          return;
        }

      const sqlQuery = interaction.options.getString('query');
      
      // Include the submitted query in a code block
      const replyContent = `Query:\n\`\`\`${sqlQuery}\`\`\``;
      const result = await pgClient.query(sqlQuery);
      const data = result.rows;
      fs.writeFileSync('query.txt', JSON.stringify(data, null, 2));
      const attachment = new AttachmentBuilder('query.txt');

      // Reply to the interaction with the text file attached
      await interaction.reply({ content: replyContent, files: [attachment] });
    } catch (error) {
      console.error('Error executing SQL query:', error.message);
      await interaction.reply('Error executing SQL query.');
    }
  },
};
