import { gw2 } from '../api.js'
import axios from 'axios';

const base_url = 'https://api.guildwars2.com';
const version = 'v2';

export const get = async function( path )
{
    let url = `${base_url}/${version}/${path}`;
    try
    {
        let response = await axios.get(url,{
            headers: {
                'Authorization': `Bearer ${ gw2.apikey }`,
                'Content-Type':'application/json'
            }
        });
        return response;
    }
    catch( ae )
    {
        let err = `[${ae.response.status}] GW2API /${path}: ${ae.response.data.text}`;
        console.error( err );
        Promise.reject();
    }
}