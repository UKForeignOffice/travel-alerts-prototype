const fetch = require('node-fetch');

module.exports = ({ senderId, countries, channel, userRequestedEmergencyAlerts }) => {
  fetch(process.env.SEND_ALERT_APP_ENDPOINT_CONFIRM_SENDER_ID, {
    method: 'POST',
    body: JSON.stringify({ senderId, countries, channel, userRequestedEmergencyAlerts }),
    headers: {
      Authorization: `Bearer ${process.env.SEND_ALERT_APP_BEARER_TOKEN}`,
      'Content-Type': 'application/json'
    },
  })
    .then(res => {
      if (res.ok) {
        console.log(`${channel} confirmation requested - ${process.env.SEND_ALERT_APP_ENDPOINT_CONFIRM_SENDER_ID}`)
        return;
      }
      console.error(`${channel} confirmation failed - ${process.env.SEND_ALERT_APP_ENDPOINT_CONFIRM_SENDER_ID}`)
    })
    .catch(err => console.error(err));
}
