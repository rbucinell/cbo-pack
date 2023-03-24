import { gw2 } from "./gw2/api.js";

// //Get Guild Logs
// const account = await gw2.account.get();
// const guilds = await Promise.all(account.guilds.map(async g => await gw2.guild.get(g)));
// let pack = guilds.find( g => g.tag === 'PACK');
// let packlogs = await gw2.guild.log( pack.id );

console.log( await gw2.account.bank() );