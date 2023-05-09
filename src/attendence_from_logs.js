import dotenv from 'dotenv';
dotenv.config();
import { readdir, readFile, stat } from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path'
import { rmSync } from 'fs';

const log_dir = `${process.env.USERPROFILE}\\Documents\\Guild Wars 2\\addons\\arcdps\\arcdps.cbtlogs\\WvW\\`;

const todaysZEVTC = async ( executeDate ) => {
    let date = new Date(executeDate);
    date.setMinutes( date.getMinutes() - date.getTimezoneOffset() );
    const dateStr = date.toISOString().slice(0,10);
    const fileDateStr = dateStr.replaceAll('-','');
    return (await readdir(log_dir)).filter( f => path.basename(f).startsWith(fileDateStr) && f.endsWith('.zevtc'));
}

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

const readData = async ( f ) => {
    let jsonPath = await zevtcToJSON(log_dir + f);
    let fileBuffer = await readFile( jsonPath );
    return JSON.parse( fileBuffer );
}

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

const main = async ( executeDate ) => {
    console.log(`Parsing logs for ${executeDate.toDateString()}`);
    let files = await todaysZEVTC(executeDate);
    let attendence = [];

    let i = 1;
    for( let f of files ) {
        console.log( `[${i++}/${files.length}] ${f}` );
        let players = (await readData( f )).players;
        players.filter( p => !p.notInSquad ).forEach( player => {
            if( !attendence.find( p => p.account === player.account))
                attendence.push(player);
        });

    }
    attendence.sort((a, b) => a.account.toLowerCase().localeCompare(b.account.toLowerCase()));
    reportAttendence( executeDate, attendence );
}
let args = process.argv.slice(2);
let today = args.length > 0 ? new Date(args[0]) : new Date();
await main(today);
