'use strict';
module.exports = (sequelize, DataTypes) => {
  const template_contractor_metas = sequelize.define('template_contractor_metas', {
    key_name: DataTypes.STRING,
    key_value: DataTypes.TEXT,
    group_name: DataTypes.STRING,
    contractor_id: DataTypes.INTEGER
  }, {});
  template_contractor_metas.associate = function(models) {
    // associations can be defined here
  };
  return template_contractor_metas;
};

/**
* @swagger
* components:
*  schemas:
*   template_contractor_metas:
*    type: object
*    properties:
*     key_name:
*       type: STRING
*     key_value:
*       type: TEXT
*     group_name:
*       type: STRING
*     contractor_id:
*       type: INTEGER
*/