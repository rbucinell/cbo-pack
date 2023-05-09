import dotenv from 'dotenv';
dotenv.config();
import { readdir, readFile, stat } from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path'
import { rmSync } from 'fs';

const log_dir = `${process.env.USERPROFILE}\\Documents\\Guild Wars 2\\addons\\arcdps\\arcdps.cbtlogs\\WvW\\`;

/**
 * Finds all zevtc files that were generated on a given date
 * 
 * @param {Date} executeDate the date of the logs we are looking for
 * @returns Array<string> list of zevtc file names
 */
const zevtcForDate = async ( executeDate ) => {
    let date = new Date(executeDate);
    date.setMinutes( date.getMinutes() - date.getTimezoneOffset() );
    const dateStr = date.toISOString().slice(0,10);
    const fileDateStr = dateStr.replaceAll('-','');
    return (await readdir(log_dir)).filter( f => path.basename(f).startsWith(fileDateStr) && f.endsWith('.zevtc'));
}

/**
 * looks for the JSON equivalent of given zevtc file. If missing it will use parser to generate one.
 * (Deletes generated log file to keep dir clean).
 * 
 * @param {*} zevtcPath path to zevtc file
 * @returns zevtc's JSON genrated file path
 */
const zevtcToJSON = async ( zevtcPath ) => {
    const jsonPath = zevtcPath.replace('.zevtc', '_wvw_kill.json');
    try {    
        await stat(jsonPath);
    } catch( err )
    {
        execSync( `${process.env.GW2_ELITE_INSIGHTS_PARSER_EXE} -c "${process.env.GW2_ELITE_INSIGHTS_PARSER_CONFIG}" "${zevtcPath}"`);
        rmSync( zevtcPath.replace('.zevtc', '.log'));
    }
    return jsonPath;
}

/**
 * extracts data from zevtc file in JSON format.
 * 
 * @param {string} f file path of zevtc file
 * @returns object representing data in file
 */
const readZevtcJSONData = async ( f ) => {
    let jsonPath = await zevtcToJSON(log_dir + f);
    let fileBuffer = await readFile( jsonPath );
    return JSON.parse( fileBuffer );
}

/**
 * Logs attendence data to screen in markdown format. (For copy-pasting into discord).
 * 
 * @param {Date} executeDate the date of the logs we are looking for
 * @param {Array} attendence list of player data (account and names) that were in attendence on given date
 */
const reportAttendence = ( executeDate, attendence ) => {
    console.log( `-----------------------------------\nAccording to the logs, tonight's (${executeDate.toDateString()}) attendence:\n\`\`\``);
    let longestAcct = Math.max(...attendence.map(a => a.account.length));
    attendence.forEach( (attendee,i) =>{
        const index = i+1;
        let acct = attendee.account;
        console.log( `${index<10?`0${index}`:index}. ${acct}${' '.repeat(longestAcct-acct.length)} | ${attendee.name}`);
    });
    console.log( '\`\`\`');
}

/**
 * Main function. Takes one argument, given date, otherwise uses current date.
 */
(async () => {
    let executeDate = process.argv.length > 2 ? new Date(args[2]) : new Date();
    console.log(`Parsing logs for ${executeDate.toDateString()}`);
    let files = await zevtcForDate(executeDate);
    let attendence = [];

    let i = 1;
    for( let f of files ) {
        console.log( `[${i++}/${files.length}] ${f}` );
        let players = (await readZevtcJSONData( f )).players;
        players.filter( p => !p.notInSquad ).forEach( player => {
            if( !attendence.find( p => p.account === player.account))
                attendence.push(player);
        });

    }
    attendence.sort((a, b) => a.account.toLowerCase().localeCompare(b.account.toLowerCase()));
    reportAttendence( executeDate, attendence );
})();
