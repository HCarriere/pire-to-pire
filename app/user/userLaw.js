const const_privileges = {
    BO_REMOVE_USER:'bo_remove_user',
    BO_PROMOTE_USER:'bo_promote_user',
    BO_ACCESS:'bo_access',
	EDIT_DOCUMENT:'edit_document',
    SHAREABLE_POST:'shareable_post',
    ARTICLE_POST:'article_post',
    COMMENT_ARTICLE:'comment_article',
    CHAT_TALK:'chat_talk'
}

const law = {
    privileges:{
        BO_REMOVE_USER:const_privileges.BO_REMOVE_USER,
        BO_PROMOTE_USER:const_privileges.BO_PROMOTE_USER,
        BO_ACCESS:const_privileges.BO_ACCESS,
		EDIT_DOCUMENT:const_privileges.EDIT_DOCUMENT,
        SHAREABLE_POST:const_privileges.SHAREABLE_POST,
        ARTICLE_POST:const_privileges.ARTICLE_POST,
        COMMENT_ARTICLE:const_privileges.COMMENT_ARTICLE,
        CHAT_TALK:const_privileges.CHAT_TALK,
    },
    roles:{
        GOD:{
            name:'Dieu',
            defaultRights : [{privilege:const_privileges.BO_REMOVE_USER},
                             {privilege:const_privileges.BO_ACCESS},
                             {privilege:const_privileges.BO_PROMOTE_USER},
							 {privilege:const_privileges.EDIT_DOCUMENT},
                             {privilege:const_privileges.SHAREABLE_POST},
                             {privilege:const_privileges.ARTICLE_POST},
                             {privilege:const_privileges.COMMENT_ARTICLE},
                             {privilege:const_privileges.CHAT_TALK}]
        },
        ADMIN:{
            name:'Admin',
            defaultRights : [{privilege:const_privileges.BO_ACCESS},
                             {privilege:const_privileges.BO_PROMOTE_USER},
                             {privilege:const_privileges.EDIT_DOCUMENT},
                             {privilege:const_privileges.SHAREABLE_POST},
                             {privilege:const_privileges.ARTICLE_POST},
                             {privilege:const_privileges.COMMENT_ARTICLE},
                             {privilege:const_privileges.CHAT_TALK}]
        },
        WRITER:{
            name:'Publieur',
            defaultRights : [{privilege:const_privileges.SHAREABLE_POST},
                             {privilege:const_privileges.ARTICLE_POST},
                             {privilege:const_privileges.COMMENT_ARTICLE},
                             {privilege:const_privileges.CHAT_TALK}]
        },
        USER:{
            name:'Utilisateur',
            defaultRights : [{privilege:const_privileges.CHAT_TALK},
                             {privilege:const_privileges.COMMENT_ARTICLE}]
        }
    }
}

function getDefaultPrivilegesFromRole(stringRole){
    for (role in law.roles){
        if(law.roles.hasOwnProperty(role) && law.roles[role].name === stringRole){
            return law.roles[role].defaultRights;
        }
    }
    return [];
}

module.exports = {
    law,
    getDefaultPrivilegesFromRole
}