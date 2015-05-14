"use strict";

var Browser = require("zombie");

before(function () {
	Browser.site = process.env.ZOE_TARGET_URL || "http://zombie-oauth-example.herokuapp.com";
	Browser.userAgent = [
		"Mozilla/5.0 (Linux; U; Android 2.2.1; en-ca; LG-P505R Build/FRG83)",
		"AppleWebKit/533.1 (KHTML, like Gecko)",
		"Version/4.0 Mobile Safari/533.1"
	].join(" ");
});