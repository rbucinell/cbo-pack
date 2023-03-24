import {get} from '../util/request.js';
import { Account } from '../models/account.js'
import { Achievement } from '../models/achivement.js';
import { Item } from '../models/item.js';

export default class account {
    
    static async get()
    {
        return Account.parse((await get('account')).data);
    }

    static async achievements() {
        return (await get('account/achievements')).data.map( e => Achievement.parse(e) );
    }

    static async bank() {
        let response = await (await get('account/bank'));
        return response.data.map( e => Item.parse(e) );
    }

    static async buildstorage() {
        return (await get('account/buildstorage')).data.map( e => Achievement.parse(e) );
    }

    static async dailycrafting() {
        return (await get('account/dailycrafting')).data.map( e => Achievement.parse(e) );
    }
}
