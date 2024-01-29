import fs from "fs";
import { createCanvas, loadImage } from "canvas";
import GIFEncoder from "gif-encoder-2"; 
import nodefetch from "node-fetch";

import { EmbedBuilder, AttachmentBuilder } from "discord.js";

/////////////////
//  CONSTANTS  //
/////////////////

//RAND-O-MATC VARIABLES

const size = 128;
const topOffset = 30;
const leftOffset = 26;
const partydoggo = "<a:PARTYDOGGO:971972766150570074>";
const danceboy = "<a:danceboy:1098290306081894551>";
const arrowright = ":arrow_right:";
const pglogospin = "https://cdn.discordapp.com/emojis/986058074253066290.gif";
const urlStart = "https://cdn.discordapp.com/attachments/1089796271142875197/";
const urlEnd = "?size=128";
const pglogo = "https://cdn.discordapp.com/attachments/933487341824270356/1031769217235701781/PGlogo_whitebg.png";
const noAvatar = pglogo + urlEnd;
const fakeAvatars = [
    `1191942319738462238/JEFF.png`,
    `1191942319952379936/FFEJ_1.png`,
    `1191931955143508130/pickedMedia1.png`,
    `1191931955483258941/pickedMedia1.png`,
    `1191931956552794173/pickedMedia1.png`,
    `1191942319738462238/JEFF.png`,
    `1191942319952379936/FFEJ_1.png`,
    `1191931955797819412/pickedMedia1.png`,
    `1191931956041101413/pickedMedia1.png`,
    `1191931956292755607/pickedMedia1.png`,
    `1191942319738462238/JEFF.png`,
    `1191942319952379936/FFEJ_1.png`,
    `1191931957228077157/pickedMedia1.png`,
    `1191931956930289825/pickedMedia1.png`,
    `1191931957488136272/pickedMedia1.png`,
    `1191942319738462238/JEFF.png`,
    `1191942319952379936/FFEJ_1.png`,
];

/////////////
// GLOBALS //
/////////////

global.GIFbeingRecreated = false;

//////////////////
// RAND-O-MATIC //
//////////////////

