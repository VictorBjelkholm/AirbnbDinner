var express = require('express')
var bodyParser = require('body-parser')
var util = require('util');
var _ = require('underscore');
var request = require('request');
var cps = require('cps-api');

require('dotenv').load();

var cpsConn = new cps.Connection(
		'tcp://cloud-eu-0.clusterpoint.com:9007',
		'AirbnbDinner',
		'victorbjelkholm+airbnbdinner@gmail.com',
		'somethingaweful',
		'document',
		'document/id',
		{
			account: 836
		}
);

//cpsConn.debug = true;

var Cousine = {
	type: "cousine",
	name: null
};

var Reservation = {
	type: "reservation",
	active: true,
	user_id: null,
	dinner_id: null,
	number_of_people: 2 // The number of people this Reservation implies
};
var Dinner = {
	type: "dinner",
	user_id: null,
	timestamp: (new Date()), // The time of the dinner
	location: { // Location of the Dinner
		lat: 37.365759,
		lng: -121.9233569
	},
	can_donate_on_cancel: true, // If Reservation is cancelled, will we donate?
	people_allowed: 2, // How many people can we allow in this dinner?
	cousine_id: null, // The ID of the cousine this dinner will have
	description: null, // Markdown description of the details of the dinner
	will_donate: true // Will always donate of earnings
};

var User = {
	type: "user",
	name: null,
	email: null,
	password: null
};

function log(message) {
	var prefix = (new Date).toISOString();

	if(typeof message === 'object') {
		console.log(prefix + " ▼");
		console.log(util.inspect(message, {showHidden: false, depth: 10}));
	} else {
		console.log(prefix + " -> " + message);
	}
}
function guid(string) {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
	});
}

var app = express();
app.use(bodyParser.json());

app.get('/alive', function handleAlive(req, res) {
  res.send('yes');
});

app.use(express.static('web'));

var UsersService = {
	findByEmail: function(email, callback) {
		var search_req = new cps.SearchRequest(cps.Term(email, "email"));
		cpsConn.sendRequest(search_req, function (err, search_resp) {
			if (err) return console.log(err);
			if(search_resp.results === undefined) {
				callback(null, false);
				return
			}
			var length = search_resp.results.document.length;
			if(length !== 0) {
				callback(null, true);
			}
		});
	},
	createUser: function(user, callback) {
		if(!user.name) {
			callback({message: "Username required"});
			return
		}
		if(!user.email) {
			callback({message: "Email required"});
			return
		}
		if(!user.password) {
			callback({message: "Password required"});
			return
		}

		this.findByEmail(user.email, function(err, found) {
			if(!found) {
				user.id = guid();
				cpsConn.sendRequest(new cps.InsertRequest(user), function(err, insert_response) {
					callback(err, user);
				});
			} else {
				callback({message: "Email already used!"});
			}
		});
	}
}

app.post('/users', function handlePostUsers(req, res) {
	var body = req.body;
	UsersService.createUser(body, function(err, user) {
		if(err) {
			console.error('Error creating user');
			log(err);
			res.send(err);
		} else {
			log('user');
			log(user);
			res.send(user);
		}
	});
});

var port = process.env.PORT || 5000;

var server = app.listen(port, function () {
  var host = server.address().address;
  var port = server.address().port;
  log('Example app listening at http://'+host+':'+port);
});
