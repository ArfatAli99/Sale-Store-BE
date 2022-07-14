'use strict';
module.exports = (sequelize, DataTypes) => {
  const project_bids = sequelize.define('project_bids', {
    project_id: DataTypes.INTEGER,
    contractor_id: DataTypes.INTEGER,
    days: DataTypes.INTEGER,
    price: DataTypes.DECIMAL,
    Structure_price:DataTypes.INTEGER,
    additional_price:DataTypes.INTEGER,
    is_draft: DataTypes.INTEGER,
    request_contact:DataTypes.INTEGER,
    status: DataTypes.INTEGER,
    last_change: DataTypes.INTEGER,
    
    
  }, {});
  project_bids.associate = function(models) {
    // associations can be defined here
  };
  return project_bids;
};

/**
* @swagger
* components:
*  schemas:
*   project_bids:
*    type: object
*    properties:
*     project_id:
*       type: INTEGER
*     contractor_id:
*       type: INTEGER
*     days:
*       type: INTEGER
*     price:
*       type: DECIMAL
*     Structure_price:
*       type: INTEGER
*     additional_price:
*       type: INTEGER
*     is_draft:
*       type: INTEGER
*     request_contact:
*       type: INTEGER
*     status:
*       type: INTEGER
*     last_change:
*       type: INTEGER
*/