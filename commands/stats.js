// stats.js
const {ActionRowBuilder, StringSelectMenuBuilder, AttachmentBuilder} = require('discord.js');
const fs = require('fs');
const {gameStats} = require('../functions/gameStats.js');

module.exports = {
    data: {
      name: 'stats',
      description: 'Retrieve stats for puzzle',
      options: [
        {
          name: 'kind',
          type: 3, // STRING
          description: 'Select puzzle type.',
          required: true,
          choices: [
            { name: 'backwords', value: 'backwords' },
            { name: 'cornmoji', value: 'cornmoji' },
            //{ name: 'ddd', value: 'ddd' },
            { name: 'dtactt', value: 'dtactt' },
            { name: 'pinone', value: 'pinone' },
            //{ name: 'pos', value: 'pos' },
            { name: 'rebus', value: 'rebus' },
            { name: 'witw', value: 'witw' },
            { name: 'wordwrap', value: 'wordwrap' },
            { name: 'custom', value: 'custom' }            
          ],
        },
      ],
    },
    async execute(interaction, pgClient) {
      try {
            await interaction.deferReply();

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
        
        // Get the selected puzzle kind from the interaction
        const puzzleKind = interaction.options.getString('kind');

                // Query to get all unique puzzle kinds
                const uniqueKindsQuery = 'SELECT DISTINCT kind FROM oldman.puzzles';
                const uniqueKindsResult = await pgClient.query(uniqueKindsQuery);
                const uniqueKinds = uniqueKindsResult.rows.map((row) => row.kind);
          
                // Check if the selected puzzle kind is valid
                if (!uniqueKinds.includes(puzzleKind)) {
                  await interaction.editReply({
                    content: `Invalid puzzle kind. Available puzzle kinds: ${uniqueKinds.join(', ')}`,
                    ephemeral: true,
                  });
                  return;
                }
          
                // Query to get the latest 10 puzzles of the specified kind
                const latestPuzzlesQuery = `
                  SELECT id, name, shape, starts_at, ends_at, 
                  details->>'display_image' AS thumbnail,
                  (details->>'images')::json->0 AS puzzle_image,
                  (details->>'answers')::json AS answers,
                  (details->>'questions')::json AS questions
                  FROM oldman.puzzles
                  WHERE kind = $1 AND ends_at < NOW() AND name <> 'DEFAULT'
                  ORDER BY ends_at DESC
                  LIMIT 15`;
                const latestPuzzlesResult = await pgClient.query(latestPuzzlesQuery, [puzzleKind]);
                const latestPuzzles = latestPuzzlesResult.rows;
                  
                // Create the select menu with puzzle names
                const options = latestPuzzles.map((puzzle) => ({
                  label: puzzle.name,
                  value: puzzle.id,
                }));
                const selectMenu = new StringSelectMenuBuilder()
                  .setCustomId('selectPuzzle')
                  .setPlaceholder('Select a puzzle')
                  .addOptions(options);
          
                // Create the action row with the select menu
                const actionRow = new ActionRowBuilder().addComponents(selectMenu);
                // Send a message with the select menu
                try{
                   await interaction.editReply({
                        components: [actionRow],
                      });    

                } catch (error){
                    console.error('Error sending initial message: ', error.message);
                }
          
                // Event listener for the select menu
                const filter = (i) => i.customId === 'selectPuzzle' && i.user.id === interaction.user.id;
                const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });
                let selectedPuzzleName, selectedPuzzleShape, selectedPuzzleThumb, selectedPuzzleImg, selectedPuzzleAnswers, selectedPuzzleQuestions;
        
        
                collector.on('collect', async (i) => {
                  const selectedPuzzleId = i.values[0];                                                                 // COLLECTING DETAILS FOR SELECTED PUZZLE
                  //selectedPuzzleName = latestPuzzles.find((puzzle) => puzzle.id === selectedPuzzleId)?.name;            // NAME OF PUZZLE
                  //selectedPuzzleShape = latestPuzzles.find((puzzle) => puzzle.id === selectedPuzzleId)?.shape;          // SHAPE (STANDARD/CROSSWORD)
                  //selectedPuzzleThumb = latestPuzzles.find((puzzle) => puzzle.id === selectedPuzzleId)?.thumbnail;      // THUMBNAIL GRAPHIC (COVER IMAGE)
                  //selectedPuzzleImg = latestPuzzlles.find((puzzle) => puzzle.id === selectedPuzzleId)?.puzzle_image;     // MAIN PUZZLE IMAGE
                  //selectedPuzzleAnswers = latestPuzzles.find((puzzle) => puzzle.id === selectedPuzzleId)?.answers;      // ANSWERS
                  //selectedPuzzleQuestions = latestPuzzles.find((puzzle) => puzzle.id === selectedPuzzleId)?.questions;  // QUESTIONS (USED TO NUMBER THE ANSWERS)

                let uniqueAnswers = await gameStats(pgClient, selectedPuzzleId);
                
                fs.writeFileSync('query.txt', JSON.stringify(uniqueAnswers, null, 2));
                const attachment = new AttachmentBuilder('query.txt');
          
                // Reply to the interaction with the text file attached
                await interaction.editReply({ content: selectedPuzzleName, files: [attachment] });
    });
    } catch (error) {
      console.error('Error executing SQL query:', error.message);
      await interaction.reply('Error executing SQL query.');
    }
  },
};
