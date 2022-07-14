'use strict';
module.exports = (sequelize, DataTypes) => {
  const contract_metas = sequelize.define('contract_metas', {
    contract_id: DataTypes.INTEGER,
    scope_id: DataTypes.INTEGER,
    supplied_by: DataTypes.INTEGER,
    installed_by: DataTypes.INTEGER,
    q_result: DataTypes.INTEGER,
    is_deleted: DataTypes.INTEGER
  }, {});
  contract_metas.associate = function(models) {
    // associations can be defined here
  };
  return contract_metas;
};

/**
* @swagger
* components:
*  schemas:
*   contract_metas:
*    type: object
*    properties:
*     contract_id:
*       type: INTEGER
*     scope_id:
*       type: INTEGER
*     supplied_by:
*       type: INTEGER
*     installed_by:
*       type: INTEGER
*     q_result:
*       type: INTEGER
*     is_deleted:
*       type: INTEGER
*/