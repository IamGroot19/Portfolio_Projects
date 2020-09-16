// moment package gives us date  &time
const moment = require('moment-timezone');
moment.tz.setZone
function formatMessage( username, text) {
    return {
        username,
        text,
        time: moment.tz("Asia/Kolkata").format('DD MMM YYYY, hh:mm a')  
    };
}

module.exports = formatMessage;