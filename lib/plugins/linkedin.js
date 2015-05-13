"use strict";
exports.register = function (server, options, done) {
	server.dependency([ "bell" ], function (server, done) {
		server.auth.strategy("linkedin", "bell", {
			clientId : options.clientId,
			clientSecret : options.clientSecret,
			password : options.password,
			provider : {
				protocol : "oauth2",
				headers : {
					"x-li-format" : "json"
				},
				auth : "https://linkedin.com/uas/oauth2/authorization",
				token : "https://www.linkedin.com/uas/oauth2/accessToken",
				scope : [ "r_basicprofile" ],
				
				profile : function (credentials, params, get, callback) {
					get(
						"https://api.linkedin.com/v1/people/~:(id,formatted-name)",
						null,
						function (profile) {
							credentials.profile = {
								id : profile.id,
								displayName : profile.formattedName,
								raw : profile
							};
							
							return callback();
						}
					);
				}
			},
			isSecure : false
		});
		
		server.route({
			method : "GET",
			path   : "/providers/linkedin/login",
			
			config : {
				auth : {
					mode : "required",
					strategies : [ "linkedin" ]
				}
			},
			
			handler : function (req, reply) {
				if (req.query.error) {
					server.log([ "warn", "linkedin" ], "Failed to log in with linkedin: '" + req.query.error + "'");
					reply.redirect("/");
					return;
				}
				
				server.log([ "info", "linkedin" ], "Logged in: " + req.auth.credentials.profile.displayName);
				
				reply.view("profile", { name : req.auth.credentials.profile.displayName });
			}
		});
		
		done();
	});
	
	done();
};

exports.register.attributes = { name : "linkedin" };