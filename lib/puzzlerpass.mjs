import fs from "fs";
import { sendMessageToChannel } from "./discordUtils.mjs";
const xpTracker = "./files/trackers/xptracker.txt"; //Tracker file for recording puzzle_id+wallet sent to input.txt
const xpTag = "\x1b[32m[PUZZL3RPA5S]\x1b[0m ";

export async function addXPToPuzzler(puzzleName, userData, SolveGroup, xp) {
    console.log(`AWARDING ${xp} EXP TO ${SolveGroup} SOLVERS: ${userData.join(", ")}`);
    let nothingAdded = "`" + `${puzzleName} - ${SolveGroup}` + "`" + ` **[${xp} XP]** `;
    let addedToXP = nothingAdded;
    console.log(`>>> [${xp} XP] `);
    try {
        for (const user of userData) {
            if (!searchXPTracker(`${puzzleName}:${user}`) && user) {
                fs.appendFileSync(xpTracker, `${puzzleName}:${user}, `);
                addedToXP += `${user} `;
            }
        }
        if (addedToXP !== nothingAdded) {
            await sendMessageToChannel(addedToXP, process.env.XPLOGCHAN);
            console.log(`${xpTag}\x1b[32mData appended to ${xpTracker}\x1b[0m`);
        }
    } catch (error) {
        console.error("\x1b[31m[PUZZL3RPA5S] Error appending data: \x1b[0m", error.message);
    }
}

function searchXPTracker(searchValue) {
    try {
        const fileContent = fs.readFileSync(xpTracker, "utf-8");
        return fileContent.includes(searchValue);
    } catch (error) {
        console.error("\x1b[33m[PUZZL3RPA5S] WARNING: File not found or reading error. [PROCEEDING AS NOT FOUND]: \x1b[0m","\n", "\x1b[33m >> "+error.message+"\x1b[0m");
        return false;
    }
}
