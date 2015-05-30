var express = require('express')
var bodyParser = require('body-parser')
var util = require('util');
var _ = require('underscore');
var request = require('request');

require('dotenv').load();

function log(message) {
	var prefix = (new Date).toISOString();

	if(typeof message === 'object') {
		console.log(prefix + " ▼");
		console.log(util.inspect(message, {showHidden: false, depth: 10}));
	} else {
		console.log(prefix + " -> " + message);
	}
}

var app = express();
app.use(bodyParser.json());

app.get('/alive', function handleAlive(req, res) {
  res.send('yes');
});

app.use(express.static('web'));

var port = process.env.PORT || 5000;

var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;
  log('Example app listening at http://'+host+':'+port);
});
