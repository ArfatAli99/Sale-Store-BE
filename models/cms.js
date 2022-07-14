'use strict';
module.exports = (sequelize, DataTypes) => {
  const cms = sequelize.define('cms', {
    name: DataTypes.STRING,
    name_arabic:DataTypes.STRING,
    slug: DataTypes.STRING,
    description: DataTypes.STRING,
    description_arabic:DataTypes.STRING,
    data: DataTypes.STRING,
    data_arabic:DataTypes.STRING,
    signature: DataTypes.TEXT,
    signature_arabic: DataTypes.TEXT,
    is_published: DataTypes.INTEGER,
    is_deleted: DataTypes.INTEGER
  }, {});
  cms.associate = function(models) {
    // associations can be defined here
  };
  return cms;
};


/**
* @swagger
* components:
*  schemas:
*   cms:
*    type: object
*    properties:
*     name:
*       type: STRING
*     name_arabic:
*       type: STRING
*     slug:
*       type: STRING
*     description:
*       type: STRING
*     description_arabic:
*       type: STRING
*     data:
*       type: STRING
*     data_arabic:
*       type: STRING
*     signature:
*       type: TEXT
*     signature_arabic:
*       type: TEXT
*     is_published:
*       type: INTEGER
*     is_deleted:
*       type: INTEGER
*/