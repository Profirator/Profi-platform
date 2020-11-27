/* Copyright 2017 Apinf Oy
This file is covered by the EUPL license.
You may obtain a copy of the licence at
https://joinup.ec.europa.eu/community/eupl/og_page/european-union-public-licence-eupl-v11 */

// Meteor packages imports
import { Meteor } from 'meteor/meteor';

// Meteor contributed packages imports
import { TAPi18n } from 'meteor/tap:i18n';
import { Roles } from 'meteor/alanning:roles';

// Npm packages imports
import _ from 'lodash';

// Collection imports
import Settings from '/apinf_packages/settings/collection';
//import Users from '/apinf_packages/users/collection'; NOT EXISTING

// APInf imports
import { mailSettingsValid } from '/apinf_packages/core/helper_functions/validate_settings';

// Login attempt verifier to require verified email before login
export default function loginAttemptVerifier (parameters) {
  // Init user login allowed
  let userLoginAllowed = true;

  // Get reference to user object, to improve readability of later code
  const user = parameters.user;

  // Get users
  const settings = Settings.findOne();

  //If there is no settings allow login
  if(!settings){ return true;}
  console.log("one")
  console.log(settings)
  console.log("two")

  // If basic login button is hidden, do not allow login at all
  console.log("kolme")
  if (!settings.loginMethods.username_psw) {
    // Make sure user object exists
  console.log("nelja")
    if (user && user._id) {
  console.log("viisi")
      // Admin users are always allowed to log in
      if (Roles.userIsInRole(user._id, ['admin'])) {
  console.log("kuusi")
        userLoginAllowed = true;
      } else if (mailSettingsValid(settings)) {
  console.log("seitsemä")
        if (user && user.emails && (user.emails.length > 0)) {
          // Get user emails
  console.log("kasi")
          const emails = parameters.user.emails;

          // Check if any of user's emails are verified
          const verified = _.find(emails, (email) => { return email.verified; });

          // If no email is verified, throw an error
          if (!verified) {
            throw new Meteor.Error(500, TAPi18n.__('loginVerify_errorMessage'));
          }

          // If email is verified and parameters.allowed is true, user login is allowed
          if (verified && parameters.allowed) {
            userLoginAllowed = true;
          }
        } else {
          // User doesn't have registered email, so login not allowed
          userLoginAllowed = false;
        }
      } else {
        // Allow login without email verification if mail settings not configured correctly
        userLoginAllowed = true;
      }
    }
  }

  return userLoginAllowed;
}
