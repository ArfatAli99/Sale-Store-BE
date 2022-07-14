'use strict';
module.exports = (sequelize, DataTypes) => {
  const languages = sequelize.define('languages', {
    field_key: DataTypes.STRING,
    group_name: DataTypes.STRING,
    arabic: DataTypes.STRING,
    english: DataTypes.STRING,
    is_active: DataTypes.INTEGER
  }, {});
  languages.associate = function(models) {
    // associations can be defined here
  };
  return languages;
};

/**
* @swagger
* components:
*  schemas:
*   languages:
*    type: object
*    properties:
*     field_key:
*       type: STRING
*     group_name:
*       type: STRING
*     arabic:
*       type: STRING
*     english:
*       type: STRING
*     is_active:
*       type: INTEGER
*/