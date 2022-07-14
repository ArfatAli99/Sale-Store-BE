'use strict';
module.exports = (sequelize, DataTypes) => {
  const contract_banks = sequelize.define('contract_banks', {
    bank_name: DataTypes.STRING,
    account_holder_name: DataTypes.STRING,
    account_no: DataTypes.STRING,
    user_id:DataTypes.INTEGER,
    user_type	:DataTypes.STRING,

  }, {});
  contract_banks.associate = function(models) {
    // associations can be defined here
  };
  return contract_banks;
};

/**
* @swagger
* components:
*  schemas:
*   contract_banks:
*    type: object
*    properties:
*     bank_name:
*       type: STRING
*     account_holder_name:
*       type: STRING
*     account_no:
*       type: STRING
*     user_id:
*       type: INTEGER
*     user_type:
*       type: STRING
*/