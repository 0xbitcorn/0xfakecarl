//////////////////
//  0xfakeCARL  //
//////////////////

const { Client: PGClient } = require('pg');
const {Client, Intents, MessageSelectMenu, MessageActionRow, MessageEmbed, MessageAttachment} = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { createCanvas, loadImage } = require('canvas');
const GIFEncoder = require('gif-encoder-2');
const auth = require('./auth/auth.json');
const fs = require('fs');
const nodefetch = require('node-fetch');
const Vibrant = require('node-vibrant');

/////////////////////////
// DISCORD BLAIQ Party //
/////////////////////////

const guildId ='962059766388101301';
const carl = 'https://cdn.discordapp.com/avatars/971503249138008134/c2abcb03ecba9ec9169b51667a67e507.png';

const client = new Client({
	intents: [
	  Intents.FLAGS.GUILDS,
	  Intents.FLAGS.GUILD_MEMBERS,
	  Intents.FLAGS.GUILD_MESSAGES,
	  Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
	  Intents.FLAGS.DIRECT_MESSAGES,
	  Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
	  Intents.FLAGS.DIRECT_MESSAGE_TYPING,
	],
	partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
  });

//PUZZLEGANG Database
const pgClient = new PGClient({
	user: 'bitcorn',
	host: 'localhost',
	database: 'puzzlegang',
	password: auth.pgpassword,
	port: 5432, // Change if your PostgreSQL server uses a different port
  });


client.once('ready', () =>{
	console.log(`${client.user.tag} is connected to Discord!`);
	pgClient.connect();
	client.user.setActivity('with carls mind', 'PLAYING');

  // Register slash commands
  const rest = new REST({ version: '9' }).setToken(auth.token);
  const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

  let slashcommands = '';
  const dynamicCommands = [];
  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    dynamicCommands.push(command.data);
	slashcommands += ' /' + command.data.name;
  }

  console.log("(/) Commands Found:" + slashcommands);

  (async () => {
    try {

      await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), {
        body: dynamicCommands,
      });

      console.log('(/) Commands Registered...');
    } catch (error) {
      console.error(error);
    }
  })();

})

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    // Find the appropriate command file based on the custom ID
    const commandFile = fs.readdirSync('./commands').find(file => {
        const command = require(`./commands/${file}`);
        return interaction.commandName == command.data.name;
    });

    if (commandFile) {
        const command = require(`./commands/${commandFile}`);

        await command.execute(interaction, pgClient);
    }
});

client.on('error', console.log);

client.login(auth.token);

/////////////////
//  CONSTANTS  //
/////////////////

//GOOGLE SHEET: MASTER PUZZLER WALLET LIST
const spreadsheetId = '1OxfvL9x2AEPR17DUI6R9TW-Edwbxl6vpLfW43wmUQbE';

//MAIZE INPUT FILE
const maizeFile ='C:\\dev\\maize\\Input\\Input.txt';

//FILE TO TRACK PUZZLES PUSHED TO MAIZE
const maizeTracker = './createdfiles/tracker.txt';

//gif for RAND-O-MATIC
const gifFile = './createdfiles/random.gif';

//NFT MAP
const nftMapping = {
	'PAKOIN': '0x0b955791fd8f2cb860dd2578b48b2ae259a9d252f28cc2e595bf3954e1cc718f',
	'CORNMOJI': '0x1c939a4c71138a0650c6641f631baf700a212935f7a21dea0c0d1a432af563ec',
	'KORNMOGEE': '0x1a157e10b688afcb903e1174ed3a33a5ada8b077abf2f99b544f2bb6e144694e',
};

