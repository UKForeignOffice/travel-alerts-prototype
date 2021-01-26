const fetch = require('node-fetch');

module.exports = ({ senderId, countries, channel }) => {
  fetch(process.env.SEND_ALERT_APP_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({ senderId, countries, channel }),
    headers: {
      Authorization: `Bearer ${process.env.SEND_ALERT_APP_BEARER_TOKEN}`,
      'Content-Type': 'application/json'
    },
  })
    .then(() =>
      console.log(`${channel} subscription saved to ${process.env.SEND_ALERT_APP_ENDPOINT}`))
    .catch(err => console.error(err));
}
