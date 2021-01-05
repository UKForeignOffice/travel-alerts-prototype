
const express = require('express')
const router = express.Router()
const NotifyClient = require('notifications-node-client').NotifyClient,
  notify = new NotifyClient(process.env.NOTIFYAPIKEY);

// Add your routes here - above the module.exports line

router.post('/confirmation', (req, res) => {
  const { emailAddress, phoneNumber } = req.session.data;
  const options = {
    personalisation: {
      'country': req.session.data.country,
      'first name': req.session.data.firstName
    }
  };

  if (emailAddress) {
    notify.sendEmail(
      // this long string is the template ID, copy it from the template
      // page in GOV.UK Notify. It’s not a secret so it’s fine to put it
      // in your code.
      '349ec5ea-b7b5-4401-8a6e-3293aef13818',
      // `emailAddress` here needs to match the name of the form field in
      // your HTML page
      req.session.data.emailAddress,
      options
    );
  }
  if (phoneNumber) {
    notify.sendSms(
      'f8ff65b3-d33b-4649-bfe4-f19500f25c4a',
      req.session.data.phoneNumber,
      options
    )
  }

  // This is the URL the users will be redirected to once the email
  // has been sent
  res.redirect('/confirmation');
});

module.exports = router