//RAND-O-MATC VARIABLES
const size = 128;
const topOffset = 30;
const leftOffset = 26;
const partydoggo = "<a:PARTYDOGGO:971972766150570074>"
const danceboy = "<a:danceboy:1098290306081894551>"
const arrowright = ":arrow_right:"
const pglogo ='https://cdn.discordapp.com/attachments/933487341824270356/1031769217235701781/PGlogo_whitebg.png'
const pglogospin ="https://cdn.discordapp.com/emojis/986058074253066290.gif"
const noAvatar = pglogo + "?size=128"
const fakeAvatars = [
	'https://cdn.discordapp.com/attachments/1089796271142875197/1191942319738462238/JEFF.png?size=128',
	`https://cdn.discordapp.com/attachments/1089796271142875197/1191942319952379936/FFEJ_1.png?size=128`,
	'https://cdn.discordapp.com/attachments/1089796271142875197/1191931955143508130/pickedMedia1.png?size=128',
	'https://cdn.discordapp.com/attachments/1089796271142875197/1191931955483258941/pickedMedia1.png?size=128',
	'https://cdn.discordapp.com/attachments/1089796271142875197/1191931956552794173/pickedMedia1.png?size=128',
	'https://cdn.discordapp.com/attachments/1089796271142875197/1191942319738462238/JEFF.png?size=128',
	`https://cdn.discordapp.com/attachments/1089796271142875197/1191942319952379936/FFEJ_1.png?size=128`,
	`https://cdn.discordapp.com/attachments/1089796271142875197/1191931955797819412/pickedMedia1.png?size=128`,
	'https://cdn.discordapp.com/attachments/1089796271142875197/1191931956041101413/pickedMedia1.png?size=128',
	'https://cdn.discordapp.com/attachments/1089796271142875197/1191931956292755607/pickedMedia1.png?size=128',
	'https://cdn.discordapp.com/attachments/1089796271142875197/1191942319738462238/JEFF.png?size=128',
	`https://cdn.discordapp.com/attachments/1089796271142875197/1191942319952379936/FFEJ_1.png?size=128`,
	'https://cdn.discordapp.com/attachments/1089796271142875197/1191931957228077157/pickedMedia1.png?size=128',
	`https://cdn.discordapp.com/attachments/1089796271142875197/1191931956930289825/pickedMedia1.png?size=128`,
	'https://cdn.discordapp.com/attachments/1089796271142875197/1191931957488136272/pickedMedia1.png?size=128',
	'https://cdn.discordapp.com/attachments/1089796271142875197/1191942319738462238/JEFF.png?size=128',
	`https://cdn.discordapp.com/attachments/1089796271142875197/1191942319952379936/FFEJ_1.png?size=128`
  ];

const nopeAvocado = 5; 						//% chance of winning
const nopeCarrot = 31;						//% chance of winning
const nopePotato = 30;						//% chance of winning
const nopeTomato = 17;						//% chance of winning
const nopeEggplant = 17;					//% chance of winning

//USERS
const bitcorn = '416645304830394368';
const agentX3 = `213170363876507649`;

/////////////
// GLOBALS //
/////////////

global.currsolvechan;
global.glbGameNum = '';
global.bpServer;
global.GIFbeingRecreated = false;

/////////////////////
// MAIZE FUNCTIONS //
/////////////////////

async function addToMaizeInputFile(puzzle_id, walletData, NFTname, QTY=1) {

	// Look up the NFT id based on the NFT string
	const NFTid = nftMapping[NFTname] || 'UNKNOWN';
	let alreadyProcessed = ' ';

	if (NFTid == 'UNKNOWN'){
		throw new Error('UNKNOWN NFT, NEED MAIZE nftData string.');
	}
    try {
        // Ensure data is an array
        const walletArray = Array.isArray(walletData) ? walletData : [walletData];
        // Write content to the text file
		for (const wallet of walletArray){
			if(!searchMaizeTracker(`${puzzle_id}:${wallet}`)){
				fs.appendFileSync(maizeFile, `${NFTid},${QTY},${wallet},PG LOVES YOU!\n`);  // Adding a newline before appending new content
				fs.appendFileSync(maizeTracker, `${puzzle_id}:${wallet}, `);  // Adding a newline before appending new content
			}else{
				alreadyProcessed += `${puzzle_id}:${wallet},`
			}
		}
        console.log(`Data appended to ${maizeFile}`);
		if(alreadyProcessed !== ''){
			console.log(`[WARNING] Process includes data that has already been processed: ${puzzle_id}`);
			return alreadyProcessed.slice(0,-1).trim();
		}
    } catch (error) {
        console.error('Error appending data:', error.message);
    }
}

function searchMaizeTracker(searchValue) {
    try {
        const fileContent = fs.readFileSync(maizeTracker, 'utf-8');
        return fileContent.includes(searchValue);
    } catch (error) {
        console.error('Error reading the file:', error.message);
        return false;
    }
}


async function clearMaizeInputFile() {
    try {
        fs.writeFileSync(maizeFile, '');
        console.log(`Content cleared from ${maizeFile}`);
    } catch (error) {
        console.error('Error clearing file:', error.message);
    }
	return true;
}

function optimizeMaizeInputFile() {
    try {
        const fileContent = fs.readFileSync(maizeFile, 'utf-8');
        const lines = fileContent.split('\n');
        const combinedQuantities = new Map();

        lines.forEach(line => {
			if (line.trim() !== '') {
            const [nftID, nftQTY, userWallet, message] = line.split(',');

            // Generate a unique key for each line based on nftID and userWallet
            const key = `${nftID}-${userWallet}`;

            if (combinedQuantities.has(key)) {
                // If the key exists, update the quantity by adding the new nftQTY
                combinedQuantities.set(key, combinedQuantities.get(key) + parseInt(nftQTY));
            } else {
                // If the key doesn't exist, add it to the map with the current nftQTY
                combinedQuantities.set(key, parseInt(nftQTY));
            }
        }});

       // Create a new array with the combined quantities
	   const updatedLines = Array.from(combinedQuantities, ([key, quantity]) => {
		const [nftID, userWallet] = key.split('-');
		return `${nftID},${quantity},${userWallet},PG LOVES YOU!`;
		
	});

	updatedLines.push(``);

	fs.writeFileSync(maizeFile, updatedLines.join('\n'), 'utf-8');

	console.log('File updated successfully.');

	} catch (error) {
		console.error('Error processing the input file:', error.message);
	}
}

