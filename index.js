const pogobuf = require('../pogobuf/pogobuf'),
    POGOProtos = require('node-pogo-protos');

const ClientCache = require('./ClientCache'),
	clientCache = new ClientCache();

const googleLogin = new pogobuf.GoogleLogin()

var express = require('express');
var session = require('express-session')
var app = express();

var bodyParser = require('body-parser')
app.use(bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 


app.use(express.static("public"));
app.use('/', express.static('public/index.html'));

app.use(session({
	resave: false,
	saveUninitialized: false,
	secret: 'PUT YOUR SECRET HERE'
}));

app.post('/login', function (req, res) {
	var client = new pogobuf.Client();
	googleLogin.loginWithAuthCode(req.body.googleAuthCode).then(token => {
	    client.setAuthInfo('google', token);
	    return client.init();
	})
	.then(() => {
	    req.session.clientKey = clientCache.addClient(client);
	    return refreshData(req, res, client);
	})
	.catch(error => {
		console.error(error);
		res.send("ERROR: " + error);
	});
});

function refreshData(req, res, client) {
	if (client === undefined) client = clientCache.getClient(req.session.clientKey);
	if (!client) return;
	return client.getInventory(0).then(inventory => {
	    if (!inventory.success) throw Error('success=false in inventory response');

	    // Split inventory into individual arrays and log them on the console
	    inventory = pogobuf.Utils.splitInventory(inventory);
	    req.session.pogoData = inventory;
	    res.send(inventory);
	})
}

app.get('/refresh', function (req, res) {
	refreshData(req, res);
});

app.get('/pogoData', function (req, res) {
	res.send(req.session.pogoData);
});

app.listen(3000, function () {
  console.log('Pefect pokemon started!');
});