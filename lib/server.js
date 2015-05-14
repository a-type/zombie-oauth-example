"use strict";
var Hapi = require("hapi");
var Path = require("path");

var server = new Hapi.Server();
server.connection({ port : process.env.PORT });

server.views({
	engines : {
		html : require("handlebars")
	},

	path : Path.join(__dirname, "views")
});

server.register(
	[
		{
			register : require("bell")
		},
		{
			register : require("./plugins/google"),
			options  : {
				clientId     : process.env.ZOE_GOOGLE_CLIENT_ID,
				clientSecret : process.env.ZOE_GOOGLE_CLIENT_SECRET,
				password     : process.env.COOKIE_PASSWORD || "default_cookie_password"
			}
		},
		{
			register : require("./plugins/linkedin"),
			options  : {
				clientId     : process.env.ZOE_LINKEDIN_CLIENT_ID,
				clientSecret : process.env.ZOE_LINKEDIN_CLIENT_SECRET,
				password     : process.env.COOKIE_PASSWORD || "default_cookie_password"
			}
		}
	],
	function (err) {
		if (err) {
			console.error(err);
			console.log("Failed to register plugins");
		}
	}
);

server.route({
	method : "GET",
	path   : "/",

	handler : {
		view : "index"
	}
});

server.start(function () {
	console.log("Server running at:", server.info.uri);
});