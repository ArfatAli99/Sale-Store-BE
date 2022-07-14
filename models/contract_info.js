'use strict';
module.exports = (sequelize, DataTypes) => {
  const contract_info = sequelize.define('contract_info', {
    key_name: DataTypes.STRING,
    key_value: DataTypes.STRING,
    project_id: DataTypes.INTEGER,
    full_name:DataTypes.STRING,
    client_sign_date:DataTypes.DATE,
    contractor_sign_date: DataTypes.DATE
  }, {});
  contract_info.associate = function(models) {
    // associations can be defined here
  };
  return contract_info;
};

/**
* @swagger
* components:
*  schemas:
*   contract_info:
*    type: object
*    properties:
*     key_name:
*       type: STRING
*     key_value:
*       type: STRING
*     project_id:
*       type: INTEGER
*     full_name:
*       type: STRING
*     client_sign_date:
*       type: DATE
*     contractor_sign_date:
*       type: DATE
*/