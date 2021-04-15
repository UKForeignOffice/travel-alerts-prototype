const express = require('express')
const router = express.Router()
const sendConfirmMessage = require('./send-confirm-message')
const saveSubscription = require('./save-subscription');
const defaultSessionData = require('./data/session-data-defaults');

router.use('/add_country', (req, res) => {
  const { countries = [], countryToAdd, fullCountryNames } = req.session.data;
  if (!countries.includes(countryToAdd)) {
    req.session.data.countries = [...countries, countryToAdd].sort();
  }
  req.session.data.availableCountries = fullCountryNames.filter(country => !req.session.data.countries.includes(country));
  if (req.query.countryToAdd) {
    return res.redirect(req.query.emergency ? '/emergency-alerts/intro' : '/intro');
  }
  res.redirect('/country');
});

router.get('/', (req, res, next) => {
  req.session.data = {...defaultSessionData};
  next();
});

router.post('/types-of-alert_submit', (req, res) => {
  const {  typeofalert } = req.session.data;
  const userRequestedTravelAdvice = typeofalert.includes('Travel advice')
  const userRequestedEmergencyAlerts = typeofalert.includes('Emergency alerts')
  if (userRequestedTravelAdvice) {
    res.redirect('/travel-updates-email')
    return
  }
  if (userRequestedEmergencyAlerts) {
    res.redirect('/choose-channels')
  }
})

router.post('/travel-updates-email-submit', (req, res) => {
  if (req.session.data.typeofalert.includes('Emergency alerts')) {
    res.redirect('/choose-channels')
    return
  }
  res.redirect('/end-date-for-alerts')
})

router.post('/confirmation', (req, res) => {
  const { emailAddress, phoneNumberSms, phoneNumberWhatsApp, countries, channels, typeofalert } = req.session.data;

  const userRequestedEmergencyAlerts = typeofalert.includes('Emergency alerts') ? '1' : '0'

  if (channels.includes('email') && emailAddress) {
    sendConfirmMessage({ senderId: emailAddress, countries, channel: 'EMAIL', userRequestedEmergencyAlerts })
  }
  if (channels.includes('sms') && phoneNumberSms) {
    sendConfirmMessage({ senderId: phoneNumberSms, countries, channel: 'SMS', userRequestedEmergencyAlerts })
  }
  if (channels.includes('whatsapp') && phoneNumberWhatsApp) {
    sendConfirmMessage({ senderId: phoneNumberWhatsApp, countries, channel: 'WHATSAPP', userRequestedEmergencyAlerts })
  }
  res.redirect('/confirmation');
});

router.get('/email-verified', (req, res, next) => {
  const { email, countryList } = req.query;
  saveSubscription({ senderId: email, countries: countryList.split(','), channel: 'EMAIL' });
  next()
})
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
