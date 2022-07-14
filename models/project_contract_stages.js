'use strict';
module.exports = (sequelize, DataTypes) => {
  const project_contract_stages = sequelize.define('project_contract_stages', {
    contract_id: DataTypes.INTEGER,
    stage_id: DataTypes.INTEGER,
    price_amount: DataTypes.DECIMAL,
    price_percentage: DataTypes.INTEGER,
    days: DataTypes.INTEGER
  }, {});
  project_contract_stages.associate = function(models) {
    // associations can be defined here
  };
  return project_contract_stages;
};

/**
* @swagger
* components:
*  schemas:
*   project_contract_stages:
*    type: object
*    properties:
*     contract_id:
*       type: INTEGER
*     stage_id:
*       type: INTEGER
*     price_amount:
*       type: DECIMAL
*     price_percentage:
*       type: INTEGER
*     days:
*       type: INTEGER
*/