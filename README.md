# PACK and CBo Scripts
Random scripts for GW2 guilds Crimson Blackout \[CBo\] and Wovles of War \[PACK\]

## Requirements
* [Node.js](https://nodejs.org/en/download)

## Setup

1. Create `.env` file in root directory. see `sample.env` for format.
2. run `npm install`. Install dependencies

## Run attendence script

For current date:
```bash
npm run attendence
```
or for a given date:
```bash
npm run attendence "05/17/2023"
```

## Development

### gw2 api wrapper usage

Loading the module will attempt to load `process.env.GW2_API_TOKEN` (recomended)

```javascript
import { gw2 } from "./gw2/api.js";

let account = await gw2.account.get();
console.log( account );
```

otherwise you can set the api in code:

```javascript
import { gw2 } from "./gw2/api.js";

gw2.apikey( YOUR_API_KEY );
let account = await gw2.account.get();
console.log( account );
```

