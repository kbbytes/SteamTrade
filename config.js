'use strict';

module.exports = {
    Global: {
       
        siteName: "vexar server trade bot",
    },
    Server: {
        serverPort: 8080,
    },
    Sql: {
        host: "localhost",
        database: "trade",
        username: "root",
        password: ""
    },
    DB: {
        prefix: "wp_",
        fetchCD: 3000,
        gatherCD: 5000
    },
    ORDER: {
        order_autocomplete: 1,
        update_database: 0
    },
    BOT: {
        username: '',
        password: '',
        shared_secret: '', 
        identity_secret: '',
        nickname: "Vexar's Bot", // bot display nickname
        bot_id: '', // bot user id
        ownerid: '' // steamid64
    },
    OFFER: {
        appid: 570, // dota 2
        contextid: 2,
        amount: 1,
        offer_msg: 'Trade offer has been send'
    },
    STEAMAPI: {
        steamapis: "", // put yours
        steamapi: "" // put yours
    }
};