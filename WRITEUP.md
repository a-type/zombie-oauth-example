# Testing OAuth Integration Flows with Zombie.js
There are some very good reasons to use headless browsers, like [Zombie.js](zombie.js.org), to do integration testing for your Node.js web application. Headless browsers are fast, and designed for Node's asynchronous patterns (unlike the more synchronous nature of Selenium, for example). However, there is an obvious drawback: they're just not quite the same. Having done a lot of testing with Zombie.js for various projects at Bandwidth, I can't count the number of times I've been stumped by cases where it just doesn't behave the way a "real" browser would.

The biggest gotcha I've encountered has been testing third-party OAuth login flows. Social login buttons, like those for Google+ or LinkedIn, require the user to click through permissions-granting pages with all sorts of bizarre security features. When we first began testing our social login flows, we quickly realized that Zombie was getting stuck in the middle of the login procedure. When we peeked at the source for these login pages, they contained measures to prevent the page from being loaded in an iFrame&mdash;called [framekillers](http://en.wikipedia.org/wiki/Framekiller)&mdash;and other obfuscated JavaScript snippets. It appeared that Zombie was collateral damage to these defense mechanisms.

Solving this problem is doable, but it requires some flexibility and a lot of trial-and-error. As a resource, I've set up a [Github repo](https://github.com/a-type/zombie-oauth-example) which demonstrates the overarching principles by implementing two example flows: Google and LinkedIn.

> ### Side Note: why test OAuth?
> Social logins are increasingly popular for web applications, and sometimes they are the only way to sign up. Implementing social login shouldn't keep you from being able to write meaningful and thorough integration tests, even in a headless browser. OAuth login flows also grant the application access to things like social profiles, and if your application uses this information, you should be testing against it. Unit tests are effective (where you mock a social login callback using a library like [Nock](https://github.com/pgte/nock)), but they can't give you the depth of coverage that pure integration tests can, with the assurance that every layer of your application gives the user the intended experience.

## Tip #1: Create test users
Since CAPTCHAs are fairly standard in social account signup pages, it's not like you could automate user creation anyways. Still, there are a few other things you should keep in mind when creating your test accounts:

 * Check the legal terms of the APIs for the social service you want to log in to. Some companies will specify conditions for creating developer test accounts, like [LinkedIn](https://developer.linkedin.com/legal/api-terms-of-use). Google+ has no restrictions on multiple accounts in its [terms of service](http://www.google.com/intl/en/policies/terms/), but it does recommend that you [use your real name](https://support.google.com/plus/answer/1228271?hl=en) if you are creating a profile. Be sure to carefully read the terms of use for the APIs you are using and ensure that you are operating within them.
 * Keep rate limits in mind when doing repeated automated testing. If you run into trouble, try using multiple accounts and swapping them out for different test suites.
 * Keep your account information in secure storage. We ended up storing our account details in S3 and rotating them out for different integration test runs.

## Tip #2: Pre-approve your app
This is probably the most important tool for integration testing with Zombie. Once you have your pre-configured accounts, go ahead and *run through your login flow in a normal browser*, logged in as each account. Authorize your app now, rather than trying to make Zombie do it. Your social account will remember the authorization. Particularly in Google's case, this will allow Zombie to skip the authorization page altogether, which is critical&mdash;it's the page which contains the framekiller and other security measures.

If you don't pre-approve your app in a real browser, you'll end up with results like this:

``` bash
  0 passing (19s)
  2 failing

  1) the google oauth login flow reaches the profile page:

      profile title
      + expected - actual

      +"My Profile Page"
      -"Request for Permission"

      at Context.<anonymous>

  2) the linkedin oauth login flow reaches the profile page:

      profile title
      + expected - actual

      +"My Profile Page"
      -"Authorize | LinkedIn"

      at Context.<anonymous>
```

... where Zombie gets busted by security measures in the OAuth login pages and can't proceed.

## Tip #3: Peek at the page
Just because your browser is headless, doesn't mean you can't get an idea of what's being displayed. With Zombie, you can use `browser.html()` to get a dump of the current page's HTML content. Use this to your advantage. My favorite addition to any integration test suite is a block of code which runs when a test has failed which will dump the contents of the page. So, when my first stab at the integration flow fails&mdash;and it usually will&mdash;I can see exactly what page it got stuck on, and whether it fits my assumptions. Using this technique was how we discovered the framekillers, and it helped at every step as we built the solution to them.

## Tip #4: User agent matters
When configuring Zombie, change its user agent to mimic a modern desktop browser. Google, for instance, will give warnings about unsupported browsers, which will interrupt the expected login flow. Be careful about your user agent string: indicating that you are on a mobile browser will also sometimes trigger unwanted behavior. Google's login flow will include a request to use device location for mobile clients, again creating unexpected interactions during your integration flow.

## Tip #5: Get creative
Even if you pre-approve your app, you still have to enter your username and password in the OAuth login flow. Sometimes, this isn't feasible&mdash;for instance, LinkedIn has its framekiller on that page, too. When we ran into this problem, we thought we might be unable to proceed, but we stepped back and reconsidered what we were trying to accomplish. We couldn't log in to LinkedIn via the OAuth flow, but what if we already had a LinkedIn session cookie in the browser? Experience showed that, with a cookie, the OAuth login flow would be skipped entirely! So, we tested various ways to log in to LinkedIn and get a session cookie which Zombie could handle, and ended up logging in to their mobile site (by spoofing a mobile user agent), getting the cookie, and then returning to log into our web app. You'll find a demonstration of this code in the [repo](https://github.com/a-type/zombie-oauth-example).

If you branch out to other social providers, like Facebook or Twitter, you may encounter similar anomalies. Not every OAuth login flow is the same. A little bit of flexibility and creative thinking can go a long way toward a solution.

## Check out the examples!
[This Github repo](https://github.com/a-type/zombie-oauth-example) contains examples of logging into an application with Google and LinkedIn. If you're interested in implementing Google or LinkedIn, go ahead and dig into the `/test/` folder. Even if you're using another social service, it may be worth taking a look if you're stuck. The code is MIT-licensed.