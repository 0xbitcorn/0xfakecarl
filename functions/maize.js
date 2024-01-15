/////////////////////
// MAIZE FUNCTIONS //
/////////////////////

const fs = require('fs');									//for system file access 
const {sendMessageToChannel} = require('../bot.js');        //to allow sending message to channel

const maizeFile ='C:\\dev\\maize\\Input\\Input.txt';        //MAIZE input.txt file
const maizeTracker = './createdfiles/tracker.txt';          //Tracker file for recording puzzle_id+wallet sent to input.txt

const guildId ='962059766388101301';
const maizeLogChannel = '1194678450976469082';
const maizeTag ="\x1b[32m[MAIZE]\x1b[0m ";

//NFT MAP
const nftMapping = {
	'PAKOIN': '0x0b955791fd8f2cb860dd2578b48b2ae259a9d252f28cc2e595bf3954e1cc718f',
	'CORNMOJI': '0x1c939a4c71138a0650c6641f631baf700a212935f7a21dea0c0d1a432af563ec',
	'KORNMOGEE': '0x1a157e10b688afcb903e1174ed3a33a5ada8b077abf2f99b544f2bb6e144694e',
};

function getMaizeInputFile(){
    return maizeFile;
}

function reviewMaizeInputFile(){
    
}

async function addToMaizeInputFile(puzzle_id, walletuserData, NFTname, QTY=1, puzzleName='') {

	// Look up the NFT id based on the NFT string
	const NFTid = nftMapping[NFTname] || 'UNKNOWN';
	let alreadyProcessed = ' ';
    let nothingAdded = `**${puzzleName}** \n`
    let addedToMaize = nothingAdded;

    if(puzzleName == ''){
        puzzleName = puzzle_id;
    }

	if (NFTid == 'UNKNOWN'){
		throw new Error(maizeTag + 'UNKNOWN NFT, NEED MAIZE nftData string.');
	}

    try {
        const walletUserDataArray = Array.isArray(walletuserData) ? walletuserData : [];
        
        // Write content to the text file
        walletUserDataArray.forEach(({wallet, discord}) => {
			if(!searchMaizeTracker(`${puzzle_id}:${wallet}`)){
				fs.appendFileSync(maizeFile, `${NFTid},${QTY},${wallet},PG LOVES YOU!\n`);  // Adding a newline before appending new content
				fs.appendFileSync(maizeTracker, `${puzzle_id}:${wallet}, `);  // Adding a newline before appending new content
                addedToMaize += `- *${QTY}* ${NFTname} ${discord} *${wallet}*\n`;
			}else{
				alreadyProcessed += `${puzzle_id}:${wallet},`
			}
		});

        if(addedToMaize !== nothingAdded){
            await sendMessageToChannel(addedToMaize,maizeLogChannel);
            console.log(maizeTag + `\x1b[32mData appended to ${maizeFile}\x1b[0m`);
        }
		if(alreadyProcessed !== ' '){
			console.log(`\x1b[33m[MAIZE] WARNING: Previously processed data identified for: ${puzzle_id}\x1b[0m`);
			return alreadyProcessed.slice(0,-1).trim();
		}
    } catch (error) {
        console.error('\x1b[31m[MAIZE] Error appending data:\x1b[0m', error.message);
    }
}

function searchMaizeTracker(searchValue) {
    try {
        const fileContent = fs.readFileSync(maizeTracker, 'utf-8');
        return fileContent.includes(searchValue);
    } catch (error) {
        console.error('\x1b[31m[MAIZE] Error reading the file:\x1b[0m', error.message);
        return false;
    }
}


async function clearMaizeInputFile() {
    try {
        fs.writeFileSync(maizeFile, '');
        console.log(maizeTag + `\x1b[32mContent cleared from ${maizeFile}\x1b[0m`);
    } catch (error) {
        console.error('\x1b[31m[MAIZE] Error clearing file:\x1b[0m', error.message);
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

	console.log(maizeTag + '\x1b[32mInput file optimized.\x1b[0m');

	} catch (error) {
		console.error('\x1b[31m[MAIZE] Error processing the input file:\x1b[0m', error.message);
	}
}

async function processDistribution(){
    console.log(maizeTag + '[THIS IS WHERE IT WOULD PROCESS, IF WE HAD THAT FUNCTION]');
}

module.exports = {
    getMaizeInputFile,
	clearMaizeInputFile,
	optimizeMaizeInputFile,
	addToMaizeInputFile,
    processDistribution
}