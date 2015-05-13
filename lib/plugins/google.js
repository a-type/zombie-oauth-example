"use strict";
exports.register = function (server, options, done) {
	server.dependency([ "bell" ], function (server, done) {
		server.auth.strategy("google", "bell", {
			clientId : options.clientId,
			clientSecret : options.clientSecret,
			password : options.password,
			provider : "google",
			scope : [
				"openid",
				"https://www.googleapis.com/auth/plus.login",
				"https://www.googleapis.com/auth/plus.me"
			],
			isSecure : false
		});

		server.route({
			method : "GET",
			path   : "/providers/google/login",
			
			config : {
				auth : {
					mode : "required",
					strategies : [ "google" ]
				}
			},
			
			handler : function (req, reply) {
				if (req.query.error) {
					server.log([ "warn", "google" ], "Failed to log in with google: '" + req.query.error + "'");
					reply.redirect("/");
					return;
				}
				
				server.log([ "info", "google" ], "Logged in: " + req.auth.credentials.profile.displayName);
				
				reply.view("profile", { name : req.auth.credentials.profile.displayName });
			}
		});
		
		done();
	});
	
	done();
};

exports.register.attributes = { name : "google" };