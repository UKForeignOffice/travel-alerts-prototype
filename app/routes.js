const express = require('express')
const router = express.Router()
const NotifyClient = require('notifications-node-client').NotifyClient,
  notify = new NotifyClient(process.env.NOTIFYAPIKEY);
const saveSubscription = require('./save-subscription');
const defaultSessionData = require('./data/session-data-defaults');

router.post('/is-british-national', (req, res) => {
  if (req.session.data['is-british-national'] === 'yes') {
    return res.redirect('/country');
  }
  res.redirect('/not-british-national');
});

router.post('/check-what-type-of-alert', (req, res) => {
  const { typeofalert } = req.session.data;
  if(typeofalert.includes('Emergency or incident in the country') && typeofalert.length === 1) {
    res.redirect('/when_do_you_want_to');
  } else {
    res.redirect('/how_often_email');
  }

});

router.use('/add_country', (req, res) => {
  const { countries = [], countryToAdd, fullCountryNames } = req.session.data;
  if (!countries.includes(countryToAdd)) {
    req.session.data.countries = [...countries, countryToAdd].sort();
  }
  req.session.data.availableCountries = fullCountryNames.filter(country => !req.session.data.countries.includes(country));
  if (req.query.countryToAdd) {
    return res.redirect('/intro');
  }
  res.redirect('/country');
});

router.get('/', (req, res, next) => {
  req.session.data = {...defaultSessionData};
  next();
});

router.post('/confirmation', (req, res) => {
  const { emailAddress, phoneNumberSms, countries, channels } = req.session.data;
  const options = {
    personalisation: {
      countries
    }
  };

  if (channels.includes('email') && emailAddress) {
    notify.sendEmail(
      // this long string is the template ID, copy it from the template
      // page in GOV.UK Notify. It’s not a secret so it’s fine to put it
      // in your code.
      '349ec5ea-b7b5-4401-8a6e-3293aef13818',
      // `emailAddress` here needs to match the name of the form field in
      // your HTML page
      emailAddress,
      options
    );
    saveSubscription({ senderId: emailAddress, countries, channel: 'EMAIL' });
  }
  if (channels.includes('sms') && phoneNumberSms) {
    notify.sendSms(
      'f8ff65b3-d33b-4649-bfe4-f19500f25c4a',
      phoneNumberSms,
      options
    )
    saveSubscription({ senderId: phoneNumberSms, countries, channel: 'SMS' });
  }

  // This is the URL the users will be redirected to once the email
  // has been sent
  res.redirect('/confirmation');
});

module.exports = router

// DEPRECATED - FRIENDS AND FAMILY
// router.post('/is-check-your-answers', (req, res) => {
//   const { emailaddresses = [], emailaddressToAdd } = req.session.data;
//   if(emailaddressToAdd != '') {
//     if (!emailaddresses.includes(emailaddressToAdd)) {
//       req.session.data.emailaddresses = [...emailaddresses, emailaddressToAdd].sort();
//     }
//     res.redirect('/friends-and-family');
//   } else {
//     if (req.session.data['invite'] === 'yes') {
//       return res.redirect('/check-your-answers');
//     } else {
//       req.session.data.emailaddresses = []
//       return res.redirect('/check-your-answers');
//     }
//   }
// });
//
// router.use('/remove_emailaddress', (req, res) => {
//   const { emailaddresses = [] } = req.session.data;
//   const itemsToBeRemoved = req.query.email
//   const filteredArray = emailaddresses.filter(item => !itemsToBeRemoved.includes(item))
//   req.session.data.emailaddresses = filteredArray
//   res.redirect('/friends-and-family');
// });
//
// router.use('/add_emailaddress', (req, res) => {
//   const { emailaddresses = [], emailaddressToAdd } = req.session.data;
//   if (!emailaddresses.includes(emailaddressToAdd)) {
//     req.session.data.emailaddresses = [...emailaddresses, emailaddressToAdd].sort();
//   }
//   res.redirect('/friends-and-family');
// });
