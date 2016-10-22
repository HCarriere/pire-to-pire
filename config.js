

module.exports = {
    database: {
        name: "mongodb://localhost/pire-to-pire",
        collections : {
            users:"user",
            articles:"article"
        }
    },
    session:{
        secret: "QeHjU?D542:8eE"
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