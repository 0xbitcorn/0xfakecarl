// sqlpuzzlesolves.js
const { MessageActionRow, MessageSelectMenu, MessageEmbed } = require('discord.js');
const { toTitleCase, getPredominantColor} = require('../bot.js');
const {readGoogleSheet, getDataByFirstColumnValue, googleWalletLookup} = require('../functions/googleSheets.js');
const {addToMaizeInputFile, optimizeMaizeInputFile} = require('../functions/maize.js');
const {addXPToPuzzler} = require('../functions/puzzlerpass.js');

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
        

        let pakoin;
        let prizes;

        //Collect prizes for specified puzzle
        (async () => {
            try {
                console.log("Collecting Pakoin Amounts...");
                pakoin = await readGoogleSheet(`DEFAULTS`, [`FIRSTDAY`,`ALLSOLVES`]);
                console.log("PAKOIN:" + pakoin);
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
        let selectedPuzzleName, selectedPuzzleShape, selectedPuzzleThumb, selectedPuzzleImg, selectedPuzzleAnswers, selectedPuzzleQuestions;

        collector.on('collect', async (i) => {
          interaction.deleteReply();

          const selectedPuzzleId = i.values[0];
          selectedPuzzleName = latestPuzzles.find((puzzle) => puzzle.id === selectedPuzzleId)?.name;
          selectedPuzzleShape = latestPuzzles.find((puzzle) => puzzle.id === selectedPuzzleId)?.shape;
          selectedPuzzleThumb = latestPuzzles.find((puzzle) => puzzle.id === selectedPuzzleId)?.thumbnail;
          selectedPuzzleImg = latestPuzzles.find((puzzle) => puzzle.id === selectedPuzzleId)?.puzzle_image;
          selectedPuzzleAnswers = latestPuzzles.find((puzzle) => puzzle.id === selectedPuzzleId)?.answers;
          selectedPuzzleQuestions = latestPuzzles.find((puzzle) => puzzle.id === selectedPuzzleId)?.questions;

          console.log(`[PROCESSING PUZZLE: ${selectedPuzzleName}]`);

          let answerStr = '**ANSWERS** \n';
          let crosswordDownStr = '';
          let crosswordAcrossStr = '';
          let qCount = 1;
          let crosswordCounter = 0;
          let crosswordDescStr = '**DOWN [CLUES]** \n'


          if(Array.isArray(selectedPuzzleAnswers) || (selectedPuzzleShape == "crossword" && typeof selectedPuzzleAnswers === 'object')){
            if(selectedPuzzleShape == "crossword"){
                
                console.log(Object.keys(selectedPuzzleAnswers.down));

                for(const index in selectedPuzzleAnswers.down){
                  crosswordDescStr += `**${Object.keys(selectedPuzzleAnswers.down)[crosswordCounter]}\\.** ${toTitleCase(selectedPuzzleAnswers.down[index].clue)} \n`;
                  crosswordDownStr += `**${Object.keys(selectedPuzzleAnswers.down)[crosswordCounter]}\\.** ${toTitleCase(selectedPuzzleAnswers.down[index].answer)} \n`;
                  crosswordCounter++;
                }
                crosswordDescStr += '\n **ACROSS [CLUES]** \n';
                console.log(Object.keys(selectedPuzzleAnswers.down));
                crosswordCounter = 0;
                for(const index in selectedPuzzleAnswers.across){
                  crosswordDescStr += `**${Object.keys(selectedPuzzleAnswers.across)[crosswordCounter]}\\.** ${toTitleCase(selectedPuzzleAnswers.across[index].clue)} \n`;
                  crosswordAcrossStr += `**${Object.keys(selectedPuzzleAnswers.across)[crosswordCounter]}\\.** ${toTitleCase(selectedPuzzleAnswers.across[index].answer)} \n`;
                  crosswordCounter++;
                }

            }else{
                selectedPuzzleAnswers.forEach((answer, index) => {
                  if(selectedPuzzleQuestions[index].optional){
                      answerStr += `${qCount}. [BONUS] ${toTitleCase(answer)} \n`;
                  }else{
                      answerStr += `${qCount}. ${toTitleCase(answer)} \n`;
                      qCount++;
                  }
              });
            }
          } else{
            console.log('selectedPuzzleAnswers is not an array: ' + selectedPuzzleAnswers);
            answerStr += `${toTitleCase(selectedPuzzleAnswers)}`; 
          }


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
          const within48Hours = [];
          const remainingSolves = [];
          const startsAt = latestPuzzles.find((puzzle) => puzzle.id === selectedPuzzleId)?.starts_at;
          const endsAt = latestPuzzles.find((puzzle) => puzzle.id === selectedPuzzleId)?.ends_at;
          let noteStr = ''
          
          for (const solve of puzzleSolves){
            noteStr = '';
            const user = usersMap.get(solve.user_id);

            if (user) {
              const mention = `<@${user.discord}>`;
              const solveTime = new Date(solve.solved_at);

              //If user does not have a wallet registered, check our google sheet wallet database
              if(user.wallet == null || user.wallet == undefined || user.wallet == ''){
                user.wallet = await googleWalletLookup(user.discord);
                if(user.wallet == null || user.wallet == undefined || user.wallet == ''){
                    noteStr = " [no wallet found]";
                }else{
                    noteStr = " [wallet in google sheet]";
                }
              }

            if (solveTime >= new Date(startsAt) && solveTime <= new Date(new Date(startsAt).getTime() + 24 * 60 * 60 * 1000)) {
                within24Hours.push({discord: mention, wallet: (user.wallet || '').toString().trim()});
                console.log("24HR: " + mention + " : " + user.wallet + noteStr);
            } else if (solveTime >= new Date(startsAt) && solveTime <= new Date(new Date(startsAt).getTime() + 48 * 60 * 60 * 1000)) {
                within48Hours.push({discord: mention, wallet: (user.wallet || '').toString().trim()});
                console.log("48HR: " + mention + " : " + user.wallet + noteStr);
            } else if(solveTime < new Date(endsAt)) {
                remainingSolves.push({discord: mention, wallet: (user.wallet || '').toString().trim()});
                console.log(mention + " : " + user.wallet + noteStr);
            }
            }
          }

 let firstDayPakoin = parseInt(pakoin[0]) + parseInt(pakoin[1]);

 // Join .discord values for within24Hours and remainingSolves into a string
 const within24HoursDiscord = within24Hours.map(user => user.discord).join(' ');
 const within48HoursDiscord = within48Hours.map(user => user.discord).join(' ');
 const remainingSolvesDiscord = remainingSolves.map(user => user.discord).join(' ');

 // Collect .wallet values for within24Hours and remainingSolves
 const within24HoursWithWallets = within24Hours
 .filter(user => user.wallet !== null && user.wallet !== undefined && user.wallet !== '')
 const within48HoursWithWallets = within48Hours
 .filter(user => user.wallet !== null && user.wallet !== undefined && user.wallet !== '')
 const remainingSolvesWithWallets = remainingSolves
 .filter(user => user.wallet !== null && user.wallet !== undefined && user.wallet !== '')


 const UsersWithoutWallets = within24Hours.concat(remainingSolves)
 .filter(user => user.wallet == null || user.wallet == undefined || user.wallet == '')
 .map(pair => pair.discord)

let prizestr = '';
let embedColor;

          try{
            embedColor = await getPredominantColor(selectedPuzzleThumb);

            //PUZZLE IMAGE AND ANSWERS
          const puzzleEmbed = new MessageEmbed()
            .setColor(embedColor)
            .setTitle(`${selectedPuzzleName.toUpperCase()}`)
            
            if(selectedPuzzleShape == "crossword"){
              puzzleEmbed.setThumbnail(selectedPuzzleThumb);
              puzzleEmbed.setDescription(crosswordDescStr);
              puzzleEmbed.addField('DOWN [ANSWERS]', crosswordDownStr, true);
              puzzleEmbed.addField('ACROSS [ANSWERS]', crosswordAcrossStr, true);
            }else{
              puzzleEmbed.setImage(selectedPuzzleImg);
              puzzleEmbed.setDescription(answerStr);
            }

          
          //PUZZLE SOLVERS
          const embed = new MessageEmbed()
            .setColor(embedColor)
            .setTitle(`${selectedPuzzleName.toUpperCase()} SOLVES`)
            .setThumbnail(selectedPuzzleThumb)
            .addField(`SOLVES IN FIRST 24 HOURS (${firstDayPakoin} pakoin)`, within24HoursDiscord || 'No solves in first 24 hours...')
            .addField(' ', ' ')
            .addField(`REMAINING SOLVES (${pakoin[1]} pakoin)`, within48HoursDiscord.concat(remainingSolvesDiscord) || 'No additional solves... ')
            .setFooter({text: `Processed by ${interaction.user.tag.split("#")[0]}`});

          await interaction.channel.send({ embeds: [puzzleEmbed, embed]});

          let alreadyProcessed24Hours = '';
          let alreadyProcessedRemaining = '';


          if(within24HoursWithWallets.length>0){
            console.log('Adding 24 Hour Solvers to Maize Input File')
            alreadyProcessed24Hours = await addToMaizeInputFile(selectedPuzzleId, within24HoursWithWallets,"PAKOIN",firstDayPakoin, selectedPuzzleName);
            await addXPToPuzzler(selectedPuzzleName,within24HoursDiscord.split(" "),"24HR");
          }

          if(within48HoursWithWallets.length>0){
            console.log('Adding 48 Hour Solvers to Maize Input File')
            alreadyProcessed24Hours = await addToMaizeInputFile(selectedPuzzleId, within48HoursWithWallets,"PAKOIN",pakoin[1], selectedPuzzleName);
            await addXPToPuzzler(selectedPuzzleName,within48HoursDiscord.split(" "),"48HR");
          }

          if(remainingSolvesWithWallets.length>0){
            console.log('Adding Remaining Solvers to Maize Input File')
            alreadyProcessedRemaining = await addToMaizeInputFile(selectedPuzzleId, remainingSolvesWithWallets,"PAKOIN",pakoin[1], selectedPuzzleName);
            await addXPToPuzzler(selectedPuzzleName,remainingSolvesDiscord.split(" "),"OTHER");
          }
          
          optimizeMaizeInputFile();

          let sendFollowUp = false;
          let followUpContent = '';
          if(UsersWithoutWallets.length>0){
            sendFollowUp = true;
            followUpContent = 'The following users do not have a wallet registered:\n' + UsersWithoutWallets.join(' ');
          }

          let alreadyProcessed = alreadyProcessed24Hours + alreadyProcessedRemaining;
          if(alreadyProcessed.length > 0){
            sendFollowUp = true;
            alreadyProcessed = `- ${alreadyProcessed.replace(new RegExp(`${selectedPuzzleId}:`, 'g'), '').split(',').join(`\n- `)}`;
            if(followUpContent !== ''){
              followUpContent += '/n';
            }
            followUpContent += `:warning: **PROCESS INCLUDED PREVIOUSLY PROCESSED DATA** :warning:\n\n*${selectedPuzzleName.toUpperCase()} was previously processed for:*\n${alreadyProcessed}`
          }

          if(sendFollowUp){
              await interaction.followUp({
                content: followUpContent,
                ephemeral: true,
            });
          }

            /*  
            if(prizes.length > 2){
                >>> RUN RAND-O-MATIC WHICH SHOULD ADD THE PRIZES TO MAIZE
            }*/

          collector.stop();       
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