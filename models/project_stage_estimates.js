'use strict';
module.exports = (sequelize, DataTypes) => {
  const project_stage_templates = sequelize.define('project_stage_estimates', {
    bid_id: DataTypes.INTEGER,
    stage_id: DataTypes.INTEGER,
    price_amount: DataTypes.DECIMAL(10,2),
    price_percentage: DataTypes.INTEGER,
    days: DataTypes.INTEGER,
    actual_pullback:DataTypes.FLOAT
  }, {});
  project_stage_templates.associate = function(models) {
    // associations can be defined here
  };
  return project_stage_templates;
};

/**
* @swagger
* components:
*  schemas:
*   project_stage_estimates:
*    type: object
*    properties:
*     bid_id:
*       type: INTEGER
*     stage_id:
*       type: INTEGER
*     price_amount:
*       type: DECIMAL(10,2)
*     price_percentage:
*       type: INTEGER
*     days:
*       type: INTEGER
*     actual_pullback:
*       type: FLOAT
*/