async function getAvatars(userMentions) {
    const avatarUrls = [];
    for (const mention of userMentions) {
        const userId = mention.replace(/[^0-9]/g, ""); // Extract numerical user ID
        try {
            const user = await client.users.fetch(userId);
            console.log(`fetching avatar for: ${userId}`);
            avatarUrls.push(
                user.displayAvatarURL({
                    format: "png",
                    size: size,
                })
            );
        } catch (error) {
            console.error(`Error fetching avatar for ${mention}: ${error.message}`);
            console.log("Assigning default avatar...");
            avatarUrls.push(noAvatar);
        }
    }
    return avatarUrls;
}
async function createGif(avatarUrls, winnerUserIDs, gifFile) {
    console.log("Creating GIF...");
    const canvas = createCanvas(size * winnerUserIDs.length, size + topOffset);
    const ctx = canvas.getContext("2d");
    const encoder = new GIFEncoder(size * winnerUserIDs.length, size + topOffset);
    const gifBuffer = fs.createWriteStream(gifFile);
    let frameDelay;
    let avatars2;
    let avatars3;

    // Handle stream events
    const gifPromise = new Promise((resolve, reject) => {
        gifBuffer.on("finish", () => {
            console.log("GIF creation complete...");
            resolve(fs.readFileSync(gifFile));
        });
        gifBuffer.on("error", (err) => {
            console.error("Error writing GIF:", err);
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

    // PG-NOTES: Use an array
    for (let cycle = 1; cycle <= 8; cycle++) {
        const speedMultipliers = [2, 3, 3, 3, 4, 4, 3, 1];
        let speedMultiplier;
        speedMultiplier = speechSynthesis[cycle];
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
            //await new Promise(resolve => setTimeout(resolve, index * delayBetweenFetches));



        });
        const avatars = [];
        for (const avatarUrl of avatarUrls) {

            const response = await nodefetch(avatarUrl);
            // Check if response status is successful
            if (!response.ok) {
                console.error(`Failed to fetch avatar for ${avatarUrl}. Status: ${response.status}`);
                return null; // Return null for failed fetch
            }

            const buffer = await response.buffer();
            avatars.push(await loadImage(buffer));
        }

        if (cycle == 1) {
            if (winnerUserIDs.length > 1) {
                avatars2 = avatars.slice().sort(() => Math.random() - 0.5);
            }
            if (winnerUserIDs.length > 2) {
                avatars3 = avatars.slice().sort(() => Math.random() - 0.5);
            }
        }
        for (let i = 0; i < avatars.length; i++) {
            // PG-NOTES: - Unused var
            const response = await nodefetch(avatarUrls[i]);
            ctx.strokeStyle = "rgb(209, 71, 58)";
            ctx.lineWidth = 7;

            // Skip frames with failed image fetch
            if (avatars[i]) {
                ctx.globalAlpha = 0.8;
                if (cycle > 1) {
                    encoder.addFrame(ctx);
                }
                ctx.globalAlpha = 1.0;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(avatars[i], 0, topOffset, size, size);
                ctx.fillStyle = "white";
                ctx.font = "14px Verdana";
                if (winnerUserIDs.length == 1) {
                    ctx.fillText(`WINNER`, leftOffset + 6, 22);
                } else {
                    ctx.fillText(`WINNER 1`, leftOffset, 22);
                }
                if (winnerUserIDs.length > 1) {
                    ctx.drawImage(avatars2[i], size, topOffset, size, size);
                    ctx.fillText(`WINNER 2`, leftOffset + size, 22);
                }
                if (winnerUserIDs.length > 2) {
                    ctx.drawImage(avatars3[i], size * 2, topOffset, size, size);
                    ctx.fillText(`WINNER 3`, leftOffset + size * 2, 22);
                }
                if (winnerUserIDs.length > 1) {
                    ctx.strokeRect(size, 0, size, size + topOffset);
                }
                ctx.strokeRect(0, 0, canvas.width, canvas.height);
                frameDelay = 100 / speedMultiplier;
                encoder.setDelay(frameDelay); // Adjust speed
                encoder.addFrame(ctx);
            } else {
                console.log("skipped a broken frame");
            }
        }
        if (cycle === 8) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < winnerUserIDs.length; i++) {
                let winner;
                let winnerUserID = winnerUserIDs[i];
                console.log("winner user ID: " + winnerUserID);
                try {
                    winner = await getAvatars([winnerUserID]);
                    if (winner) {
                        console.log(`Found Avatar for Winner ${i + 1}: ${winner}`);
                    } else {
                        console.log(`Avatar NOT FOUND for Winner ${i + 1}: ${winner}`);
                        console.log(`Assigning default avatar...`);
                        winner = noAvatar;
                    }
                } catch (error) {
                    console.error(`Error fetching avatar for ${winnerUserIDs[i]}: ${error.message}`);
                    console.log("Assigning default avatar...");
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
                //await new Promise(resolve => setTimeout(resolve, delayBetweenFetches));

                await Promise.all([winnerAvatar]);
                ctx.drawImage(winnerAvatar, size * i, topOffset, size, size);
                ctx.fillStyle = "white";
                ctx.font = "14px Verdana";
                if (winnerUserIDs.length == 1) {
                    ctx.fillText(`WINNER`, leftOffset + 6, 22);
                } else {
                    ctx.fillText(`WINNER ${i + 1}`, leftOffset + size * i, 22);
                }
                console.log("get next winner...");
            }
            if (winnerUserIDs.length > 1) {
                ctx.strokeRect(size, 0, size, size + topOffset);
            }
            ctx.strokeRect(0, 0, canvas.width, canvas.height);
            frameDelay = 10000;
            encoder.setDelay(frameDelay);
            encoder.addFrame(ctx);
        }
    }
    await new Promise((resolve) => setTimeout(resolve, delayBetweenFetches));
    encoder.finish();
    gifBuffer.end();

    // Check if the created GIF is corrupt and attempt to recreate it
    if (await isGifCorrupt(gifFile)) {
        if (!GIFbeingRecreated) {
            console.log("GIF is corrupt. Attempting to recreate...");
            GIFbeingRecreated = true;
            await recreateGif(avatarUrls, winnerUserIDs, gifFile);
        }

        // Check if the recreated GIF is still corrupt
        if (await isGifCorrupt(gifFile)) {
            throw new Error("Failed to create a valid GIF.");
        }
    } else {
        console.log("GIF found to be valid...");
        return gifPromise;
    }
}
async function isGifCorrupt(gifPath) {
    console.log("Checking if GIF is corrupt...");
    try {
        // Check if the file exists
        fs.accessSync(gifPath, fs.constants.R_OK);

        // Read the last byte of the file
        const fileSize = fs.statSync(gifPath).size;
        let buffer = Buffer.alloc(1);
        const fileDescriptor = fs.openSync(gifPath, "r+"); // Open the file in read/write mode
        fs.readSync(fileDescriptor, buffer, 0, 1, fileSize - 1);

        // Check if the last byte is the GIF trailer
        const lastByte = buffer[0];
        const isGifTrailer = lastByte === 0x3b;
        if (!isGifTrailer) {
            console.error("GIF does not end with the GIF trailer. Adding trailer...");

            // Append the GIF trailer
            const trailerBuffer = Buffer.from([0x3b]);
            fs.writeSync(fileDescriptor, trailerBuffer, 0, 1, fileSize - 1);
            console.log("GIF trailer added.");
        }
        fs.closeSync(fileDescriptor);
        buffer = fs.readFileSync(gifPath);

        // Check GIF version
        const gifVersion = buffer.toString("ascii", 3, 6);
        if (gifVersion !== "87a" && gifVersion !== "89a") {
            console.error("Unsupported GIF version");
            return true;
        }
        return false; // File is not corrupt
    } catch (err) {
        console.error("GIF is corrupt or doesn't exist.", err);
        return true; // File is corrupt or doesn't exist
    }
}

// Function to recreate a GIF if it is corrupt
async function recreateGif(avatarUrls, winnerUserIDs, outputPath) {
    const recreatedGifBuffer = await createGif(avatarUrls, winnerUserIDs, gifFile);
    await fs.writeFile(outputPath, recreatedGifBuffer);
}

//[IN PROGRESS] MOVING RAND-O-MATIC TO A FUNCTION
async function processRaffle(winners, usersArray) {
    const gifFile = "./files/graphics/random.gif";
    try {
        console.log("Number of winners to select: " + winners);

        // Fetch avatars and create animation
        console.log("fetching users avatars...");
        const avatarUrls = await getAvatars(usersArray);
        while (avatarUrls.length < 10) {
            console.log("Adding Fake Avatar...");
            let randomFakeAvatar = urlStart + fakeAvatars[Math.floor(Math.random() * fakeAvatars.length)] + urlEnd;
            avatarUrls.push(randomFakeAvatar);
        }
        console.log(usersArray);
        // Pick random winners
        const playerSelected = randomSelect(usersArray, winners);
        if (playerSelected.length === 0) {
            throw "zero-length string error";
        }
        console.log("[players selected]");
        console.log(playerSelected);
        let userIds = playerSelected.includes(" ")
            ? playerSelected.split(" ").map((player) => player.replace(/[^a-zA-Z0-9]/g, ""))
            : [playerSelected.replace(/[^a-zA-Z0-9]/g, "")];
        console.log("[userIds of winners]");
        console.log(userIds);
        let additionalWinners = [];
        if (winners > 3) {
            console.log("More than 3 winners, separating first 3...");
            additionalWinners = userIds.slice(3, userIds.length);
            userIds = userIds.slice(0, 3);
            console.log(userIds);
            console.log("and our remaining winners:");
            console.log(additionalWinners);
        }

        // Create GIFs for winners
        const gifBuffer = await createGif(avatarUrls, userIds, gifFile).then((gifBuffer) => {
            console.log("Preparing attachment...");
            let attachments = new AttachmentBuilder(gifBuffer, gifFile);
            const descStr = winners === 1 ? "a random winner has" : "random winners have";
            let msgText;
            console.log("Creating embed...");
            const raffleEmbed = new EmbedBuilder()
                .setTitle(`RAND-O-MATIC 9001`)
                .setDescription(`*The following entries have been processed and ${descStr} been selected...*`)
                .setImage("attachment://random.gif")
                .setThumbnail(pglogospin)
                .addFields({
                    name: "INPUT PROCESSED",
                    value: usersArray.join(" ") + "\n ",
                });

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
                        msgText += `${winnerEmoji} WINNER ${i + 4}  ${arrowright}   <@${additionalWinners[i]}>\n`;
                        if (winnerEmoji == partydoggo) {
                            winnerEmoji = danceboy;
                        } else {
                            winnerEmoji = partydoggo;
                        }
                    }
                }
            }
            console.log("Processing winners...");
            return {
                embed: raffleEmbed,
                files: [attachments],
                text: msgText,
            };
        });
        console.log("Returning processed data...");
        return gifBuffer;
    } catch (error) {
        console.error("Error processing raffle:", error.message);
        return null;
    }
}


