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
				
				reply.view("profile", { name : req.auth.credentials.profile.fullName });
			}
		});
		
		done();
	});
	
	done();
};

exports.register.attributes = { name : "google" };