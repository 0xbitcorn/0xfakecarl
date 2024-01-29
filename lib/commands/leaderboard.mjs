import { AttachmentBuilder, SlashCommandBuilder } from "discord.js";
import { createCanvas, loadImage, registerFont } from "canvas";
import { readGoogleSheet } from "../googleSheets.mjs";
import sizeOf from "image-size";
import LeaderboardSettings from "../var/LeaderboardSettings.mjs";

export default {
    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Generate and display the PUZZL3R PA5S leaderboard."),
    execute: async (interaction) => {
        try {
            await interaction.deferReply();
            const rows = await readGoogleSheet(2, LeaderboardSettings.puzzlerPassDataCols, process.env.PUZZLERPASSSHEET); //Sheet1 = 1

            const sortedRows = rows.sort((a, b) => b["Current EXP"] - a["Current EXP"]);
            let dataRows = 0;
            //use .filter
            sortedRows.forEach((column, index) => {
                if (index == 0 || !column[0]) {
                    return;
                }
                dataRows++;
            });
            console.log("# OF PUZZL3R PA5S PLAYERS IDENTIFIED: " + dataRows);

            // Find user's rank and highlight their row
            // >> For use when discord ID added to spreadsheet
            const userRow = sortedRows.find((row) => row["Discord Name"] === interaction.user.username);
            const userRank = sortedRows.indexOf(userRow) + 1;

            // >>>  break image creation out into a new function
            //Table Properties
            registerFont(LeaderboardSettings.headerFont, { family: "HeaderFont" });
            registerFont(LeaderboardSettings.tableFont, { family: "TableFont" });
            const headerImg = await loadImage(LeaderboardSettings.headerImgPath);
            const headerImgDims = sizeOf(LeaderboardSettings.headerImgPath);
            let textWidth;

            //Image Properties
            const imgWidth =
                2 * LeaderboardSettings.edgeMargin + LeaderboardSettings.colWidth.reduce((acc, curr) => acc + curr, 0);
            const imgHeight =
                headerImgDims.height +
                LeaderboardSettings.headerHeight +
                dataRows * LeaderboardSettings.rowHeight +
                LeaderboardSettings.edgeMargin;
            console.log("Creating PUZZL3R PA5S Leaderboard [" + imgWidth + "W x " + imgHeight + "H]");
            const canvas = createCanvas(imgWidth, imgHeight);
            const ctx = canvas.getContext("2d");

            //Draw Background
            ctx.fillStyle = LeaderboardSettings.borderColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = LeaderboardSettings.defaultColor;
            ctx.fillRect(
                LeaderboardSettings.edgeMargin,
                0,
                canvas.width - 2 * LeaderboardSettings.edgeMargin,
                canvas.height - LeaderboardSettings.edgeMargin
            );

            //Draw Header Graphic
            ctx.drawImage(headerImg, 0, 0, headerImgDims.width, headerImgDims.height);

            //Draw Header Row
            ctx.fillStyle = LeaderboardSettings.titleRow;
            ctx.fillRect(0, headerImgDims.height, canvas.width, LeaderboardSettings.headerHeight);
            ctx.fillStyle = LeaderboardSettings.titleRowFont;
            ctx.font = LeaderboardSettings.titleFontSize;
            LeaderboardSettings.headers.forEach((header, index) => {
                if (LeaderboardSettings.centered[index]) {
                    textWidth = (LeaderboardSettings.colWidth[index] - ctx.measureText(header).width) / 2;
                } else {
                    textWidth = 0;
                }

                ctx.fillText(
                    header,
                    LeaderboardSettings.edgeMargin +
                        textWidth +
                        LeaderboardSettings.colWidth.slice(0, index).reduce((acc, curr) => acc + curr, 0),
                    headerImgDims.height + (LeaderboardSettings.headerHeight - LeaderboardSettings.titleFontSizeInt)
                );
            });

            // Draw Data Rows
            sortedRows.forEach((column, rank) => {
                if (rank == 0 || !column[0]) {
                    return;
                }
                let yPos = headerImgDims.height + LeaderboardSettings.headerHeight + rank * LeaderboardSettings.rowHeight;
                ctx.fillStyle = LeaderboardSettings.evenRowFont;
                ctx.font = LeaderboardSettings.evenRowFontSize;
                if (rank % 2 !== 0) {
                    ctx.fillStyle = LeaderboardSettings.evenRow;
                    ctx.fillRect(
                        LeaderboardSettings.edgeMargin,
                        yPos,
                        canvas.width - 2 * LeaderboardSettings.edgeMargin,
                        LeaderboardSettings.rowHeight
                    );
                    ctx.fillStyle = LeaderboardSettings.defaultFont;
                    ctx.font = LeaderboardSettings.defaultFontSize;
                }
                yPos += 2;
                /*
              if(userRank === index){
                ctx.fillStyle = highlightedRowColor;
                ctx.fillRect(0, yPos, canvas.width, yPos+rowHeight);
                }
                */

                let xPos = LeaderboardSettings.edgeMargin;
                const [avatar, notUsed, username, exp, tier, toNextTier, nextReward, avatarCount, expMultiplier] =
                    column;
                const tableData = [
                    username,
                    avatar,
                    exp,
                    tier,
                    toNextTier,
                    nextReward.replace(/:/g, ""),
                    avatarCount,
                    expMultiplier,
                ];

                ctx.fillText(
                    rank,
                    xPos - ctx.measureText(rank).width / 2 + LeaderboardSettings.colWidth[0] / 2, //Centered
                    yPos - LeaderboardSettings.defaultFontSizeInt
                );
                xPos += LeaderboardSettings.colWidth[0];

                tableData.forEach((element, index) => {
                    if (LeaderboardSettings.centered[index + 1]) {
                        ctx.fillText(
                            element,
                            xPos - ctx.measureText(element).width / 2 + LeaderboardSettings.colWidth[index + 1] / 2,
                            yPos - LeaderboardSettings.defaultFontSizeInt
                        );
                    } else {
                        ctx.fillText(element, xPos, yPos - LeaderboardSettings.defaultFontSizeInt);
                    }
                    xPos += LeaderboardSettings.colWidth[index + 1];
                });
            });

            ctx.fillStyle = LeaderboardSettings.borderColor;
            ctx.fillRect(0, canvas.height - LeaderboardSettings.edgeMargin, canvas.width, LeaderboardSettings.edgeMargin);

            let buffer = canvas.toBuffer(); //move everything to make the image into another file then resolve it here.
            const attachment = new AttachmentBuilder(buffer, `${LeaderboardSettings.graphicsFldr}/leaderboard.png`);
            buffer = null;
            
            await interaction.editReply({
                content: " ",
                files: [attachment],
            });
        } catch (error) {
            console.log("Error handling leaderboard command:", error);
            await interaction.reply({
                content: "An error occurred while processing the command.",
                ephemeral: true,
            });
        }
    },
};
