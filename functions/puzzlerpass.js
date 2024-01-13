////////////////////////////
// PUZZLER PASS FUNCTIONS //
////////////////////////////

const fs = require('fs');									//for system file access 
const {sendMessageToChannel} = require('../bot.js');        //to allow sending message to channel
const {readGoogleSheet, getDataByFirstColumnValue, googleWalletLookup} = require('./googleSheets.js');
const guildId ='962059766388101301';
const xpLogChannel = '1195223977602318367';
const xpTracker = './createdfiles/xptracker.txt';          //Tracker file for recording puzzle_id+wallet sent to input.txt
let xp;

//NFT MAP
const xpMapping = {
	'24HR': 'XP_24',
	'48HR': 'XP_48',
	'OTHER': 'XP_OTHER',
};

async function addXPToPuzzler(puzzleName, userData, SolveGroup) {
    console.log("puzzle name: " + puzzleName);
    console.log("users in solve group: " + SolveGroup);
    console.log(userData);
    const xpRange = xpMapping[SolveGroup] || 'UNKNOWN';
    let alreadyProcessed = ' ';
    

//Collect prizes for specified puzzle
    try {
        console.log(`Collecting XP Amount for ${SolveGroup}...`);
        xp = await readGoogleSheet(`DEFAULTS`, [xpRange]);
    } catch (error) {
        console.error(error.message);
    }
    
    
    let nothingAdded = '`'+`${puzzleName} - ${SolveGroup}` + '`' +` **[${xp} XP]** `;
    let addedToXP = nothingAdded;
    console.log(addedToXP);

	if (xpRange == 'UNKNOWN' || puzzleName == ''){
		throw new Error('UNKNOWN VALUE.');
	}

    try {
        
        for (const user of userData){
			if(!searchXPTracker(`${puzzleName}:${user}`) && user !== undefined && user !== '' & user !== null){
				fs.appendFileSync(xpTracker, `${puzzleName}:${user}, `);
                addedToXP += `${user} `;
			}
		}

        if(addedToXP !== nothingAdded){
            await sendMessageToChannel(addedToXP,xpLogChannel);
            console.log(`Data appended to ${xpTracker}`);
        }
    } catch (error) {
        console.error('Error appending data:', error.message);
    }
}

function searchXPTracker(searchValue) {
    try {
        const fileContent = fs.readFileSync(xpTracker, 'utf-8');
        return fileContent.includes(searchValue);
    } catch (error) {
        console.error('Error reading the file:', error.message);
        return false;
    }
}



module.exports = {
    addXPToPuzzler   
}