///////////////////
// GOOGLE SHEETS //
///////////////////

const {google} = require('googleapis');
const {JWT} = require('google-auth-library');

async function authorizeGoogleSheets() {
	const credentials = require('./auth/carl-410118-ecff430dbb92.json');
	const jwtClient = new JWT({
		email: credentials.client_email,
		key: credentials.private_key,
		scopes: ['https://www.googleapis.com/auth/spreadsheets'],
	  });
  
	await jwtClient.authorize();
	console.log('Connected to Google Sheets...');
	return google.sheets({ version: 'v4', auth: jwtClient });
  }


  // currently not used
  async function getAllDataFromSheet(sheetName) {
	try {
	  const sheets = await authorizeGoogleSheets();
  
	  // Fetch all values from the specified sheet
	  const sheet = await sheets.spreadsheets.values.get({
		spreadsheetId,
		range: `${sheetName}!A:B`,
	  });
  
	  // Extract the values from the response
	  const values = sheet.data.values || [];
  
	  return values;
	} catch (error) {
	  console.error(`Error retrieving data from Google Sheets: ${error.message}`);
	  throw new Error('Error retrieving data. Please try again later.');
	}
  }

async function getDataByFirstColumnValue(sheetName, namedRange, targetValue) {
	try {
	  const sheets = await authorizeGoogleSheets();
  
	  // Fetch the values from the specified named range
	  const sheet = await sheets.spreadsheets.values.get({
		spreadsheetId,
		range: `${sheetName}!${namedRange}`,
	  });
  
	  // Extract the values from the response
	  const values = sheet.data.values;
  
	  // Find the row that contains the target value in the first column
	  const targetRow = values.find(row => row[0] === targetValue);
  
	  // Return the entire row as an array
	  return targetRow || [];
	} catch (error) {
	  console.error(`Error retrieving data from Google Sheets: ${error.message}`);
	  throw new Error('Error retrieving data. Please try again later.');
	}
  }

async function getNicknames(userIds) {
	console.log('Getting nicknames...');
	const guild = await client.guilds.fetch(guildId);l

	const nicknames = [];
	for (const userId of userIds) {
		try{
			const member = await guild.members.fetch(userId);
			const nickname = member ? member.nickname || member.user.username : null;
			nicknames.push(nickname);
		}catch(err){
			console.log('User nickname not found:' + userId);
		}
	}
	console.log(nicknames);
  
	return nicknames;
  }

  async function readGoogleSheet(sheetName, cellRanges) {
	try {
		const sheets = await authorizeGoogleSheets();
	
		// Check if cellRanges is an array
		if (Array.isArray(cellRanges)) {
		  const valuesArray = [];
	
		  // Loop through each element in the array
		  for (const cellRange of cellRanges) {
			if (typeof cellRange === 'string') {
			  const sheet = await sheets.spreadsheets.values.get({
				spreadsheetId,
				range: `${sheetName}!${cellRange}`,
			  });
	
			  // Extract the values from the response and push them to the array
			  const values = sheet.data.values ? sheet.data.values[0] : undefined;
			  valuesArray.push(values);
			} else {
			  throw new Error(`Invalid element in the array: ${cellRange}`);
			}
		  }
		  return valuesArray;
		} else {
		  throw new Error('Input must be an array of cell addresses and/or named ranges.');
		}
	  } catch (error) {
		console.error('Error reading Google Sheets data:', error.message);
	  }
	}

