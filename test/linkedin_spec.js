"use strict";

var Bluebird = require("bluebird");
var Browser = require("zombie");

var expect = require("chai").expect;

describe("the linkedin oauth login flow", function () {
	var browser;
	var flowComplete = false;

	var linkedinEmail = process.env.ZOE_LINKEDIN_EMAIL;
	var linkedinPassword = process.env.ZOE_LINKEDIN_PASSWORD;
	var linkedinDisplayName = process.env.ZOE_LINKEDIN_DISPLAYNAME;

	before(function () {
		// linkedin is trickier than google. their framebuster is
		// on their login page during the oauth flow, so we can't log in
		// via oauth. we need to get a session token some other way

		browser = new Browser();

		// so, we will visit the linkedin site.. as a mobile client.
		// the only login site we have found which can be run by Zombie
		browser.userAgent = [
			"Mozilla/5.0 (Linux; U; Android 2.2.1; en-ca; LG-P505R Build/FRG83)",
			"AppleWebKit/533.1 (KHTML, like Gecko)",
			"Version/4.0 Mobile Safari/533.1"
		].join(" ");

		return browser.visit("https://www.linkedin.com/uas/login")
		.then(function () {
			// redirected to the linkedin oauth login screen
			// the element values here are dependent on linkedin's
			// login screen design, which may change!
			return browser
			.fill("#session_key-login", linkedinEmail)
			.fill("#session_password-login", linkedinPassword)
			.pressButton("#signin-submit");
		})
		.then(function () {
			// one more step... since we are in a mobile browser,
			// linkedin asks if we'd like to download the app instead.
			// ... we can't do that!

			// we anticipate some browser errors here because of differences
			// between zombie and "real" browsers. we suspect that this page 
			// may be trying to interact with the play store since we are
			// pretending to be an android device. these errors aren't fatal,
			// so let's ignore them...
			browser.silent = true;
			return browser.clickLink("#action-no-app");
		})
		.catch(function () {
			// linkedin throws javascript exceptions from the page in zombie
			// catching them all might not be the best tactic, but it does work

			// now, let's let the browser talk again
			browser.silent = false;
		})
		.then(function () {
			// this pause is necessary to get around a bug with the linkedin api
			// that happens if you try to authenticate too soon after
			// obtaining a cookie.
			return Bluebird.delay(5000);
		})
		.then(function () {
			return browser.visit("/");
		})
		.then(function () {
			return browser.clickLink("LinkedIn");
		})
		.then(function () {
			// since the user has already authorized the application
			// out-of-band, and already has a linkedin session token,
			// the acceptance screen (and framebuster) should be skipped
			return browser.wait(null);
		})
		.then(function () {
			flowComplete = true;
		});
	});

	// log browser state if the flow is not complete, so we can see what happened
	after(function () {
		if (!flowComplete) {
			console.log(browser.html("body"));
		}
	});

	it("reaches the profile page", function () {
		// if we're not on the profile page, where are we?
		if (browser.window.document.title !== "OAuth Profile Page") {
			console.log(browser.html());
		}
		expect(browser.window.document.title, "profile title").to.equal("Example Profile Page");
	});

	it("displays the profile page with the correct name", function () {
		expect(browser.window.document.getElementById("welcome").textContent, "welcome text")
			.to.contain(linkedinDisplayName);
	});
});