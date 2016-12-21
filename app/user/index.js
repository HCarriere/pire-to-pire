var schema = require('./schema')
var user = require('./user')
var law = require('./userLaw')

module.exports = {
    Schema : schema.Schema,
    getUserInfo: user.getUserInfo,
    updateUserInfo: user.updateUserInfo,
    updateUserProfilePicture: user.updateUserProfilePicture,
    updateUserPassword : user.updateUserPassword,
    getUserInfoByPseudo : user.getUserInfoByPseudo,
    getUserPrivileges : user.getUserPrivileges,
    listUsers : user.listUsers,
    law: law.law,
    getDefaultPrivilegesFromRole: law.getDefaultPrivilegesFromRole
}