'use strict';
module.exports = (sequelize, DataTypes) => {
  const contractor_metas = sequelize.define('contractor_metas', {
    key_name: DataTypes.STRING,
    key_value: DataTypes.STRING,
    group_name: DataTypes.STRING,
    contractor_id: DataTypes.INTEGER,
   
   
  }, {});
  contractor_metas.associate = function(models) {
    // associations can be defined here
  };
  return contractor_metas;
};

/**
* @swagger
* components:
*  schemas:
*   contractor_metas:
*    type: object
*    properties:
*     key_name:
*       type: STRING
*     key_value:
*       type: STRING
*     group_name:
*       type: STRING
*     contractor_id:
*       type: INTEGER
*/