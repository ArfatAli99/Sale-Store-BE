'use strict';
module.exports = (sequelize, DataTypes) => {
  const section_category_maps = sequelize.define('section_category_maps', {
    category_id: DataTypes.STRING,
    section_category_id: DataTypes.INTEGER,
    scope_id: DataTypes.INTEGER,
    section_no: DataTypes.FLOAT,
    description: DataTypes.TEXT,
    description_arabic: DataTypes.TEXT,
    make_or_equivelant: DataTypes.TEXT,
    make_or_equivelant_arabic: DataTypes.TEXT,
    is_active: DataTypes.INTEGER,
    is_deleted: DataTypes.INTEGER
  }, {});
  section_category_maps.associate = function(models) {
    // associations can be defined here
  };
  return section_category_maps;
};

/**
* @swagger
* components:
*  schemas:
*   section_category_maps:
*    type: object
*    properties:
*     category_id:
*       type: STRING
*     section_category_id:
*       type: INTEGER
*     scope_id:
*       type: INTEGER
*     section_no:
*       type: FLOAT
*     description:
*       type: TEXT
*     description_arabic:
*       type: TEXT
*     make_or_equivelant:
*       type: TEXT
*     make_or_equivelant_arabic:
*       type: TEXT
*     is_active:
*       type: INTEGER
*     is_deleted:
*       type: INTEGER
*/