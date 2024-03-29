import { google } from "googleapis";
import { JWT } from "google-auth-library";
import { pathToFileURL } from "url";
import path from "path";

async function authorizeGoogleSheets() {
    const jwtClient = new JWT({
        email: process.env.GSHEET_EMAIL,
        key: process.env.GSHEET_KEY.replace(/\\n/g, '\n'),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    await jwtClient.authorize();
    return google.sheets({
        version: "v4",
        auth: jwtClient,
    });
}

async function getAllDataFromSheet(sheetName, ssID = process.env.GOOGLESHEET) {
    try {
        const sheets = await authorizeGoogleSheets();
        const sheet = await sheets.spreadsheets.values.get({
            spreadsheetId: ssID,
            range: `${sheetName}!A:B`,
        });
        const values = sheet.data.values || [];
        return values;
    } catch (error) {
        console.error(`Error retrieving data from Google Sheets (getAllDataFromSheet): ${error.message}`);
        throw new Error("Error retrieving data. Please try again later.");
    }
}

async function getDataByFirstColumnValue(sheetName, namedRange, targetValue, ssID = process.env.GOOGLESHEET) {
    try {
        const sheets = await authorizeGoogleSheets();
        const sheet = await sheets.spreadsheets.values.get({
            spreadsheetId: ssID,
            range: `${sheetName}!${namedRange}`,
        });
        const values = sheet.data.values;
        // Find the row that contains the target value in the first column
        const targetRow = values.find((row) => row[0] === targetValue);
        return targetRow || [];
    } catch (error) {
        console.error(`Error retrieving data from Google Sheets (getDataByFirstColumnValue): ${error.message}`);
        throw new Error("Error retrieving data. Please try again later.");
    }
}

async function getSheetNames(ssID = process.env.GOOGLESHEET) {
    try {
        const sheets = await authorizeGoogleSheets();
        const { data } = await sheets.spreadsheets.get({
            spreadsheetId: ssID,
            fields: "sheets(properties(title))",
        });
        const sheetNames = data.sheets.map((sheet) => sheet.properties.title);
        return sheetNames;
    } catch (error) {
        console.error("Error getting sheet names (getSheetNames):", error.message);
        throw error;
    }
}

async function readGoogleSheet(sheetName, cellRanges, ssID = process.env.GOOGLESHEET) {
    try {
        const sheets = await authorizeGoogleSheets();

        // Check if sheetName is a number
        if (!isNaN(sheetName)) {
            const sheetIndex = parseInt(sheetName) - 1;
            const result = await sheets.spreadsheets.get({
                spreadsheetId: ssID,
                fields: "sheets/properties/title",
            });
            let sheetNames = result.data.sheets;

            if (sheetIndex >= sheetNames.length) {
                sheetIndex = 0;
            }
            sheetName = sheetNames[sheetIndex].properties.title;
            console.log(`SheetName Identified: ${sheetName}`);
        }
        let valuesArray = [];

        // Check if cellRanges is an array
        if (Array.isArray(cellRanges)) {
            // Loop through each element in the array
            for (const cellRange of cellRanges) {
                if (typeof cellRange === "string") {
                    const sheet = await sheets.spreadsheets.values.get({
                        spreadsheetId: ssID,
                        range: `${sheetName}!${cellRange}`,
                    });

                    //	console.log('sheet values in googleSheets: ' + JSON.stringify(sheet));

                    // Extract the values from the response and push them to the array
                    valuesArray.push(sheet.data.values.filter((value) => value !== "" && value != undefined));
                } else {
                    throw new Error(`Invalid element in the array: ${cellRange}`);
                }
            }
            return valuesArray;
        } else {
            if (typeof cellRanges === "string") {
                const sheet = await sheets.spreadsheets.values.get({
                    spreadsheetId: ssID,
                    range: `${sheetName}!${cellRanges}`,
                });

                // Extract the values from the response and push them to the array
                valuesArray = sheet.data.values.filter((value) => value !== "" && value != undefined);
                return valuesArray;
            }
        }
    } catch (error) {
        console.error("Error reading Google Sheets data (readGoogleSheet):", error.message);
    }
}

async function writeToGoogleSheet(userIds, sheetName, ssID = process.env.GOOGLESHEET) {
    const data = await getNicknames(userIds);
    console.log("Writing to google sheet...");
    try {
        const sheets = await authorizeGoogleSheets();
        const rangeStartRow = await findFirstEmptyCell(sheets, ssID, sheetName);
        const range = `${sheetName}!A${rangeStartRow}`;
        const valueInputOption = "USER_ENTERED";
        const requestBody = {
            values: data.map((item) => [item]),
        };
        const response = await sheets.spreadsheets.values.update({
            ssID,
            range,
            valueInputOption,
            resource: requestBody,
        });
        console.log("Google Sheets updated successfully:", response.data);
    } catch (error) {
        console.error("Error writing to Google Sheets:", error.message);
    }
}

async function findFirstEmptyCell(sheets, ssID, sheetName) {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: ssID,
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

async function googleWalletLookup(user, ssID = process.env.GOOGLESHEET) {

    try {
        const cellRange = "WALLETS!DISWALLET";
        const userIndex = 0; // User id values in the first column
        const walletIndex = 1; // Wallet values in second column

        const sheets = await authorizeGoogleSheets();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: ssID,
            range: cellRange,
        });
        const valuesArray = response.data.values;
        if (!valuesArray || valuesArray.length === 0) {
            console.log("googleWalletLookup: No data found.");
            return "";
        }
        const rowIndex = valuesArray.findIndex((row) => row[userIndex] === user);
        if (rowIndex !== -1) {
            return valuesArray[rowIndex][walletIndex];
        } else {
            return ""; //User not found
        }
    } catch (error) {
        console.error("Error reading Google Sheets data (googleWalletLookup):", error.message);
    }
}

export {
    getAllDataFromSheet,
    getDataByFirstColumnValue,
    readGoogleSheet,
    writeToGoogleSheet,
    googleWalletLookup,
    getSheetNames,
};
