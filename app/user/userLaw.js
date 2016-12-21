
var law = {
    privileges:{
        BO_REMOVE_USER:'bo_remove_user',
        BO_ACCESS:'bo_access',
        SHAREABLE_POST:'shareable_post',
        ARTICLE_POST:'article_post',
        CHAT_TALK:'chat_talk'
    },
    roles:{
        GOD:{
            name:'Dieu',
            defaultRights : ['bo_remove_user',
                             'bo_access',
                             'shareable_post',
                             'article_post',
                             'chat_talk']
        },
        ADMIN:{
            name:'Admin',
            defaultRights : ['bo_access',
                             'shareable_post',
                             'article_post',
                             'chat_talk']
        },
        WRITER:{
            name:'Publieur',
            defaultRights : ['shareable_post',
                             'article_post',
                             'chat_talk']
        },
        USER:{
            name:'Utilisateur',
            defaultRights : ['chat_talk']
        }
    }
}

function getDefaultPrivilegesFromRole(role){
    for (defaultRoles of law.roles){
        if(defaultRoles.defaultRights === role){
            return defaultRoles.defaultRights;
        }
    }
    return [];
}

module.exports = {
    law,
    getDefaultPrivilegesFromRole
}