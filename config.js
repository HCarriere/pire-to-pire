

module.exports = {
    database: {
        name: "mongodb://localhost/pire-to-pire",
        collections : {
            users:"user",
            articles:"article",
			chatMessage:"chatMessage"
        },
		verbose:false
    },
    session:{
        secret: "QeHjU?D542:8eE"
    },
	chat:{
		secret: "ZOjc1o+i25-jO.IE7*OIJ8-_8OIJ",
		limitPrevious: 50,
		port: 8080
	},
    server:{
        port:3000
    },
    upload:{
        image:{
            maxSize:67108864 //64 MB
        }
    }
}