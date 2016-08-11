'use strict';

const GoogleOAuth = require('gpsoauthnode');
const google = new GoogleOAuth();

const loginURL = 'https://accounts.google.com/o/oauth2/auth?client_id=848232511240-73ri3t7plvk96pj4f85uj8otdat2alem.apps.googleusercontent.com&redirect_uri=urn%3Aietf%3Awg%3Aoauth%3A2.0%3Aoob&response_type=code&scope=openid%20email%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email';

/*
	This example script shows how to work with the getInventory() API call and the splitInventory() function.
*/
const pogobuf = require('pogobuf'),
    POGOProtos = require('node-pogo-protos');


const login = new pogobuf.GoogleLogin(),
    client = new pogobuf.Client();
//4/g1FefXs196csIzsFP32JHoWFjq3ppF16Lx2x4oLs1d0
//oauth2rt_1/PBPLSOQrDvTJow-PJvaNckoJOZUN0R7PAXaRdyImNy4
// Login to Google and get a login token
//
new Promise(function(resolve, reject) {
    google.loginWithAuthCode("4/Vl0oHMwLZRHeHGP5mMLBokTt41VaE73B0WIeOZyiLZ8", function(data, error) {
        if (error) reject(error);
        else resolve(data.id_token);
    });
})
.then(token => {
    console.log(token)
    // Initialize the client
    client.setAuthInfo('google', token);

    // Uncomment the following if you want to see request/response information on the console
    client.on('request', console.dir);
    client.on('response', console.dir);

    // Perform the initial request
    return client.init();
})
.then(() => {
    // Get full inventory
    return client.getInventory(0);
})
.then(inventory => {
    if (!inventory.success) throw Error('success=false in inventory response');

    // Split inventory into individual arrays and log them on the console
    inventory = pogobuf.Utils.splitInventory(inventory);
    console.log('Full inventory:', inventory);

    console.log('Items:');
    inventory.items.forEach(item => {
        console.log(item.count + 'x ' + pogobuf.Utils.getEnumKeyByValue(POGOProtos.Inventory.Item.ItemId, item.item_id));
    });
})
.catch(console.error);