var express = require('express');
var session = require('express-session')
var app = express();

app.use(session({
	resave: false,
	saveUninitialized: false,
	secret: 'PUT YOUR SECRET HERE'
}));

app.get('/', function (req, res) {
	res.send('Hello World! sessionValue: ' + req.session.sessionValue);
});

app.get('/setValue', function (req, res) {
	req.session.sessionValue = "sessionValue"
	res.send('Below value is stored: ' + req.session.sessionValue);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});