///////////////////
// GOOGLE SHEETS //
///////////////////

require('dotenv').config();
const {google} = require('googleapis');
const {JWT} = require('google-auth-library');

//GOOGLE SHEET ID
const spreadsheetId = process.env.GOOGLESHEET;

async function authorizeGoogleSheets() {
	const credentials = require('../auth/carl-410118-ecff430dbb92.json');
	const jwtClient = new JWT({
		email: credentials.client_email,
		key: credentials.private_key,
		scopes: ['https://www.googleapis.com/auth/spreadsheets'],
	  });
    await jwtClient.authorize();
	return google.sheets({ version: 'v4', auth: jwtClient });
  }


  async function getAllDataFromSheet(sheetName, ssID=spreadsheetId) {
	try {
	  const sheets = await authorizeGoogleSheets();
  
	  // Fetch all values from the specified sheet
	  const sheet = await sheets.spreadsheets.values.get({
		ssID,
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


  
async function getDataByFirstColumnValue(sheetName, namedRange, targetValue, ssID=spreadsheetId) {
	try {
	  const sheets = await authorizeGoogleSheets();
  
	  // Fetch the values from the specified named range
	  const sheet = await sheets.spreadsheets.values.get({
		ssID,
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

async function getSheetNames(ssID=spreadsheetId){
	try {
		const sheets = await authorizeGoogleSheets();
		const { data } = await sheets.spreadsheets.get({
			ssID,
		  fields: 'sheets(properties(title))',
		});
	
		const sheetNames = data.sheets.map(sheet => sheet.properties.title);
	
		return sheetNames;
	  } catch (error) {
		console.error('Error getting sheet names:', error.message);
		throw error;
	  }
}
  
  async function readGoogleSheet(sheetName, cellRanges, ssID=spreadsheetId) {
	try {
		const sheets = await authorizeGoogleSheets();

			// Check if sheetName is a number
			if (!isNaN(sheetName)) {
				const sheetIndex = parseInt(sheetName) - 1;

				const result = await sheets.spreadsheets.get(
					{
						spreadsheetId: ssID,
						fields:	"sheets/properties/title"
					});
					
					let sheetNames = result.data.sheets;
					//console.log('Sheet Names: ' + JSON.stringify(sheetNames));

				if(sheetIndex >= sheetNames.length){
					sheetIndex = 0;
				}
				sheetName = sheetNames[sheetIndex].properties.title;
				console.log(`SheetName Identified: ${sheetName}`);
			}

		// Check if cellRanges is an array
		if (Array.isArray(cellRanges)) {
		  let valuesArray = [];
	
		  // Loop through each element in the array
		  for (const cellRange of cellRanges) {
			if (typeof cellRange === 'string') {
			  const sheet = await sheets.spreadsheets.values.get({
				spreadsheetId: ssID,
				range: `${sheetName}!${cellRange}`,
			  });
			
			  //	console.log('sheet values in googleSheets: ' + JSON.stringify(sheet));
			  
			  // Extract the values from the response and push them to the array
			  valuesArray = sheet.data.values.filter(value => value !== "" && value != undefined);
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

async function writeToGoogleSheet(userIds, sheetName, ssID=spreadsheetId) {
	
	const data = await getNicknames(userIds);
	console.log('Writing to google sheet...');
  
	try {
		const sheets = await authorizeGoogleSheets();
		const rangeStartRow = await findFirstEmptyCell(sheets, ssID, sheetName);
		const range = `${sheetName}!A${rangeStartRow}`;
		const valueInputOption = 'USER_ENTERED';
	
		const requestBody = {
		  values: data.map(item => [item]),
		};
	
		const response = await sheets.spreadsheets.values.update({
			ssID,
		  range,
		  valueInputOption,
		  resource: requestBody,
		});
	
		console.log('Google Sheets updated successfully:', response.data);
	  } catch (error) {
		console.error('Error updating Google Sheets:', error.message);
	  }  }


  async function findFirstEmptyCell(sheets, ssID, sheetName) {
	const response = await sheets.spreadsheets.values.get({
	  ssID,
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

  async function googleWalletLookup(user, ssID=spreadsheetId){
	try {
		cellRange = "WALLETS!DISWALLET";
		const userIndex = 0; 		// User id values in the first column
		const walletIndex = 1; 		// Wallet values in second column

		const sheets = await authorizeGoogleSheets();
		const response = await sheets.spreadsheets.values.get({
			ssID,
			range: cellRange,
		  });
	  	
		const valuesArray = response.data.values;
	  
		if (!valuesArray || valuesArray.length === 0) {
		console.log('googleWalletLookup: No data found.');
		return '';
		}
		   
		const rowIndex = valuesArray.findIndex(row => row[userIndex] === user);
	  
		if (rowIndex !== -1) {
			return valuesArray[rowIndex][walletIndex];
		} else {
			return '';	//User not found
		}

	  } catch (error) {
		console.error('Error reading Google Sheets data:', error.message);
	  }
  }

  module.exports = {
	getAllDataFromSheet,
	getDataByFirstColumnValue,
	readGoogleSheet,
	writeToGoogleSheet,
	googleWalletLookup,
	getSheetNames
  };