var schema = require('./schema')
var user = require('./user')

module.exports = {
    Schema : schema.Schema,
    getUserInfo: user.getUserInfo,
    updateUserInfo: user.updateUserInfo
}