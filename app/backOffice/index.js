var BO = require('./backOffice')

module.exports = {
    getAsTable : BO.getAsTable,
    UserTableModel : BO.UserTableModel,
    ArticleTableModel : BO.ArticleTableModel,
    ShareableTableModel : BO.ShareableTableModel,
    NewsTableModel : BO.NewsTableModel,
    updateUserRank : BO.updateUserRank,
    deleteUser : BO.deleteUser,
    deleteArticle : BO.deleteArticle,
    deleteShareable : BO.deleteShareable
}