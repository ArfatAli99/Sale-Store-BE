'use strict';
module.exports = (sequelize, DataTypes) => {
  const article_topics = sequelize.define('article_topics', {
    name: DataTypes.STRING,
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    is_active: DataTypes.INTEGER,
    is_deleted: DataTypes.INTEGER
  }, {});
  article_topics.associate = function(models) {
    // associations can be defined here
  };
  return article_topics;
};

/**
* @swagger
* components:
*  schemas:
*   article_topics:
*    type: object
*    properties:
*     name:
*       type: STRING
*     title:
*       type: STRING
*     description:
*       type: STRING
*     is_active:
*       type: INTEGER
*     is_deleted:
*       type: INTEGER
*/