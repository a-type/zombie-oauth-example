"use strict";

var Browser = require("zombie");

before(function () {
	Browser.site = process.env.ZOE_TARGET_URL || "http://zombie-oauth-example.herokuapp.com";
});