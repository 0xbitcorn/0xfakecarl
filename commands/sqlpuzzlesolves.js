// sqlpuzzlesolves.js
const {ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder} = require('discord.js');
const {toTitleCase, getPredominantColor} = require('../bot.js');
const {readGoogleSheet, getDataByFirstColumnValue, googleWalletLookup} = require('../functions/googleSheets.js');
const {addToMaizeInputFile, optimizeMaizeInputFile} = require('../functions/maize.js');
const {addXPToPuzzler} = require('../functions/puzzlerpass.js');
const { channel } = require('process');
const { inputEncoding } = require('min-document');
const pglogo = 'https://cdn.discordapp.com/attachments/933487341824270356/1031769217235701781/PGlogo_whitebg.png'


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
        

        let pakoin;
        let defaultData;
        let prizes;
        let puzzlepassEXP;
        
        // Get the selected puzzle kind from the interaction
        const puzzleKind = interaction.options.getString('kind');

        // PG-NOTES: Complex Debugging utility should be extracted out to a separate function
        // //
        // console.log(`\x1b[32m[INITIATING PROCESS FOR TYPE: ${puzzleKind.toUpperCase()}]\x1b[0m`);
        // console.log("\x1b[36m[GOOGLESHEETS]\x1b[0m Collecting Pakoin Amounts");
        // pakoin = await readGoogleSheet(`DEFAULTS`, [`FIRSTDAY`,`ALLSOLVES`]);
        // console.log(">>> PAKOIN:" + pakoin);
        // console.log("\x1b[36m[GOOGLESHEETS]\x1b[0m Collecting Prize and EXP Data");
        // defaultData = await getDataByFirstColumnValue('DEFAULTS', 'PUZZLEDEFAULTS', puzzleKind.toUpperCase());
        // prizes = [...defaultData].splice(0,2).splice(4,7);
        // puzzlepassEXP = [...defaultData].splice(6,3);
        // if(prizes.length > 0){
        //   console.log(">>> ADDITIONAL PRIZES: " + prizes);
        // }else{
        //   console.log(">>> NO ADDITIONAL PRIZES" + prizes);
        // }
        // console.log('puzzlerpass XP:' + puzzlepassEXP);

        //Collect prizes for specified puzzle
        // PG-NOTES: Don't create a separate async function, just 
        // use the code in the same context (like shown above)
          (async () => {
            try {
                console.log(`\x1b[32m[INITIATING PROCESS FOR TYPE: ${puzzleKind.toUpperCase()}]\x1b[0m`);
                console.log("\x1b[36m[GOOGLESHEETS]\x1b[0m Collecting Pakoin Amounts");
                pakoin = await readGoogleSheet(`DEFAULTS`, [`FIRSTDAY`,`ALLSOLVES`]);
                console.log(">>> PAKOIN:" + pakoin);
                console.log("\x1b[36m[GOOGLESHEETS]\x1b[0m Collecting Prize and EXP Data");
                defaultData = await getDataByFirstColumnValue('DEFAULTS', 'PUZZLEDEFAULTS', puzzleKind.toUpperCase());
                prizes = [...defaultData].splice(0,2).splice(4,7);
                puzzlepassEXP = [...defaultData].splice(6,3);
                if(prizes.length > 0){
                  console.log(">>> ADDITIONAL PRIZES: " + prizes);
                }else{
                  console.log(">>> NO ADDITIONAL PRIZES" + prizes);
                }
                console.log('puzzlerpass XP:' + puzzlepassEXP);

            } catch (error) {
                console.error(error.message);
            }
            })();


  
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
            await interaction.deferUpdate().then(console.log).catch(console.error);
        } catch (error){
            console.error('Error sending initial message: ', error.message);
        }
  
        // Event listener for the select menu
        const filter = (i) => i.customId === 'selectPuzzle' && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });
        let selectedPuzzleName, selectedPuzzleShape, selectedPuzzleThumb, selectedPuzzleImg, selectedPuzzleAnswers, selectedPuzzleQuestions;


        collector.on('collect', async (i) => {
          const selectedPuzzleId = i.values[0];                                                                 // COLLECTING DETAILS FOR SELECTED PUZZLE
          // PG-NOTES: Just find the puzzle once and store it in a variable
          // Also handle the case where the puzzle is not found
          // const latestPuzzle = latestPuzzles.find((puzzle) => puzzle.id === selectedPuzzleId)
          // if (!latestPuzzle) {
          //   handle here
          // }
          // const selectedPuzzleName =  latestPuzzle?.name
          selectedPuzzleName = latestPuzzles.find((puzzle) => puzzle.id === selectedPuzzleId)?.name;            // NAME OF PUZZLE
          selectedPuzzleShape = latestPuzzles.find((puzzle) => puzzle.id === selectedPuzzleId)?.shape;          // SHAPE (STANDARD/CROSSWORD)
          selectedPuzzleThumb = latestPuzzles.find((puzzle) => puzzle.id === selectedPuzzleId)?.thumbnail;      // THUMBNAIL GRAPHIC (COVER IMAGE)
          selectedPuzzleImg = latestPuzzles.find((puzzle) => puzzle.id === selectedPuzzleId)?.puzzle_image;     // MAIN PUZZLE IMAGE
          selectedPuzzleAnswers = latestPuzzles.find((puzzle) => puzzle.id === selectedPuzzleId)?.answers;      // ANSWERS
          selectedPuzzleQuestions = latestPuzzles.find((puzzle) => puzzle.id === selectedPuzzleId)?.questions;  // QUESTIONS (USED TO NUMBER THE ANSWERS)
          const selectedPuzzleId = i.values[0];                                                                           // COLLECTING DETAILS FOR SELECTED PUZZLE
          selectedPuzzleName = latestPuzzles.find((puzzle) => puzzle.id === selectedPuzzleId)?.name;                      // NAME OF PUZZLE
          selectedPuzzleShape = latestPuzzles.find((puzzle) => puzzle.id === selectedPuzzleId)?.shape;                    // SHAPE (STANDARD/CROSSWORD)
          selectedPuzzleThumb = latestPuzzles.find((puzzle) => puzzle.id === selectedPuzzleId)?.thumbnail || pglogo;      // THUMBNAIL GRAPHIC (COVER IMAGE)
          selectedPuzzleImg = latestPuzzles.find((puzzle) => puzzle.id === selectedPuzzleId)?.puzzle_image || pglogo;     // MAIN PUZZLE IMAGE
          selectedPuzzleAnswers = latestPuzzles.find((puzzle) => puzzle.id === selectedPuzzleId)?.answers;                // ANSWERS
          selectedPuzzleQuestions = latestPuzzles.find((puzzle) => puzzle.id === selectedPuzzleId)?.questions;            // QUESTIONS (USED TO NUMBER THE ANSWERS)

          

          console.log(`\x1b[32m[COLLECTING SOLVERS FOR PUZZLE: ${selectedPuzzleName}]\x1b[0m`);

          //STRING COLLECTORS
          let answerStr = '**ANSWERS** \n';             
          let crosswordDownStr = '';
          let crosswordAcrossStr = '';
          let crosswordDescStr = '**DOWN [CLUES]** \n'
          
          // VARIBLES USED FOR NUMBERING
          let qCount = 1;
          let crosswordCounter = 0;
          
          // POPULATE ANSWER INFORMATION (IF CROSSWORD, ALSO COLLECT CLUES)
          if(Array.isArray(selectedPuzzleAnswers) || (selectedPuzzleShape == "crossword" && typeof selectedPuzzleAnswers === 'object')){
            if(selectedPuzzleShape == "crossword"){
                
                console.log(Object.keys(selectedPuzzleAnswers.down));

                for(const index in selectedPuzzleAnswers.down){
                  //crosswordDescStr += `${Object.keys(selectedPuzzleAnswers.down)[crosswordCounter]}\\. ${toTitleCase(selectedPuzzleAnswers.down[index].clue)} \n`;
                  crosswordDownStr += `${Object.keys(selectedPuzzleAnswers.down)[crosswordCounter]}\\. ${toTitleCase(selectedPuzzleAnswers.down[index].answer)} \n`;
                  crosswordCounter++;
                }
                //crosswordDescStr += '\n **ACROSS [CLUES]** \n';
                console.log(Object.keys(selectedPuzzleAnswers.down));
                crosswordCounter = 0;
                for(const index in selectedPuzzleAnswers.across){
                  //crosswordDescStr += `${Object.keys(selectedPuzzleAnswers.across)[crosswordCounter]}\\. ${toTitleCase(selectedPuzzleAnswers.across[index].clue)} \n`;
                  crosswordAcrossStr += `${Object.keys(selectedPuzzleAnswers.across)[crosswordCounter]}\\. ${toTitleCase(selectedPuzzleAnswers.across[index].answer)} \n`;
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
  
          console.log('Collecting Discord ID for all solvers...');
          // Query to get user Discord IDs
          const usersQuery = 'SELECT id, discord_id, wallet FROM oldman.users';
          const usersResult = await pgClient.query(usersQuery);
          const usersMap = new Map(usersResult.rows.map((user) => [user.id, {discord: user.discord_id, wallet: user.wallet}]));
  
          // Separate users into two groups based on solve time
          console.log('Splitting solvers into groups based on solve time...');
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
                // PG-NOTES: You can just do !user.wallet
                // if (!user.wallet)

                if(user.wallet == null || user.wallet == undefined || user.wallet == ''){
                    // PG-NOTES: You should just do a `continue` here
                    // since you're filtering them out later anyway
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
                console.log("OTHR: " + mention + " : " + user.wallet + noteStr);
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

 console.log('Building embeds...');
 
let prizestr = '';
let embedColor;

          try{
            
            embedColor = await getPredominantColor(selectedPuzzleThumb);

            //PUZZLE IMAGE AND ANSWERS
          const puzzleEmbed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle(`${selectedPuzzleName.toUpperCase()}`)
            if(selectedPuzzleShape == "crossword"){
              puzzleEmbed.setThumbnail(selectedPuzzleThumb);
              //puzzleEmbed.setDescription(crosswordDescStr);
              puzzleEmbed.addFields(
                {name: 'DOWN', value: crosswordDownStr, inline: true},
                {name: 'ACROSS', value: crosswordAcrossStr, inline: true},
              );
            }else{
              puzzleEmbed.setImage(selectedPuzzleImg);
              puzzleEmbed.setDescription(answerStr);
            }
            console.log('Answer embed created...');
          
          //PUZZLE SOLVERS
          const embed = new EmbedBuilder()
            .setColor(embedColor)
            .setTitle(`${selectedPuzzleName.toUpperCase()} SOLVES`)
            .setThumbnail(selectedPuzzleThumb)
            .addFields(
              {name: `SOLVES IN FIRST 24 HOURS (${firstDayPakoin} Pakoin)`, value: within24HoursDiscord || 'No solves in first 24 hours...'},
              {name: ' ', value: ' '},
              {name: `REMAINING SOLVES (${pakoin[1]} Pakoin)`, value: within48HoursDiscord.concat(remainingSolvesDiscord) || 'No additional solves... '},
            )
            .setFooter({text: `Processed by ${interaction.user.tag.split("#")[0]}`});
            console.log('Solver embed created...');
          await interaction.channel.send({ embeds: [puzzleEmbed, embed]});
          console.log('Embeds posted...');
          let alreadyProcessed24Hours = '';
          let alreadyProcessedRemaining = '';

          console.log(`\x1b[32m${selectedPuzzleName.toUpperCase()} solves identified.\x1b[0m`);
          console.log('\x1b[36m[MAIZE]\x1b[0m submit applicable prizes to Input.txt file');
          console.log('\x1b[36m[PUZZL3RPA5S]\x1b[0m submit XP to _xp-log');

          if(within24HoursWithWallets.length>0){
            console.log('\x1b[36m[MAIZE]\x1b[0m ADDING PRIZES FOR: 24HR');
            alreadyProcessed24Hours = await addToMaizeInputFile(selectedPuzzleId, within24HoursWithWallets,"PAKOIN",firstDayPakoin, selectedPuzzleName);
            console.log('\x1b[36m[PUZZL3RPA5S]\x1b[0m ADDING ' + puzzlepassEXP[0] + ' EXP FOR: 24HR');
            await addXPToPuzzler(selectedPuzzleName, within24HoursDiscord.split(" "),"24HR", puzzlepassEXP[0]);
          }

          if(within48HoursWithWallets.length>0){
            console.log('\x1b[36m[MAIZE]\x1b[0m ADDING PRIZES FOR: 48HR');
            alreadyProcessed24Hours = await addToMaizeInputFile(selectedPuzzleId, within48HoursWithWallets,"PAKOIN",pakoin[1], selectedPuzzleName);
            console.log('\x1b[36m[PUZZL3RPA5S]\x1b[0m ADDING ' + puzzlepassEXP[1] + ' EXP FOR: 48HR');
            await addXPToPuzzler(selectedPuzzleName, within48HoursDiscord.split(" "),"48HR", puzzlepassEXP[1]);
          }

          if(remainingSolvesWithWallets.length>0){
            console.log('\x1b[36m[MAIZE]\x1b[0m ADDING PRIZES FOR: OTHR');
            alreadyProcessedRemaining = await addToMaizeInputFile(selectedPuzzleId, remainingSolvesWithWallets,"PAKOIN",pakoin[1], selectedPuzzleName);
            console.log('\x1b[36m[PUZZL3RPA5S]\x1b[0m ADDING ' + puzzlepassEXP[2] + ' EXP FOR: OTHR');
            await addXPToPuzzler(selectedPuzzleName, remainingSolvesDiscord.split(" "),"OTHER", puzzlepassEXP[2]);
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

          await interaction.editReply({content: `*${selectedPuzzleName} successfully processed*`, components: []}).catch(console.error);

          if(sendFollowUp){
            console.log('Sending follow up message...');

            await interaction.followUp({
                content: followUpContent,
                ephemeral: true,
            });
          }else{
            await interaction.followUp(`[${selectedPuzzleName} SUCCESSFULLY PROCESSED]`);
          }

            // CURRENTLY ONLY FOR CORNMOJI  
            if(prizes.length > 0){
              //NEED RANDOMATIC FUNCTION
              console.log(`\x1b[32m[PROCESSING ADDITIONAL PRIZES]\x1b[0m`);
              console.log(`24 HR SOLVE WINNER: ${prizes[0]}`);
              console.log(`ALL SOLVES WINNER 1: ${prizes[1]}`);
              console.log(`ALL SOLVES WINNER 2: ${prizes[2]}`);
              console.log(`ALL SOLVES WINNER 3: ${prizes[3]}`);
            }
            console.log(`\x1b[32m[${selectedPuzzleName} SUCCESSFULLY PROCESSED]\x1b[0m`);
          collector.stop();       
          } catch(error){
            console.error('Error sending follow-up message:', error.message);
          }

        });

      } catch (error) {
        console.error('Error executing solves command:', error.message);
        await interaction.editReply('Error executing solves command.');
      }
    },
  };
