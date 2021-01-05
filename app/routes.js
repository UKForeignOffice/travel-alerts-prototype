
const express = require('express')
const router = express.Router()
const NotifyClient = require('notifications-node-client').NotifyClient,
  notify = new NotifyClient(process.env.NOTIFYAPIKEY);
const fullCountryList = require('./data/countries.json');

const fullCountryNames = Object.values(fullCountryList).map(country => country.item[0].name).sort();

// Add your routes here - above the module.exports line

router.use('/add_country', (req, res) => {
  const { countries = [], countryToAdd } = req.session.data;
  if (!countries.includes(countryToAdd)) {
    req.session.data.countries = [...countries, countryToAdd].sort();
  }
  req.session.data.availableCountries = fullCountryNames.filter(country => !req.session.data.countries.includes(country));
  res.redirect('/country');
});

router.post('/confirmation', (req, res) => {
  const { emailAddress, phoneNumber } = req.session.data;
  const options = {
    personalisation: {
      'countries': req.session.data.countries,
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
