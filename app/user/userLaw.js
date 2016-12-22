
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
            defaultRights : [{privilege:'bo_remove_user'},
                             {privilege:'bo_access'},
                             {privilege:'shareable_post'},
                             {privilege:'article_post'},
                             {privilege:'chat_talk'}]
        },
        ADMIN:{
            name:'Admin',
            defaultRights : [{privilege:'bo_access'},
                             {privilege:'shareable_post'},
                             {privilege:'article_post'},
                             {privilege:'chat_talk'}]
        },
        WRITER:{
            name:'Publieur',
            defaultRights : [{privilege:'shareable_post'},
                             {privilege:'article_post'},
                             {privilege:'chat_talk'}]
        },
        USER:{
            name:'Utilisateur',
            defaultRights : [{privilege:'chat_talk'}]
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