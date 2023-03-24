Random scripts for GW2 guilds Crimson Blackout \[CBo\] and Wovles of War \[PACK\]

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

