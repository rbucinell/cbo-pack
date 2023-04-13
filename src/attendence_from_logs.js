import dotenv from 'dotenv';
dotenv.config();
import { readdir, readFile } from 'fs/promises';

const log_dir = `${process.env.USERPROFILE}\\Documents\\Guild Wars 2\\addons\\arcdps\\arcdps.cbtlogs\\WvW\\`;

let files = (await readdir(log_dir)).filter( f => f.endsWith('.json'));
let attendence = [];
for( let f of files )
{
    console.log( `${log_dir}${f}` );
    let fileBuffer = await readFile( `${log_dir}${f}` );
    let file = JSON.parse(fileBuffer);
    let players = file.players;
    
    players.forEach( player => {
        if( !attendence.find( p => p.account === player.account))
            attendence.push(player);
    });
}
console.log( `-----------------------------------\nAccording to the logs, tonight's (${new Date().toDateString()}) attendence:\n\`\`\``);
attendence.forEach( (attendee, i) => console.log( `${i+1}. [ ${attendee.account} ] ${attendee.name}` ) );
console.log( '\`\`\`');
