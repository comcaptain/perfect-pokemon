'use strict';

/*
	This example script shows how to work with the getInventory() API call and the splitInventory() function.
*/
const pogobuf = require('pogobuf'),
    POGOProtos = require('node-pogo-protos');


const login = new pogobuf.GoogleLogin(),
    client = new pogobuf.Client();

// Login to Google and get a login token
login.loginWithToken('bunnyiscute123@gmail.com', '4/cN7e2-P-TTTZgbz5SSwknZubIpv-KoDtQrd0F6nXzi0')
    .then(token => {
        console.log(token);
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