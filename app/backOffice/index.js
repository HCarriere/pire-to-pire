var BO = require('./backOffice');
var stats = require('./stats');

module.exports = {
    getAsTable : BO.getAsTable,
    UserTableModel : BO.UserTableModel,
    ArticleTableModel : BO.ArticleTableModel,
    ShareableTableModel : BO.ShareableTableModel,
    NewsTableModel : BO.NewsTableModel,
    updateUserRank : BO.updateUserRank,
    deleteUser : BO.deleteUser,
    deleteArticle : BO.deleteArticle,
    deleteShareable : BO.deleteShareable,
    
    buildGraphs : stats.buildGraphs,
    getGraphsData : stats.getGraphsData,
}