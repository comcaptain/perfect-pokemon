const pogobuf = require('../pogobuf/pogobuf'),
    POGOProtos = require('node-pogo-protos');

const googleLogin = new pogobuf.GoogleLogin(),
    client = new pogobuf.Client();

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
	googleLogin.loginWithAuthCode(req.body.googleAuthCode).then(token => {
	    client.setAuthInfo('google', token);
	    return client.init();
	})
	.then(() => {
	    return client.getInventory(0);
	})
	.then(inventory => {
	    if (!inventory.success) throw Error('success=false in inventory response');

	    // Split inventory into individual arrays and log them on the console
	    inventory = pogobuf.Utils.splitInventory(inventory);
	    req.session.pogoData = inventory;
	    res.send(inventory);
	})
	.catch(error => {
		console.error(error);
		res.send("ERROR: " + error);
	});
});

app.get('/pogoData', function (req, res) {
	res.send(req.session.pogoData);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});