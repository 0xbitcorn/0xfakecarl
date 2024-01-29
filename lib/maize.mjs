import fs from "fs";
import {sendMessageToChannel} from './discordUtils.mjs'
// PG-NOTES: - hardcoded path dependent on OS
const maizeFile = "../maize/input/input_test.txt"; //MAIZE input.txt file
const maizeTracker = "./files/trackers/tracker.txt"; //Tracker file for recording puzzle_id+wallet sent to input.txt (change to puzzle_id+PGUserID)
const maizeTag = "\x1b[32m[MAIZE]\x1b[0m ";

//NFT MAP
const nftMapping = {
    PAKOIN: "0x0b955791fd8f2cb860dd2578b48b2ae259a9d252f28cc2e595bf3954e1cc718f",
    CORNMOJI: "0x1c939a4c71138a0650c6641f631baf700a212935f7a21dea0c0d1a432af563ec",
    KORNMOGEE: "0x1a157e10b688afcb903e1174ed3a33a5ada8b077abf2f99b544f2bb6e144694e",
};

function getMaizeInputFile() {
    return maizeFile;
}

//function reviewMaizeInputFile() {} this may not be needed as a separate function

async function addToMaizeInputFile(puzzle_id, walletuserData, NFTname, QTY = 1, puzzleName = "") {
    const NFTid = nftMapping[NFTname] || "UNKNOWN";
    let alreadyProcessed = " ";
    let nothingAdded = `**${puzzleName}** \n`;
    let addedToMaize = nothingAdded;
    if (puzzleName == "") {
        puzzleName = puzzle_id;
    }
    if (NFTid == "UNKNOWN") {
        throw new Error(maizeTag + "UNKNOWN NFT, NEED MAIZE nftData string.");
    }
    try {
        const walletUserDataArray = Array.isArray(walletuserData) ? walletuserData : [];

        walletUserDataArray.forEach(({user, wallet, discord }) => {
            if (!searchMaizeTracker(`${puzzle_id}:${user}`)) {
                fs.appendFileSync(maizeFile, `${NFTid},${QTY},${wallet},PG LOVES YOU!\n`);
                fs.appendFileSync(maizeTracker, `${puzzle_id}:${user}, `);
                addedToMaize += `- *${QTY}* ${NFTname} ${discord} *${wallet}*\n`;
            } else {
                alreadyProcessed += `${puzzle_id}:${discord},`;
            }
        });
        if (addedToMaize !== nothingAdded) {
            await sendMessageToChannel(addedToMaize, process.env.MAIZELOGCHAN);
            console.log(maizeTag + `\x1b[32mData appended to ${maizeFile}\x1b[0m`);
        }
        if (alreadyProcessed !== " ") {
            console.log(`\x1b[33m[MAIZE] WARNING: Previously processed data identified for: ${puzzle_id}\x1b[0m`);
            return alreadyProcessed.slice(0, -1).trim();
        }
    } catch (error) {
        console.error("\x1b[31m[MAIZE] Error appending data:\x1b[0m", error.message);
    }
}

function searchMaizeTracker(searchValue) {
    try {
        const fileContent = fs.readFileSync(maizeTracker, "utf-8");
        return fileContent.includes(searchValue);
    } catch (error) {
        console.error("\x1b[33m[MAIZE] WARNING: File not found or reading error. [PROCEEDING AS NOT FOUND]: \x1b[0m","\n", "\x1b[33m >> "+error.message+"\x1b[0m");
        return false;
    }
}

async function clearMaizeInputFile() {
    try {
        fs.writeFileSync(maizeFile, "");
        console.log(maizeTag + `\x1b[32mContent cleared from ${maizeFile}\x1b[0m`);
    } catch (error) {
        console.error("\x1b[31m[MAIZE] Error clearing file:\x1b[0m", error.message);
    }
    return true;
}

function optimizeMaizeInputFile() {
    try {
        const fileContent = fs.readFileSync(maizeFile, "utf-8");
        const lines = fileContent.split("\n");
        const combinedQuantities = new Map();
        lines.forEach((line) => {
            if (line.trim() !== "") {
                const [nftID, nftQTY, userWallet, message] = line.split(",");

                // Generate a unique key for each line based on nftID and userWallet
                const key = `${nftID}-${userWallet}`;
                if (combinedQuantities.has(key)) {
                    // If the key exists, update the quantity by adding the new nftQTY
                    combinedQuantities.set(key, combinedQuantities.get(key) + parseInt(nftQTY));
                } else {
                    // If the key doesn't exist, add it to the map with the current nftQTY
                    combinedQuantities.set(key, parseInt(nftQTY));
                }
            }
        });

        const updatedLines = Array.from(combinedQuantities, ([key, quantity]) => {
            const [nftID, userWallet] = key.split("-");
            return `${nftID},${quantity},${userWallet},PG LOVES YOU!`;
        });
        updatedLines.push(``);
        fs.writeFileSync(maizeFile, updatedLines.join("\n"), "utf-8");
        console.log(maizeTag + "\x1b[32mInput file optimized.\x1b[0m");
    } catch (error) {
        console.error("\x1b[31m[MAIZE] Error processing the input file:\x1b[0m", error.message);
    }
}

async function processDistribution() {
    console.log(maizeTag + "[THIS IS WHERE IT WOULD PROCESS, IF WE HAD THAT FUNCTION]");
}

export {
    getMaizeInputFile,
    clearMaizeInputFile,
    optimizeMaizeInputFile,
    addToMaizeInputFile,
    processDistribution,
};
