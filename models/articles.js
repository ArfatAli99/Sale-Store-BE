'use strict';
module.exports = (sequelize, DataTypes) => {
  const articles = sequelize.define('articles', {
    user_id: DataTypes.INTEGER,
    topic_id: DataTypes.INTEGER,
    title: DataTypes.STRING,
    writer: DataTypes.STRING,
    writer_name: DataTypes.STRING,
    data: DataTypes.STRING,
    is_draft: DataTypes.INTEGER,
    is_approved: DataTypes.INTEGER,
    is_deleted: DataTypes.INTEGER
  }, {});
  articles.associate = function(models) {
    // associations can be defined here
  };
  return articles;
};

/**
* @swagger
* components:
*  schemas:
*   articles:
*    type: object
*    properties:
*     user_id:
*       type: INTEGER
*     topic_id:
*       type: INTEGER
*     title:
*       type: STRING
*     writer:
*       type: STRING
*     writer_name:
*       type: STRING
*     data:
*       type: STRING
*     is_draft:
*       type: INTEGER
*     is_approved:
*       type: INTEGER
*     is_deleted:
*       type: INTEGER
*/