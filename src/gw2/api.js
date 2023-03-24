import dotenv from 'dotenv';
dotenv.config();
import account from './account/account.js';
import guild   from './guild/guild.js';

const gw2 = {
    account,
    guild
};

Object.defineProperty( gw2, "apikey", {
    get: () => process.env.GW2_API_TOKEN,
    set: ( val ) => process.env.GW2_API_TOKEN = val
});

export {gw2};

