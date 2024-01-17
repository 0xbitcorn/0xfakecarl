// leaderboard.js
/////////////////////////////
// PUZZLERPASS LEADERBOARD //
/////////////////////////////

const {AttachmentBuilder} = require('discord.js');
const fs = require('fs');									                //for system file access 
const { createCanvas, loadImage, registerFont} = require('canvas');                      //for creating image
const {getSheetNames, readGoogleSheet, getDataByFirstColumnValue, googleWalletLookup} = require('../functions/googleSheets.js');   //for google access
const sizeOf = require('image-size');
const { sort } = require('semver');
const { family } = require('detect-libc');
require('dotenv').config();

//GOOGLE SHEET ID
const spreadsheetId = process.env.PUZZLERPASSSHEET;
const dataRange = "C:K";
const leaderboardImg = './createdfiles/leaderboard.png'

module.exports = {
    data: {
      name: 'leaderboard',
      description: 'Generate and display the PUZZL3R PA5S leaderboard.',
    },
    execute: async (interaction) => {
        try {
            await interaction.deferReply();
            const rows = await readGoogleSheet(2, dataRange, spreadsheetId); //Sheet1 = 1
        
            // Sort rows by Current EXP in descending order
            const sortedRows = rows.sort((a, b) => b['Current EXP'] - a['Current EXP']);
            let dataRows =0;
            
            sortedRows.forEach((column, index) => {
                if(index == 0 || column[0] == undefined || column[0] == ''){
                    return;
                }
                dataRows++;
            });
            console.log("# OF PUZZL3R PA5S PLAYERS IDENTIFIED: " + dataRows);
        
            // Find user's rank and highlight their row
            const userRow = sortedRows.find((row) => row['Discord Name'] === interaction.user.username);
            const userRank = sortedRows.indexOf(userRow) + 1;


            //Table Properties
            registerFont(`./createdFiles/PixelNES.otf`, {family: 'HeaderFont'});
            registerFont(`./createdFiles/8bitOperatorPlus8-Bold.ttf`, {family: 'TableFont'});

            const headerImgPath = "./createdFiles/puzzlerpassHeader.png";
            const headerImg = await loadImage(headerImgPath);
            const headerImgDims = sizeOf(headerImgPath);
            const headers = ['Rank', 'Username', 'Avatar', 'EXP', 'Tier', 'To Next Tier', 'Next Reward', 'Avatars', 'EXP Multiplier'];
            const colWidth = [90, 300, 300, 100, 100, 175, 400, 75, 175];

            const borderColor = `#000000`;                                          //border color
            const titleRow = `#000000`;                                             //header row color
            const headerHeight = 50;                                                //header height
            const edgeMargin = headerHeight*.5;

            const titleRowFont = `#FFFFFF`;                                         //header font color
            const titleFontSizeInt = 14;                                            //header font size
            const titleFontSize = "bold " + titleFontSizeInt +"px HeaderFont";      //header font
            
            const defaultFontSizeInt = 20;                                          //default font size
            const defaultFontSize = defaultFontSizeInt +"px TableFont";             //default font
            const defaultFont = `#fcfcfc`;                                          //default font color
            const evenRowFontSize = "bold " + defaultFontSizeInt +"px TableFont";   //alternating row font
            const evenRowFont = `#fcfcfc`;                                          //alternating font color

            const rowHeight = defaultFontSizeInt*2.5;                               //row height
            const defaultColor = '#b03c31';                                         //default row color
            const evenRow = '#d1473a';                                              //alternating row color
            const highlightedRowColor = '#FFFF00';                                  //for highlighting user (if found)

            let textWidth;

            //Image Properties
            const imgWidth = 2*edgeMargin + colWidth.reduce((acc,curr) => acc + curr,0);
            const imgHeight = headerImgDims.height + headerHeight + dataRows*rowHeight + edgeMargin;

            console.log("Creating PUZZL3R PA5S Leaderboard [" + imgWidth + "W x " + imgHeight + "H]");

            const canvas = createCanvas(imgWidth, imgHeight);
            const ctx = canvas.getContext('2d');
        
            //Draw Background
            ctx.fillStyle = borderColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = defaultColor;
            ctx.fillRect(edgeMargin, 0, canvas.width - 2*edgeMargin, canvas.height - edgeMargin);
            
            //Draw Header Graphic
            ctx.drawImage(headerImg, 0, 0, headerImgDims.width, headerImgDims.height);

            //Draw Header Row
            ctx.fillStyle = titleRow;
            ctx.fillRect(0, headerImgDims.height, canvas.width, headerHeight);
            ctx.fillStyle = titleRowFont;
            ctx.font = titleFontSize;
            headers.forEach((header, index) => {

                switch(index){
                    case 0:
                    case 3:
                    case 4:
                    case 5:
                    case 7:
                    case 8:      //Centered headers
                        textWidth = (colWidth[index] - ctx.measureText(header).width)/2;
                        //console.log('[' + index + '] colWidth: ' + colWidth[index] + ' and text width: ' + ctx.measureText(header).width);
                        break;
                    default:
                        //console.log('[' + index + ']');
                        textWidth = 0;
                }
            
                //console.log('x to col ' + index + ' start: ' + colWidth.slice(0,index).reduce((acc,curr) => acc + curr,0) + ' and text adjustment = ' + textWidth);

                ctx.fillText(header, edgeMargin + textWidth + colWidth.slice(0,index).reduce((acc,curr) => acc + curr,0), headerImgDims.height + (headerHeight - titleFontSizeInt))
            
            });

            // Draw Data Rows
            
            sortedRows.forEach((column, index) => {
                if(index == 0 || column[0] == undefined || column[0] == ''){
                    return;
                }

                let yPos = headerImgDims.height + headerHeight + (index * rowHeight);
                ctx.fillStyle = evenRowFont;
                ctx.font = evenRowFontSize;

                if(index % 2 !== 0){
                    ctx.fillStyle = evenRow;
                    ctx.fillRect(edgeMargin, yPos, canvas.width - 2*edgeMargin, rowHeight);
                    ctx.fillStyle = defaultFont;
                    ctx.font = defaultFontSize;
                }

                yPos += 2;
              /*
              if(userRank === index){
                ctx.fillStyle = highlightedRowColor;
                ctx.fillRect(0, yPos, canvas.width, yPos+rowHeight);
                }
                */

              let xPos = edgeMargin;
              
              let printText = index; //Rank
              textWidth = ctx.measureText(printText).width;                             //Centered
              ctx.fillText(printText, xPos - textWidth/2 + colWidth[0]/2, yPos - defaultFontSizeInt);   //Centered
              xPos += colWidth[0];

              printText = column[2]; //Username
              ctx.fillText(printText, xPos, yPos - defaultFontSizeInt);
              xPos += colWidth[1];

              printText = column[0]; //Avatar
              ctx.fillText(printText, xPos, yPos - defaultFontSizeInt);
              xPos += colWidth[2];

              printText = column[3]; //EXP
              textWidth = ctx.measureText(printText).width;                             //Centered
              ctx.fillText(printText, xPos - textWidth/2 + colWidth[3]/2, yPos - defaultFontSizeInt);   //Centered
              xPos += colWidth[3];

              printText = column[4]; //Tier
              textWidth = ctx.measureText(printText).width;                             //Centered
              ctx.fillText(printText, xPos - textWidth/2 + colWidth[4]/2, yPos - defaultFontSizeInt);   //Centered
              xPos += colWidth[4];

              printText = column[5]; //To Next Tier
              textWidth = ctx.measureText(printText).width;                             //Centered
              ctx.fillText(printText, xPos - textWidth/2 + colWidth[5]/2, yPos - defaultFontSizeInt);   //Centered
              xPos += colWidth[5];

              printText = column[6].replace(/:/g,''); //Next Reward
              ctx.fillText(printText, xPos, yPos - defaultFontSizeInt);
              xPos += colWidth[6];

              printText = column[7]; //Avatars
              textWidth = ctx.measureText(printText).width;                             //Centered
              ctx.fillText(printText, xPos - textWidth/2 + colWidth[7]/2, yPos - defaultFontSizeInt);   //Centered
              xPos += colWidth[7];

              printText = column[8]; //EXP Multiplier
              textWidth = ctx.measureText(printText).width;                             //Centered
              ctx.fillText(printText, xPos - textWidth/2 + colWidth[8]/2, yPos - defaultFontSizeInt);   //Centered
            });

            ctx.fillStyle = borderColor;
            ctx.fillRect(0, canvas.height - edgeMargin, canvas.width, edgeMargin);

            // Save the canvas as an image
            let buffer = canvas.toBuffer();
            const attachment = new AttachmentBuilder(buffer, leaderboardImg);
            buffer = null;
            // Send the image as a reply
            await interaction.editReply({ content: ' ', files: [attachment] });


          } catch (error) {
            console.log('Error handling leaderboard command:', error);
            await interaction.reply({ content: 'An error occurred while processing the command.', ephemeral: true });
          }
    },
  };
  