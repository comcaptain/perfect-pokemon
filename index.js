const pogobuf = require('pogobuf-sgq-fork');

const ClientCache = require('./ClientCache'),
	clientCache = new ClientCache();

const googleLogin = new pogobuf.GoogleLogin()

var express = require('express');
var session = require('express-session')
var app = express();

app.use((req, res, next) => {
	try {
		next();
	}
	catch(e) {
		console.error(e);
  		res.status(500).send(e);
	}
});

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
	var authCode = req.body.googleAuthCode;
	if (!authCode) {
		res.status(500).send("Please specify google auth code");
		return;
	}
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

app.get("/release/:ids", function(req, res) {
	var client = clientCache.getClient(req.session.clientKey);
	if (!client) return;
	var idList = req.params.ids.split(/\s*,\s*/);
	idList.forEach(id => client.releasePokemon(id));
	res.send("success");
})

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
	refreshData(req, res).catch(error => {
		console.error(error);
		res.send({expired: true})
	});
});

app.get('/pogoData', function (req, res) {
	res.send(req.session.pogoData);
});

app.listen(3000, function () {
  console.log('Pefect pokemon started!');
});