////////////////////////////////////////

   // CURRENT RAND-O-MATIC PROCESS  >> MOVE TO A FUNCTION
   if (msg.includes("-random")) {
    if (message.member.roles.cache.has("970758538681012315")) {
        if (message.type !== "REPLY") {
            await message.channel.send("Reply to the list of users you wish to process.");
            return;
        }
        const sentMessage = await message.channel.send(
            "<a:LOADING:986706895492505621> ** LOADING RAND-O-MATIC 9001 ** <a:LOADING:986706895492505621>"
        );
        console.log("INITIATING RAND-O-MATIC 9001...");
        var options = msg.replace("-random", "").trim();
        var winners = 1;
        if (options.length > 0) {
            try {
                winners = parseInt(options);
            } catch (err) {
                console.log("[2]" + err);
            }
        }
        console.log("Number of winners to select: " + winners);

        // PG-NOTES: - Improper async chaining/await usage
        message
            .fetchReference()
            .then(async (repliedTo) => {
                // const repliedTo = await message.fetchReference()

                // Extract usernames from the message content
                const usernames = repliedTo.content.trim().split(" ");
                console.log("[input]");
                console.log(usernames);

                // Fetch avatars and create animation
                console.log("fetching users avatars...");
                const avatarUrls = await getAvatars(usernames);
                while (avatarUrls.length < 10) {
                    console.log("Adding Fake Avatar...");
                    let randomFakeAvatar =
                        urlStart +
                        fakeAvatars[Math.floor(Math.random() * fakeAvatars.length)] +
                        urlEnd;
                    avatarUrls.push(randomFakeAvatar);
                }

                // Pick a random winner
                var playerselected = randomSelect(repliedTo.content.split(" "), winners);
                if (playerselected.length == 0) {
                    throw "zero-length string error";
                }
                console.log("[players selected]");
                console.log(playerselected);
                let userIds = playerselected.includes(" ")
                    ? playerselected
                          .split(" ")
                          .map((player) => player.replace(/[^a-zA-Z0-9]/g, ""))
                    : [playerselected.replace(/[^a-zA-Z0-9]/g, "")];
                console.log("[userIds of winners]");
                console.log(userIds);

                //const sheetTab = 'ablephorth'; // Replace with your sheet/tab name
                //writeToGoogleSheet(userIds, sheetTab);

                let additionalWinners = [];
                if (winners > 3) {
                    console.log("More than 3 winners, separating first 3...");
                    additionalWinners = userIds.slice(3, userIds.length);
                    userIds = userIds.slice(0, 3);
                    console.log(userIds);
                    console.log("and our remaining winners:");
                    console.log(additionalWinners);
                }

                // Create GIFs for winners
                const gifBuffer = await createGif(avatarUrls, userIds).then((gifBuffer) => {
                    console.log("Editing initial message...");
                    const titlestr = winners === 1 ? "OUR WINNER!!!" : "OUR WINNERS!!!";
                    sentMessage.edit(
                        `${partydoggo} ${danceboy} ** LET'S FIND ${titlestr} ** ${danceboy} ${partydoggo}`
                    );
                    console.log("Preparing attachment...");
                    let attachments;
                    attachments = new AttachmentBuilder(gifBuffer, gifFile);
                    const descstr =
                        winners === 1 ? "a random winner has" : "random winners have";
                    let msgtext;
                    console.log("Creating embed...");
                    const raffleEmbed = new EmbedBuilder()
                        .setTitle(`RAND-O-MATIC 9001`)
                        .setDescription(
                            "*The following entries have been processed and " +
                                descstr +
                                " been selected...*"
                        )
                        .setImage("attachment://random.gif")
                        .setThumbnail(pglogospin)
                        .addFields({
                            name: "INPUT PROCESSED",
                            value: repliedTo.content + "\n ",
                        });

                    // Add images based on the number of winners
                    if (winners === 1) {
                        msgtext = `# *CORNGRATULATIONS ${playerselected}!!!*`;
                    } else {
                        if (winners === 2) {
                            msgtext = `***CORNGRATULATIONS TO:***\n<a:GOLD:976939928283922432> WINNER 1   ${arrowright}   <@${userIds[0]}>\n<a:SILVER:976939928904691822> WINNER 2  ${arrowright}   <@${userIds[1]}>`;
                        } else {
                            msgtext = `***CORNGRATULATIONS TO:***\n<a:GOLD:976939928283922432> WINNER 1   ${arrowright}   <@${userIds[0]}>\n<a:SILVER:976939928904691822> WINNER 2  ${arrowright}   <@${userIds[1]}>\n<a:BRONZE:976939928363630633> WINNER 3  ${arrowright}   <@${userIds[2]}>`;
                        }
                        if (additionalWinners.length > 0) {
                            let winnerEmoji = partydoggo;
                            msgtext += `\n...and our remaining winners:\n`;
                            for (let i = 0; i < additionalWinners.length; i++) {
                                msgtext += `${winnerEmoji} WINNER ${i + 4}  ${arrowright}   <@${
                                    additionalWinners[i]
                                }>\n`;
                                if (winnerEmoji == partydoggo) {
                                    winnerEmoji = danceboy;
                                } else {
                                    winnerEmoji = partydoggo;
                                }
                            }
                        }
                    }
                    message.channel.send({
                        embeds: [raffleEmbed],
                        files: [attachments],
                    });
                    setTimeout(() => {
                        message.channel.send(msgtext);
                    }, 10000);
                    console.log("RAND-O-MATIC 9001 SHUTTING DOWN...");
                });
            })
            .catch((err) => {
                message.react("❌");
            });
    } else {
        message.react("❌");
        return;
    }
}