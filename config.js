

module.exports = {
    database: {
        //name:"mongodb://localhost/pire-to-pire",
        defaultAddress:{
            prefix:"mongodb",
            name:"localhost",
            database:"pire-to-pire"
        },
        collections : {
            users:"user",
            articles:"article",
			chatMessage:"chatMessage",
            shareables:"shareable",
			inbox:"message",
        },
		verbose:false,
		mongooseDebug:false,
		salt:"s84*--+489efHEiuhdUU"
    },
    session:{
        secret: "QeHjU?D542:8eE",
		csrfTimeExpire:3600000,
		csrfMaxTokens:50
    },
	chat:{
		secret: "ZOjc1o+i25-jO.IE7*OIJ8-_8OIJ",
		limitPrevious: 50,
		port:5000
	},
    server:{
        port:3000
    },
    upload:{
        image:{
            maxSize:67108864 //8 Mo
        },
        documents:{
            maxSize:671088640 //80 Mo
        }
    },
	limitDocuments:{
		default:50,
		search:50
	}
}