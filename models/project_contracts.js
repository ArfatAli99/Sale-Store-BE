'use strict';
module.exports = (sequelize, DataTypes) => {
  const project_contracts = sequelize.define('project_contracts', {
    project_id: DataTypes.INTEGER,
    client_id: DataTypes.INTEGER,
    contractor_id: DataTypes.INTEGER,
    version_no: DataTypes.INTEGER,
    created_by: DataTypes.STRING,
    days: DataTypes.INTEGER,
    price: DataTypes.DECIMAL,
    cllient_acceptance: DataTypes.INTEGER,
    contractor_acceptance: DataTypes.INTEGER,
    last_change: DataTypes.INTEGER,
  }, {});
  project_contracts.associate = function(models) {
    // associations can be defined here
  };
  return project_contracts;
};

/**
* @swagger
* components:
*  schemas:
*   project_contracts:
*    type: object
*    properties:
*     project_id:
*       type: INTEGER
*     client_id:
*       type: INTEGER
*     contractor_id:
*       type: INTEGER
*     version_no:
*       type: INTEGER
*     created_by:
*       type: STRING
*     days:
*       type: INTEGER
*     price:
*       type: DECIMAL
*     cllient_acceptance:
*       type: INTEGER
*     contractor_acceptance:
*       type: INTEGER
*     last_change:
*       type: INTEGER
*/