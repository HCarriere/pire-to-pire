

module.exports = {
    database: {
        name: "mongodb://root:t2B175233TD@ds029575.mlab.com:29575/pire-to-pire",
		//name:"mongodb://localhost/pire-to-pire",
        collections : {
            users:"user",
            articles:"article",
			chatMessage:"chatMessage"
        },
		verbose:true
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
        }
    }
}