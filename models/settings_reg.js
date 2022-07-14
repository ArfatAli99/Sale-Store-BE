'use strict';
module.exports = (sequelize, DataTypes) => {
  const settings_reg = sequelize.define('settings_reg', {
    reg_no: DataTypes.INTEGER,
    is_active: DataTypes.INTEGER
  }, {});
  settings_reg.associate = function(models) {
    // associations can be defined here
  };
  return settings_reg;
};


/**
* @swagger
* components:
*  schemas:
*   settings_reg:
*    type: object
*    properties:
*     reg_no:
*       type: INTEGER
*     is_active:
*       type: INTEGER
*/