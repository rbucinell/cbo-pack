import dotenv from 'dotenv';
import updateDotenv from 'update-dotenv';
dotenv.config();
import { rmSync, existsSync, readdirSync, createWriteStream } from 'fs';
import { readdir, readFile, stat, rm, copyFile } from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';
import prompts from 'prompts';
import axios from 'axios';
import extract from 'extract-zip';

const parserconfig = ['HtmlCompressJson=False', 'CustomTooShort=2200', 'SendEmbedToWebhook=False', 'SaveOutJSON=True', 'ParseMultipleLogs=True', 'Anonymous=False', 'UploadToDPSReports=False', 'AutoParse=False', 'RawTimelineArrays=True', 'SaveAtOut=True', 'ApplicationTraces=False', 'SendSimpleMessageToWebhook=False', 'PopulateHourLimit=0', 'MultiThreaded=True', 'ComputeDamageModifiers=True', 'LightTheme=False', 'SaveOutCSV=False', 'SkipFailedTries=True', 'CompressRaw=False', 'AutoAdd=True', 'ParseCombatReplay=False', 'DetailledWvW=False', 'SaveOutXML=False', 'IndentJSON=True', 'SaveOutHTML=False', 'ParsePhases=True', 'SaveOutTrace=False', 'UploadToRaidar=False', 'AddDuration=False', 'Outdated=False', 'HtmlExternalScripts=False'];

const PARSER = 'GuildWars2EliteInsights.exe';
const LATEST_PARSER_URL = 'https://github.com/baaron4/GW2-Elite-Insights-Parser/releases/latest/download/GW2EI.zip';
let ARCDPS_LOGS_DIR = process.env.ARCDPS_LOGS_DIR || `${process.env.USERPROFILE}\\Documents\\Guild Wars 2\\addons\\arcdps\\arcdps.cbtlogs\\WvW\\`;
let PARSER_DIR = path.dirname(path.resolve(process.env.ELITE_INSIGHTS_PARSER_EXE)) || process.cwd();

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
    return (await readdir(ARCDPS_LOGS_DIR)).filter( f => path.basename(f).startsWith(fileDateStr) && f.endsWith('.zevtc'));
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
    if( !existsSync(jsonPath ))
    {
        execSync( `${process.env.ELITE_INSIGHTS_PARSER_EXE} -c "${path.join(PARSER_DIR,"attendence.conf")}" "${zevtcPath}"`);
        let creationLog = zevtcPath.replace('.zevtc', '.log');
        if( existsSync(creationLog))
        {
            rmSync( zevtcPath.replace('.zevtc', '.log'));
        }
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
    let jsonPath = await zevtcToJSON(ARCDPS_LOGS_DIR + f);
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

const config = async () =>
{
    console.log( 'Configuration Start');
    
    //ARCDPS
    if( !existsSync( ARCDPS_LOGS_DIR ) )
    {
        let response = await prompts({
            type: 'text',
            name: 'wvwlogdir',
            message: `Can't find log directory. Please provide where your .zevtc are saved`
          });
        ARCDPS_LOGS_DIR =  response.wvwlogdir;
        updateDotenv({ ARCDPS_LOGS_DIR: ARCDPS_LOGS_DIR })
    }
    else
    {
        console.log(`ARCDPS logs directory: ${ARCDPS_LOGS_DIR}`);
    }
    if(!readdirSync(ARCDPS_LOGS_DIR).find( f => f.endsWith('zevtc')))
    {
        console.warn( `Could not find any zevtc files in ${ARCDPS_LOGS_DIR}`);
    }
    
    //PARSER EXE
    if( !existsSync(path.join(PARSER_DIR,PARSER)))
    {
        let response = await prompts( [{
            type: 'text',
            name: 'parserpath',
            message: 'Elite Insites Parser not found. [U]pdate directory, or [D]ownload Exe'
        },
        {
            type: prev => prev.toLowerCase().startsWith('u') ? 'text': null,
            name: 'parserdir',
            message: `In what directory is ${PARSER} located?`
        }]);

        if( response.parserpath.toLowerCase() === 'd' )
        {
            PARSER_DIR = path.resolve(PARSER_DIR, '..');
            let zipPath = path.join(PARSER_DIR,'./GW2EI.zip');
            let extractPathDir = path.join(PARSER_DIR,'gw2ei');
            let extractPathExe = path.join(extractPathDir,PARSER);
            await downloadFile(LATEST_PARSER_URL, zipPath);
            await extract(zipPath,{ dir: extractPathDir } );
            //await copyFile(extractPathExe,path.join(PARSER_DIR,PARSER));
            //await rm(extractPath, { recursive: true, force: true });
            await rm(zipPath, {force: true});
            
            PARSER_DIR = extractPathDir;
            await updateDotenv({ELITE_INSIGHTS_PARSER_EXE: extractPathExe});
            console.log( `Parser downloaded to: ${extractPathExe}`);
        }
        else if( response.parserpath.toLowerCase() === 'u')
        {
            PARSER_DIR = response.parserdir;
            await updateDotenv({ELITE_INSIGHTS_PARSER_EXE: path.join(PARSER_DIR,PARSER)});
        }
    }
    else
    {
        console.log( `Elite GW2 Parser found: ${path.join(PARSER_DIR,PARSER)}`);
    }

    //PARSER CONFIG
    let attendenceConfig = path.join(PARSER_DIR,"attendence.conf");
    if( !existsSync(attendenceConfig)) {
        console.log( 'creating attendence.conf for parser');
        let confWriter = createWriteStream(attendenceConfig,{
            flags: 'a'
        });
        parserconfig.forEach( c => confWriter.write( `${c}\n` ) );
        confWriter.end();
    }
    console.log( 'Configuration Complete.')
}

const downloadFile = async (fileUrl, outputLocationPath) => {
    const writer = createWriteStream(outputLocationPath);

    return axios({
      method: 'get',
      url: fileUrl,
      responseType: 'stream',
    }).then(response => {
  
      //ensure that the user can call `then()` only when the file has
      //been downloaded entirely.
  
      return new Promise((resolve, reject) => {
        response.data.pipe(writer);
        let error = null;
        writer.on('error', err => {
          error = err;
          writer.close();
          reject(err);
        });
        writer.on('close', () => {
          if (!error) {
            resolve(true);
          }
          //no need to call the reject here, as it will have been called in the
          //'error' stream;
        });
      });
    });
}

/**
 * Main function. Takes one argument, given date, otherwise uses current date.
 */
const takeAttendence = async( date ) => {
    console.log(`Parsing logs for ${date.toDateString()}`);
    let files = await zevtcForDate(date);
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
    reportAttendence( date, attendence );
}
  
(async () => {
    let date = process.argv.length > 2 ? new Date(process.argv[2]) : new Date();
    await config();
    await takeAttendence( date );
})();

