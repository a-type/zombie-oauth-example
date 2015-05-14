# Google

## 1: Create an account
Go through the normal Google account creation flow. Save your account's email address to the environment variable `ZOE_GOOGLE_EMAIL` and its password to `ZOE_GOOGLE_PASSWORD`.

## 2: Upgrade the account with a Google+ profile
This demo uses the Google+ APIs to retrieve the test user's full name. To do this, the test user needs a Google+ profile. If it doesn't have one, the login process will prompt the user to create one, which ruins the expected OAuth flow. To create a profile for your test account, visit [https://plus.google.com](https://plus.google.com).

## 3: Go through the OAuth login flow manually
This is the trick which makes everything possible. Visit the web app (your own deployed instance, or the one hosted at [http://zombie-oauth-example.herokuapp.com](http://zombie-oauth-example.herokuapp.com) as of this writing) and log in with Google. Accept the permissions of the app. Google will save this to your test profile, so that the next time you log in (in Zombie), you won't need to see the accept screen again. That's important, since the accept screen has automation-busting features which Zombie doesn't seem to handle well.

# LinkedIn

## 1: Create an account
Create a new test account in LinkedIn. I recommend using the email from the Google account. Save the account's email to the environment variable `ZOE_LINKEDIN_EMAIL` and its password to `ZOE_LINKEDIN_PASSWORD`. Be sure to check the [LinkedIn API Terms of Service](https://developer.linkedin.com/legal/api-terms-of-use), which has rules about test accounts. As of this writing, developers are allowed five test accounts.

## 2: Go through the OAuth login flow manually
Just like Google, you should go ahead and accept the permissions of the web app with your LinkedIn account.

# Running the Tests
To run the integration tests, run `npm test` or `grunt`. The target URL of the web app to test can be configured using the `ZOE_TARGET_URL` environment variable. It defaults to `http://zombie-oauth-example.herokuapp.com`.