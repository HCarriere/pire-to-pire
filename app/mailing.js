'use strict';

let Mailing = {
    sendMail: function(address, mailType, callback) {
        
        // plug sending mail API here
        switch(mailType) {
            case type.NOTIFICATION:
                break;
            case type.SUBSCRIBE:
                break;
            case type.NEWSLETTER:
                break;
        }
        callback({
            success: true,
            message: 'Ok !',
            address: address,
        });
    },
    type: {
        NOTIFICATION: 0,
        SUBSCRIBE: 1,
        NEWSLETTER: 2,
    },
};

module.exports = {
    Mailing,
};