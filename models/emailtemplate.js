'use strict';
module.exports = (sequelize, DataTypes) => {
  const emailtemplate = sequelize.define('emailtemplate', {
    title: DataTypes.STRING,
    slug: DataTypes.STRING,
    content: DataTypes.TEXT,
    content_arabic:DataTypes.TEXT,
    extracontent: DataTypes.TEXT,
    status: DataTypes.INTEGER
  }, {});
  emailtemplate.associate = function(models) {
    // associations can be defined here
  };
  return emailtemplate;
};

/**
* @swagger
* components:
*  schemas:
*   emailtemplate:
*    type: object
*    properties:
*     title:
*       type: STRING
*     slug:
*       type: STRING
*     content:
*       type: TEXT
*     content_arabic:
*       type: TEXT
*     extracontent:
*       type: TEXT
*     status:
*       type: INTEGER
*/