const { TeamSpeak } = require("ts3-nodejs-library")

const main = async () => {
    let teamspeak = await TeamSpeak.connect({
        host: 'ts40.gameservers.com',
        serverport: 10011,
        username: "arctivius",
        password: "buci551!TeamSpeak",
        nickname: 'Arctivius Bot'
    });
    
    const whoami = await teamspeak.whoami()
    console.log( 'whoami', whoami );
    let clients = await teamspeak.clientList({ clientType: 0 });
    
    clients.forEach(element => {
        console.log( element.nickname );    
    });
};
main();