// currently not used
async function writeToGoogleSheet(userIds, sheetName) {
	
	const data = await getNicknames(userIds);
	console.log('Writing to google sheet...');
  
	try {
		const sheets = await authorizeGoogleSheets();
		const rangeStartRow = await findFirstEmptyCell(sheets, spreadsheetId, sheetName);
		const range = `${sheetName}!A${rangeStartRow}`;
		const valueInputOption = 'USER_ENTERED';
	
		const requestBody = {
		  values: data.map(item => [item]),
		};
	
		const response = await sheets.spreadsheets.values.update({
		  spreadsheetId,
		  range,
		  valueInputOption,
		  resource: requestBody,
		});
	
		console.log('Google Sheets updated successfully:', response.data);
	  } catch (error) {
		console.error('Error updating Google Sheets:', error.message);
	  }  }


  async function findFirstEmptyCell(sheets, spreadsheetId, sheetName) {
	const response = await sheets.spreadsheets.values.get({
	  spreadsheetId,
	  range: `${sheetName}!A:A`,
	});
  
	const values = response.data.values;
  
	if (!values || values.length === 0) {
	  return 1; // If column A is completely empty, return the first cell
	}
  
	// Find the first empty cell in column A
	for (let i = 0; i < values.length; i++) {
	  if (!values[i][0]) {
		return i + 1; // Return the row number of the first empty cell
	  }
	}
  
	// If all cells are occupied, return the next row
	return values.length + 1;
  }
 
  //////////////////////
  /// OTHER FUNCTIONS //
  //////////////////////

  async function getPredominantColor(imagePath) {
    try {
        // Create a Vibrant object with the image path
        const vibrant = new Vibrant(imagePath);

        // Get the color palette asynchronously
        const palette = await vibrant.getPalette();

        // Access the predominant color
        const predominantColor = palette.Vibrant.rgb;

        
		return predominantColor;
    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
}
  
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

function randomSelect(randomPlayers, winners = 1, nopemoji=false) {
	var i = 0;
	var totalentries = 0;
	var currUser = '';
	var numEntries = 0;

	var unshuffled = new Array();
	randomPlayers.forEach(element => {
		if(element.includes(',')){
		currUser = element.split(",")[0];
		numEntries = element.split(",")[1];		
		}else{
		currUser = element;
		numEntries = 1;
		}
		for (let i = 0; i < numEntries; i++){
			unshuffled[i + totalentries] = currUser;
			totalentries++;
		} 
	});

	//console.log('unshuffled: ' + unshuffled);

	let shuffled = unshuffled
	.map(value => ({ value, sort: Math.random() }))
	.sort((a, b) => a.sort - b.sort)
	.map(({ value }) => value)

	//console.log('shuffled: ' + shuffled);

var randomIndex;

if(winners>shuffled.length){
	winners = shuffled.length;
}

for(i=1; i <= winners; i++){
	console.log('Picking winner ' + i +'...');
	randomIndex = getRndInteger(0,shuffled.length);
	if(i == 1){
		
		if(nopemoji){
			str = getNopemoji() + ' ' + shuffled[randomIndex];
		}else{
			if(winners>1){
				str = shuffled[randomIndex];
			}else{
			str = shuffled[randomIndex];
			}
		}
	}else{
		if(nopemoji){
			str = str + '\n' + getNopemoji() + ' ' + shuffled[randomIndex];
		}else{
			str = str + ' ' + shuffled[randomIndex];
		}
	}

	if(winners>1 && i < winners){
		console.log('Removing selected winner and shuffling...');
		shuffled.splice(randomIndex,1);
		unshuffled = shuffled;
		shuffled = unshuffled
		.map(value => ({ value, sort: Math.random() }))
		.sort((a, b) => a.sort - b.sort)
		.map(({ value }) => value)
	}
}	
	return str;

}

function getNopemoji(){
	var unshuffled = [];
	
	for(let i=1; i<nopeAvocado; i++){
		unshuffled.push('🥑');
	}

	for(let i=1; i<nopeCarrot; i++){
		unshuffled.push('🥕');
	}

	for(let i=1; i<nopeEggplant; i++){
		unshuffled.push('🍆');
	}

	for(let i=1; i<nopePotato; i++){
		unshuffled.push('🥔');
	}

	for(let i=1; i<nopeTomato; i++){
		unshuffled.push('🍅');
	}

	let shuffled = unshuffled
	.map(value => ({ value, sort: Math.random() }))
	.sort((a, b) => a.sort - b.sort)
	.map(({ value }) => value);
	
	var randomIndex = getRndInteger(0,shuffled.length);

	return shuffled[randomIndex];
}



//////////////////
// RAND-O-MATIC //
//////////////////

async function getAvatars(userMentions) {
	const avatarUrls = [];
	for (const mention of userMentions) {
	  const userId = mention.replace(/[^0-9]/g, ''); // Extract numerical user ID
	  try {
		const user = await client.users.fetch(userId);
		avatarUrls.push(user.avatarURL({ format: 'png', size: size }));
	  } catch (error) {
		console.error(`Error fetching avatar for ${mention}: ${error.message}`);
		console.log('Assigning default avatar...');
		avatarUrls.push(noAvatar);
	  }
	}
	return avatarUrls;
  }
    
  async function createGif(avatarUrls, winnerUserIDs) {
	  console.log('Creating GIF...');
	  const canvas = createCanvas(size*winnerUserIDs.length, size+topOffset);
	  const ctx = canvas.getContext('2d');
	  const encoder = new GIFEncoder(size*winnerUserIDs.length, size+topOffset);
	  const gifBuffer = fs.createWriteStream(gifFile);
	  let frameDelay;
	  let avatars2;
	  let avatars3;
  
	  // Handle stream events
	  const gifPromise = new Promise((resolve, reject) => {
		  gifBuffer.on('finish', () => {
			  console.log('GIF creation complete...');
			  resolve(fs.readFileSync(gifFile));
		  });
  
		  gifBuffer.on('error', (err) => {
			  console.error('Error writing GIF:', err);
			  reject(err);
		  });
	  });

	  //find userID in avatar url
	  const userIdFromUrl = (url) => {
		const match = url.match(/avatars\/(\d+)\//);
		return match[1] ? match[1] : null;
	  };
  
	  const delayBetweenFetches = 100; // Adjust the delay as needed (in milliseconds)

	  encoder.createReadStream().pipe(gifBuffer);
	  encoder.start();
	  encoder.setRepeat(0); // 0 means repeat indefinitely

  
	  for (let cycle = 1; cycle <= 8; cycle++) {
		  let speedMultiplier;
  
		  switch (cycle) {
			  case 1:
				  speedMultiplier = 2;
				  break;
			  case 2:
			  case 3:
			  case 4:
				  speedMultiplier = 3;
				  break;
			  case 5:
			  case 6:
				  speedMultiplier = 4;
				  break;
			  case 7:
				  speedMultiplier = 3;
				  break;
			  case 8:
				  speedMultiplier = 1;
				  break;
			  default:
				  speedMultiplier = 1; // Default to 1 for any other value
				  break;
		  }

		  // Use Promise.all to fetch and load all images with a delay between each fetch
		  const avatarPromises = avatarUrls.map(async (avatarUrl, index) => {
			  // Introduce a delay before each fetch
			  await new Promise(resolve => setTimeout(resolve, index * delayBetweenFetches));
		  
			  const response = await nodefetch(avatarUrl);
		  
			  // Check if response status is successful
			  if (!response.ok) {
				  console.error(`Failed to fetch avatar for ${avatarUrl}. Status: ${response.status}`);
				  return null; // Return null for failed fetch
			  }
		  
			  const buffer = await response.buffer();
			  return loadImage(buffer);
		  });
  
		  // Wait for all image loading promises to resolve
		  const avatars = await Promise.all(avatarPromises);

		  if(cycle == 1){
			if(winnerUserIDs.length> 1){
				avatars2 = avatars.slice().sort(() => Math.random() - 0.5);
			 }
			 if(winnerUserIDs.length > 2){
				avatars3 = avatars.slice().sort(() => Math.random() - 0.5);
			 }   
		  }
  
		  for (let i = 0; i < avatars.length; i++) {
			  const response = await nodefetch(avatarUrls[i]);

			  ctx.strokeStyle = "rgb(209, 71, 58)";
			  ctx.lineWidth = 7;

  
			  // Skip frames with failed image fetch
			  if (avatars[i]) {
				  ctx.globalAlpha = 0.8;

				  if(cycle > 1){
					encoder.addFrame(ctx);
				  }

				  ctx.globalAlpha = 1.0;
				  ctx.clearRect(0, 0, canvas.width, canvas.height);
				  ctx.drawImage(avatars[i], 0, topOffset, size, size);
				  ctx.fillStyle = "white";
				  ctx.font = '14px Verdana';
				  if(winnerUserIDs.length == 1){
					ctx.fillText(`WINNER`, leftOffset+6, 22);
				  }else{
					ctx.fillText(`WINNER 1`, leftOffset, 22);
				  }
				  
				  if(winnerUserIDs.length> 1){
					ctx.drawImage(avatars2[i], size, topOffset, size, size);
					ctx.fillText(`WINNER 2`, leftOffset+size, 22);
				  }
				  if(winnerUserIDs.length > 2){
					ctx.drawImage(avatars3[i], size*2, topOffset, size, size);
					ctx.fillText(`WINNER 3`, leftOffset+size*2, 22);
				  }

				  if(winnerUserIDs.length>1){
					ctx.strokeRect(size, 0, size, size+topOffset);
				  }

				  ctx.strokeRect(0, 0, canvas.width, canvas.height);

				  frameDelay = 100 / speedMultiplier;
				  encoder.setDelay(frameDelay); // Adjust speed
				  encoder.addFrame(ctx);

			  } else {
				  console.log('skipped a broken frame');
			  }
		  }
  
		  if (cycle === 8) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			  
			for (let i = 0; i < winnerUserIDs.length; i++){
				let winner;
				let winnerUserID = winnerUserIDs[i];
				console.log('winner user ID: ' + winnerUserID);
				
				try{

					winner = avatarUrls.find((url) => {
						const userIdFromAvatar = userIdFromUrl(url);
						if(userIdFromAvatar === null){
							console.log('userIDfromAvatar: No Avatar Found');
							return false;
						}
						console.log('userIdFromAvatar: ' + userIdFromAvatar);
						return userIdFromAvatar === winnerUserID;
					});

					if(winner){
						console.log(`Found Avatar for Winner ${i+1}: ${winner}`);
					}else{
						console.log(`Avatar NOT FOUND for Winner ${i+1}: ${winner}`);
						console.log(`Assigning default avatar...`);
						winner = noAvatar;
					}
					
				}catch(error){
					console.error(`Error fetching avatar for ${winnerUserIDs[i]}: ${error.message}`);
					console.log('Assigning default avatar...');
					winner = noAvatar;
				}

				const winnerResponse = await nodefetch(winner);
				// Check if response status is successful
				if (!winnerResponse.ok) {
					console.error(`Failed to fetch winner's avatar. Status: ${winnerResponse.status}`);
					continue; // Skip to the next iteration
				}
				const winnerBuffer = await winnerResponse.buffer();
				const winnerAvatar = await loadImage(winnerBuffer);
				await new Promise(resolve => setTimeout(resolve, delayBetweenFetches));


				await Promise.all([winnerAvatar]);
				ctx.drawImage(winnerAvatar, size*i, topOffset, size, size);

				ctx.fillStyle = "white";
				ctx.font = '14px Verdana';

				if(winnerUserIDs.length == 1){
					ctx.fillText(`WINNER`, leftOffset+6, 22);
				}else{
					ctx.fillText(`WINNER ${i + 1}`, leftOffset+size*i, 22);
				}

				console.log('get next winner...');

			}

			if(winnerUserIDs.length> 1){
				ctx.strokeRect(size, 0, size, size+topOffset);
			  }
			
			ctx.strokeRect(0, 0, canvas.width, canvas.height);


		      frameDelay = 10000;
			  encoder.setDelay(frameDelay); 
			  encoder.addFrame(ctx);
		  }
	  }
	  
	  await new Promise(resolve => setTimeout(resolve, delayBetweenFetches));
	  encoder.finish();
	  gifBuffer.end();
  
	// Check if the created GIF is corrupt and attempt to recreate it
	if (await isGifCorrupt(gifFile)) {

		if(!GIFbeingRecreated){
			console.log('GIF is corrupt. Attempting to recreate...');
			GIFbeingRecreated = true
			await recreateGif(avatarUrls, winnerUserIDs, gifFile);	
		}

		// Check if the recreated GIF is still corrupt
		if (await isGifCorrupt(gifFile)) {
		throw new Error('Failed to create a valid GIF.');
		}
	}else{
		console.log('GIF found to be valid...');
		return gifPromise;
	}
  }

  async function isGifCorrupt(gifPath) {
	console.log('Checking if GIF is corrupt...');
	try {
	  // Check if the file exists
	  fs.accessSync(gifPath, fs.constants.R_OK);
  
	  // Read the last byte of the file
	  const fileSize = fs.statSync(gifPath).size;
	  let buffer = Buffer.alloc(1);
	  const fileDescriptor = fs.openSync(gifPath, 'r+'); // Open the file in read/write mode
	  fs.readSync(fileDescriptor, buffer, 0, 1, fileSize-1);
	  
	  // Check if the last byte is the GIF trailer
	  const lastByte = buffer[0];
	  const isGifTrailer = lastByte === 0x3B;
  
	  if (!isGifTrailer) {
		console.error('GIF does not end with the GIF trailer. Adding trailer...');
		
		// Append the GIF trailer
		const trailerBuffer = Buffer.from([0x3B]);
		fs.writeSync(fileDescriptor, trailerBuffer, 0, 1, fileSize-1);
		console.log('GIF trailer added.');
	  }

	  fs.closeSync(fileDescriptor);
	  buffer = fs.readFileSync(gifPath);

	  // Check GIF version
	  const gifVersion = buffer.toString('ascii', 3, 6);
	  if (gifVersion !== '87a' && gifVersion !== '89a') {
		console.error('Unsupported GIF version');
		return true;
	  }

	  return false; // File is not corrupt
	} catch (err) {
	  console.error('GIF is corrupt or doesn\'t exist.', err);
	  return true; // File is corrupt or doesn't exist
	}
  }
  
  // Function to recreate a GIF if it is corrupt
  async function recreateGif(avatarUrls, winnerUserIDs, outputPath) {
	const recreatedGifBuffer = await createGif(avatarUrls, winnerUserIDs);
	await fs.writeFile(outputPath, recreatedGifBuffer);
  }

//[IN PROGRESS] MOVING RAND-O-MATIC TO A FUNCTION 
  async function processRaffle(winners, usersArray) {
	try {
	  console.log('Number of winners to select: ' + winners);

	  // Fetch avatars and create animation
	  console.log('fetching users avatars...')
	  const avatarUrls = await getAvatars(usersArray);
  
	  while (avatarUrls.length < 10) {
		console.log('Adding Fake Avatar...')
		let randomFakeAvatar = fakeAvatars[Math.floor(Math.random() * fakeAvatars.length)];
		avatarUrls.push(randomFakeAvatar);
	  }
  
	  console.log(usersArray);
	  // Pick random winners
	  const playerSelected = randomSelect(usersArray, winners);
	  if (playerSelected.length === 0) {
		throw 'zero-length string error';
	  }
	  console.log("[players selected]");
	  console.log(playerSelected);
  
	  let userIds = playerSelected.includes(' ')
		? playerSelected.split(' ').map(player => player.replace(/[^a-zA-Z0-9]/g, ''))
		: [playerSelected.replace(/[^a-zA-Z0-9]/g, '')];
  
	  console.log("[userIds of winners]");
	  console.log(userIds);
  
	  let additionalWinners = [];
  
	  if (winners > 3) {
		console.log('More than 3 winners, separating first 3...');
		additionalWinners = userIds.slice(3, userIds.length);
		userIds = userIds.slice(0, 3);
		console.log(userIds);
		console.log("and our remaining winners:");
		console.log(additionalWinners)
	  }
  
	  // Create GIFs for winners
	  const gifBuffer = await createGif(avatarUrls, userIds).then((gifBuffer) => {
  
		console.log('Preparing attachment...');
		let attachments = new MessageAttachment(gifBuffer, gifFile);
  
		const descStr = winners === 1 ? 'a random winner has' : 'random winners have';
		let msgText;
  
		console.log('Creating embed...');
  
		const raffleEmbed = new MessageEmbed()
		  .setTitle(`RAND-O-MATIC 9001`)
		  .setDescription(`*The following entries have been processed and ${descStr} been selected...*`)
		  .setImage('attachment://random.gif')
		  .setThumbnail(pglogospin)
		  .addFields(
			{ name: 'INPUT PROCESSED', value: usersArray.join(' ') + '\n '}
		  );
  
		// Add images based on the number of winners
		if (winners === 1) {
		  msgText = `# *CORNGRATULATIONS ${playerSelected}!!!*`;
		} else {
		  if (winners === 2) {
			msgText = `***CORNGRATULATIONS TO:***\n<a:GOLD:976939928283922432> WINNER 1   ${arrowright}   <@${userIds[0]}>\n<a:SILVER:976939928904691822> WINNER 2  ${arrowright}   <@${userIds[1]}>`;
		  } else {
			msgText = `***CORNGRATULATIONS TO:***\n<a:GOLD:976939928283922432> WINNER 1   ${arrowright}   <@${userIds[0]}>\n<a:SILVER:976939928904691822> WINNER 2  ${arrowright}   <@${userIds[1]}>\n<a:BRONZE:976939928363630633> WINNER 3  ${arrowright}   <@${userIds[2]}>`;
		  }
  
		  if (additionalWinners.length > 0) {
			let winnerEmoji = partydoggo;
			msgText += `\n...and our remaining winners:\n`;
			for (let i = 0; i < additionalWinners.length; i++) {
			  msgText += `${winnerEmoji} WINNER ${i+4}  ${arrowright}   <@${additionalWinners[i]}>\n`;
			  if (winnerEmoji == partydoggo) {
				winnerEmoji = danceboy;
			  } else {
				winnerEmoji = partydoggo;
			  }
			}
		  }
		}
  
		console.log('Processing winners...');
		return { embed: raffleEmbed, files: [attachments], text: msgText };
	  });
  
	  console.log('Returning processed data...');
	  return gifBuffer;
  
	} catch (error) {
	  console.error('Error processing raffle:', error.message);
	  return null;
	}
  }


////////////////////
// MODULE EXPORTS //
////////////////////

module.exports = {
	clearMaizeInputFile,
	optimizeMaizeInputFile,
	addToMaizeInputFile,
	getDataByFirstColumnValue,
	readGoogleSheet,
	toTitleCase,
	getPredominantColor
  };
  

///////////////////////////
// START OF MAIN CONTENT //
///////////////////////////

client.on("messageCreate", async message => {
var server;
var channel;

	try{
		server = message.guild.id,
		channel = message.channel.id;
	}catch(err){
		console.log('[server/channel error] ' + err);
		return;
	}

const msg = message.content.toLowerCase();

if(message.author.id == bitcorn || message.author.id == agentX3){

	if (msg.includes('!maizefile')){
		try {
			// Send the file as an attachment
			const attachment = { files: [maizeFile] };
			await message.reply({ content: 'Here is the Maize File:', ...attachment });
		} catch (error) {
			message.react('❌');
			console.error('Error sending file:', error.message);
		}
	}

	if (message.content.startsWith('!sql')) {
		const sqlQuery = message.content.replace('!sql ','');

		try {
			const result = await pgClient.query(sqlQuery);
			const data = result.rows;
			fs.writeFileSync('.\\createdfiles\\query.txt', JSON.stringify(data, null, 2));
			const attachment = new MessageAttachment('.\\createdfiles\\query.txt');
			
			// Reply to the command message with the text file attached
			await message.reply({content:`Data saved in attached query.txt`, files: [attachment]});

		} catch (error) {
			console.error('Error executing SQL query:', error.message);
			message.reply('Error executing SQL query.');
		}
	}
}


// CURRENT RAND-O-MATIC PROCESS  >> MOVE TO A FUNCTION
if (msg.includes('-random')){
	if(message.member.roles.cache.has('970723355097444482') || message.member.roles.cache.has('970758538681012315') || message.member.roles.cache.has('1031625756708720760')){

		const sentMessage = await message.channel.send('<a:LOADING:986706895492505621> ** LOADING RAND-O-MATIC 9001 ** <a:LOADING:986706895492505621>');

		console.log('INITIATING RAND-O-MATIC 9001...');
		var options = msg.replace('-random','').trim();
		var winners = 1;
		if(options.length > 0){
			try{
				winners = parseInt(options);
			} catch(err){
				console.log('[2]' + err);
			}
		}	
			  
		console.log('Number of winners to select: ' + winners);

		message.fetchReference().then(async repliedTo =>{			
			// Extract usernames from the message content
			const usernames = repliedTo.content.trim().split(' ');
			console.log('[input]');
			console.log(usernames);

			// Fetch avatars and create animation
			console.log('fetching users avatars...')
			const avatarUrls = await getAvatars(usernames);
	
			while (avatarUrls.length < 10){
				console.log('Adding Fake Avatar...')
				let randomFakeAvatar = fakeAvatars[Math.floor(Math.random() * fakeAvatars.length)];
				avatarUrls.push(randomFakeAvatar);
			}

			// Pick a random winner
			var playerselected = randomSelect(repliedTo.content.split(' '), winners);
			if (playerselected.length==0){throw 'zero-length string error';}
			console.log("[players selected]");
			console.log(playerselected);
			
			let userIds = playerselected.includes(' ')
			? playerselected.split(' ').map(player => player.replace(/[^a-zA-Z0-9]/g, ''))
			: [playerselected.replace(/[^a-zA-Z0-9]/g, '')];
			
			console.log("[userIds of winners]");
			console.log(userIds);

			//const sheetTab = 'ablephorth'; // Replace with your sheet/tab name
			//writeToGoogleSheet(userIds, sheetTab);

			let additionalWinners = [];

			if(winners>3){
				console.log('More than 3 winners, separating first 3...');
				additionalWinners = userIds.slice(3, userIds.length);
				userIds = userIds.slice(0,3);
				console.log(userIds);
				console.log("and our remaining winners:");
				console.log(additionalWinners)
			}

			// Create GIFs for winners
			const gifBuffer = await createGif(avatarUrls, userIds).then((gifBuffer) => {
				
				console.log('Editing initial message...');
				const titlestr = winners === 1 ? 'OUR WINNER!!!' : 'OUR WINNERS!!!';
				sentMessage.edit(`${partydoggo} ${danceboy} ** LET'S FIND ${titlestr} ** ${danceboy} ${partydoggo}`);

				console.log('Preparing attachment...');
				let attachments;
				attachments = new MessageAttachment(gifBuffer, gifFile);
	
				
				const descstr = winners === 1 ? 'a random winner has' : 'random winners have';			
				let msgtext;
				
				console.log('Creating embed...');
				
	
					const raffleEmbed = new MessageEmbed()
						.setTitle(`RAND-O-MATIC 9001`)
						.setDescription('*The following entries have been processed and ' + descstr + ' been selected...*')
						.setImage('attachment://random.gif')
						.setThumbnail(pglogospin)
						.addFields(
						{ name: 'INPUT PROCESSED', value: repliedTo.content + '\n '}
						);
	
					// Add images based on the number of winners
					if (winners === 1) {
						msgtext = `# *CORNGRATULATIONS ${playerselected}!!!*`;
					} else {
						if(winners === 2){
							msgtext = `***CORNGRATULATIONS TO:***\n<a:GOLD:976939928283922432> WINNER 1   ${arrowright}   <@${userIds[0]}>\n<a:SILVER:976939928904691822> WINNER 2  ${arrowright}   <@${userIds[1]}>`;
						}else{
							msgtext = `***CORNGRATULATIONS TO:***\n<a:GOLD:976939928283922432> WINNER 1   ${arrowright}   <@${userIds[0]}>\n<a:SILVER:976939928904691822> WINNER 2  ${arrowright}   <@${userIds[1]}>\n<a:BRONZE:976939928363630633> WINNER 3  ${arrowright}   <@${userIds[2]}>`;
						}
						
						if(additionalWinners.length > 0){
							let winnerEmoji = partydoggo;
							msgtext += `\n...and our remaining winners:\n`;
							for (let i = 0; i < additionalWinners.length; i++) {
								msgtext += `${winnerEmoji} WINNER ${i+4}  ${arrowright}   <@${additionalWinners[i]}>\n`;
								if(winnerEmoji == partydoggo){
									winnerEmoji = danceboy;
								}else{
									winnerEmoji = partydoggo;
								}
							}
						}
					}

					message.channel.send({ embeds: [raffleEmbed], files: [attachments] });
					setTimeout(() => {
						message.channel.send(msgtext);
					  }, 10000);
			
					  console.log('RAND-O-MATIC 9001 SHUTTING DOWN...');

			});


			}).catch(err =>{
			message.react('❌');
		});

	}else{
		message.react('❌');
		return;
	}
}

});
