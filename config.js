

module.exports = {
    database: {
       // name: "mongodb://root:<t2...>@ds029575.mlab.com:29575/pire-to-pire",
        
        defaultAddress:{
            prefix:"mongodb",
            name:"localhost",
            database:"pire-to-pire"
        },
		//name:"mongodb://localhost/pire-to-pire",
        collections : {
            users:"user",
            articles:"article",
			chatMessage:"chatMessage",
            shareables:"shareable"
        },
		verbose:false,
		mongooseDebug:false
    },
    session:{
        secret: "QeHjU?D542:8eE"
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
            maxSize:67108864 //64 MB
        },
        documents:{
            maxSize:671088640 //640 MB
        }
    }
}