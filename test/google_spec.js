"use strict";

var Browser = require("zombie");

var expect = require("chai").expect;

describe("the google oauth login flow", function () {
	var browser;
	var flowComplete = false;

	var googleEmail = process.env.ZOE_GOOGLE_EMAIL;
	var googlePassword = process.env.ZOE_GOOGLE_PASSWORD;
	var googleDisplayName = process.env.ZOE_GOOGLE_DISPLAYNAME;

	before(function () {
		browser = new Browser();

		return browser.visit("/")
		.then(function () {
			return browser.clickLink("Google");
		})
		.then(function () {
			// redirected to the google oauth login screen
			// the element values here are dependent on google's
			// login screen design, which may change!
			return browser
			.fill("input[placeholder='Email']", googleEmail)
			.fill("input[placeholder='Password']", googlePassword)
			.pressButton("input[type=submit]");
		})
		.then(function () {
			// since the user has already authorized the application
			// out-of-band, and already has a google session token,
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
		expect(browser.window.document.title, "profile title").to.equal("OAuth Profile Page");
	});

	it("displays the profile page with the correct name", function () {
		expect(browser.query("#welcome").textContent, "welcome text").to.contain(googleDisplayName);
	});
});