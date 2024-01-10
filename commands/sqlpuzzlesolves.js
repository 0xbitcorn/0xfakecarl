// sqlpuzzlesolves.js
const { MessageActionRow, MessageSelectMenu, MessageEmbed } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: {
      name: 'solves',
      description: 'Retrieve and post puzzle solves.',
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
        
        // Import the clearMaizeInputFile function from the index.js file
        const { readGoogleSheet, getDataByFirstColumnValue, addToMaizeInputFile, optimizeMaizeInputFile, toTitleCase, getPredominantColor} = require('../bot.js');
        let pakoin;
        let prizes;

        //Collect prizes for specified puzzle
        (async () => {
            try {
                console.log("Collecting Pakoin Amounts...");
                pakoin = await readGoogleSheet(`DEFAULTS`, [`FIRSTDAY`,`ALLSOLVES`]);
                console.log("Collecting Prize Data...");
                prizes = await getDataByFirstColumnValue('DEFAULTS', 'PUZZLEDEFAULTS', puzzleKind.toUpperCase());

            } catch (error) {
                console.error(error.message);
            }
            })();

        // Get the selected puzzle kind from the interaction
        const puzzleKind = interaction.options.getString('kind');
  
        // Query to get all unique puzzle kinds
        const uniqueKindsQuery = 'SELECT DISTINCT kind FROM oldman.puzzles';
        const uniqueKindsResult = await pgClient.query(uniqueKindsQuery);
        const uniqueKinds = uniqueKindsResult.rows.map((row) => row.kind);
  
        // Check if the selected puzzle kind is valid
        if (!uniqueKinds.includes(puzzleKind)) {
          await interaction.reply({
            content: `Invalid puzzle kind. Available puzzle kinds: ${uniqueKinds.join(', ')}`,
            ephemeral: true,
          });
          return;
        }
  
        // Query to get the latest 10 puzzles of the specified kind
        const latestPuzzlesQuery = `
          SELECT id, name, starts_at, ends_at, 
          details->>'display_image' AS thumbnail,
          (details->>'images')::json->0 AS puzzle_image,
          (details->>'answers')::json AS answers,
          (details->>'questions')::json AS questions
          FROM oldman.puzzles
          WHERE kind = $1 AND ends_at < NOW()
          ORDER BY ends_at DESC
          LIMIT 10`;
        const latestPuzzlesResult = await pgClient.query(latestPuzzlesQuery, [puzzleKind]);
        const latestPuzzles = latestPuzzlesResult.rows;
          
        // Create the select menu with puzzle names
        const options = latestPuzzles.map((puzzle) => ({
          label: puzzle.name,
          value: puzzle.id,
        }));
        const selectMenu = new MessageSelectMenu()
          .setCustomId('selectPuzzle')
          .setPlaceholder('Select a puzzle')
          .addOptions(options);
  
        // Create the action row with the select menu
        const actionRow = new MessageActionRow().addComponents(selectMenu);

        // Send a message with the select menu
        try{
           await interaction.reply({
                components: [actionRow],
              });    
        } catch (error){
            console.error('Error sending initial message: ', error.message);
        }
  
        // Event listener for the select menu
        const filter = (i) => i.customId === 'selectPuzzle' && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });
        let selectedPuzzleName;

        collector.on('collect', async (i) => {
          interaction.deleteReply();

          const selectedPuzzleId = i.values[0];
          selectedPuzzleName = latestPuzzles.find((puzzle) => puzzle.id === selectedPuzzleId)?.name;
          selectedPuzzleThumb = latestPuzzles.find((puzzle) => puzzle.id === selectedPuzzleId)?.thumbnail;
          selectedPuzzleImg = latestPuzzles.find((puzzle) => puzzle.id === selectedPuzzleId)?.puzzle_image;
          selectedPuzzleAnswers = latestPuzzles.find((puzzle) => puzzle.id === selectedPuzzleId)?.answers;
          selectedPuzzleQuestions = latestPuzzles.find((puzzle) => puzzle.id === selectedPuzzleId)?.questions;

          let answerStr = '**ANSWERS** \n';
          let qCount = 1;
            selectedPuzzleAnswers.forEach((answer, index) => {
                if(selectedPuzzleQuestions[index].optional){
                    answerStr += `${qCount}. [BONUS] ${toTitleCase(answer)} \n`;
                }else{
                    answerStr += `${qCount}. ${toTitleCase(answer)} \n`;
                    qCount++;
                }
            });

          // Query to get puzzle solves based on the selected puzzle ID
          const puzzleSolvesQuery = `
            SELECT user_id, solved_at
            FROM oldman.puzzle_solves
            WHERE puzzle_id = $1 AND solved_at IS NOT NULL
            ORDER BY solved_at ASC`;
          const puzzleSolvesResult = await pgClient.query(puzzleSolvesQuery, [selectedPuzzleId]);
          const puzzleSolves = puzzleSolvesResult.rows;
  
          // Query to get user Discord IDs
          const usersQuery = 'SELECT id, discord_id, wallet FROM oldman.users';
          const usersResult = await pgClient.query(usersQuery);
          const usersMap = new Map(usersResult.rows.map((user) => [user.id, {discord: user.discord_id, wallet: user.wallet}]));
  
          // Separate users into two groups based on solve time
          const within24Hours = [];
          const remainingSolves = [];
          const startsAt = latestPuzzles.find((puzzle) => puzzle.id === selectedPuzzleId)?.starts_at;
          const endsAt = latestPuzzles.find((puzzle) => puzzle.id === selectedPuzzleId)?.ends_at;
          
          puzzleSolves.forEach((solve) => {
            const user = usersMap.get(solve.user_id);

            if (user) {
              const mention = `<@${user.discord}>`;
              const solveTime = new Date(solve.solved_at);
              if(user.wallet == null || user.wallet == undefined || user.wallet == ''){
                    console.log(user.discord + " does not have a wallet registered.");
              }
              if (solveTime >= new Date(startsAt) && solveTime <= new Date(new Date(startsAt).getTime() + 24 * 60 * 60 * 1000)) {
                within24Hours.push({discord: mention, wallet: user.wallet.trim()});
                console.log("24HR: " + mention + " : " + user.wallet.trim());
            } else if(solveTime < new Date(endsAt)) {
                remainingSolves.push({discord: mention, wallet: user.wallet.trim()});
                console.log(mention + " : " + user.wallet.trim());
            }
            }
          });

let firstDayPakoin = parseInt(pakoin[0]) + parseInt(pakoin[1]);

// Join .discord values for within24Hours and remainingSolves into a string
 const within24HoursDiscord = within24Hours.map(user => user.discord).join(' ');
 const remainingSolvesDiscord = remainingSolves.map(user => user.discord).join(' ');

 // Collect .wallet values for within24Hours and remainingSolves
 const within24HoursWallets = within24Hours
 .filter(user => user.wallet !== null && user.wallet !== undefined && user.wallet !== '')
 .map(user => user.wallet);
 const remainingSolvesWallets = remainingSolves
 .filter(user => user.wallet !== null && user.wallet !== undefined && user.wallet !== '')
 .map(user => user.wallet);

let prizestr = '';
let embedColor;

          try{
            embedColor = await getPredominantColor(selectedPuzzleThumb);

            const puzzleEmbed = new MessageEmbed()
            .setColor(embedColor)
            .setTitle(`${selectedPuzzleName.toUpperCase()}`)
            .setImage(selectedPuzzleImg)
            .setDescription(answerStr)
          
          // Post messages for each group
          const embed = new MessageEmbed()
            .setColor(embedColor)
            .setTitle(`${selectedPuzzleName.toUpperCase()} SOLVES`)
            .setThumbnail(selectedPuzzleThumb)
            .addField(`SOLVES IN FIRST 24 HOURS (${firstDayPakoin} pakoin)`, within24HoursDiscord || 'No solves in first 24 hours...')
            .addField(' ', ' ')
            .addField(`REMAINING SOLVES (${pakoin[1]} pakoin)`, remainingSolvesDiscord || 'No additional solves... ');

          await interaction.channel.send({ embeds: [puzzleEmbed, embed]});

          

          //add 24 hr solvers pakoin to maize.txt  
          let alreadyProcessed24Hours = await addToMaizeInputFile(selectedPuzzleId, within24HoursWallets,"PAKOIN",firstDayPakoin);
          
          //add remaining solvers pakoin to maize.txt
          let alreadyProcessedRemaining = await addToMaizeInputFile(selectedPuzzleId, remainingSolvesWallets,"PAKOIN",pakoin[1]);

          // Combine the alreadyProcessed strings
          let alreadyProcessed = alreadyProcessed24Hours + alreadyProcessedRemaining;

          //optimize the maize file to combine similar entries
          optimizeMaizeInputFile();

          
          if(alreadyProcessed.length > 0){
            alreadyProcessed = `- ${alreadyProcessed.replace(new RegExp(`${selectedPuzzleId}:`, 'g'), '').split(',').join(`\n- `)}`;

            await interaction.followUp({
                content: `:warning: **PROCESS INCLUDED PREVIOUSLY PROCESSED DATA** :warning:\n\n*${selectedPuzzleName.toUpperCase()} was previously processed for:*\n${alreadyProcessed}`,
                ephemeral: true,
            });
          }


        /*  
        if(prizes.length > 2){
            >>> RUN RAND-O-MATIC WHICH SHOULD ADD THE PRIZES TO MAIZE
        }
        */

          collector.stop(); // Stop collecting after processing the selection       

          } catch(error){
            console.error('Error sending follow-up message:', error.message);
          }

        });

        
  
      } catch (error) {
        console.error('Error executing solves command:', error.message);
        await interaction.reply('Error executing solves command.');
      }
    },
  };