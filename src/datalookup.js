//https://blog.coupler.io/how-to-use-google-sheets-as-database/

import { google } from "googleapis";
import { readFile } from 'fs/promises';
const secretKey = JSON.parse( await readFile( new URL('../arctivius-automaton-649b1e5eb52d.json', import.meta.url)) );

//authenticate request
let jwtClient = new google.auth.JWT( secretKey.client_email, null, secretKey.private_key, ['https://www.googleapis.com/auth/spreadsheets']);
await jwtClient.authorize();

//Google Sheets API
let spreadsheetId = '1_ZyImw6ns9Gqw4jSKtH67iWRbGtQkeJnEXroowXPgas';
let sheetRange = 'Guild Info!A4:Q100'
let sheets = google.sheets('v4');

try{
    let response = await sheets.spreadsheets.values.get({ auth: jwtClient, spreadsheetId: spreadsheetId, range: sheetRange });
    console.log(`Spitting out pack members:`);
    for (let row of response.data.values) {
        if( row[1] !== '')
            console.log(`Teamspeak: [${row[1]}]\t\t\t\tGW2: [${row[2]}]\t\t\t\tDiscord: [${row[3]}]`);
    }
}catch( err )
{
    console.log('The API returned an error: ' + err);
}