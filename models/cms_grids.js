'use strict';
module.exports = (sequelize, DataTypes) => {
  const cms_grids = sequelize.define('cms_grids', {
    type: DataTypes.INTEGER,
    title: DataTypes.STRING,
    title_arabic:DataTypes.STRING,
    image: DataTypes.STRING,
    link: DataTypes.STRING,
    description: DataTypes.STRING,
    description_arabic:DataTypes.STRING,
    is_active: DataTypes.INTEGER,
    is_deleted: DataTypes.INTEGER
  }, {});
  cms_grids.associate = function(models) {
    // associations can be defined here
  };
  return cms_grids;
};


/**
* @swagger
* components:
*  schemas:
*   cms_grids:
*    type: object
*    properties:
*     type:
*       type: INTEGER
*     title:
*       type: STRING
*     title_arabic:
*       type: STRING
*     image:
*       type: STRING
*     link:
*       type: STRING
*     description:
*       type: STRING
*     description_arabic:
*       type: STRING
*     is_active:
*       type: INTEGER
*     is_deleted:
*       type: INTEGER
*/