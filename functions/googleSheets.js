///////////////////
// GOOGLE SHEETS //
///////////////////

const {google} = require('googleapis');
const {JWT} = require('google-auth-library');

//GOOGLE SHEET: MASTER PUZZLER WALLET LIST
const spreadsheetId = '1OxfvL9x2AEPR17DUI6R9TW-Edwbxl6vpLfW43wmUQbE';

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

  module.exports = {
	getDataByFirstColumnValue,
	readGoogleSheet
  };