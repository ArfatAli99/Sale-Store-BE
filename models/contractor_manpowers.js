'use strict';
module.exports = (sequelize, DataTypes) => {
  const contractor_manpowers = sequelize.define('contractor_manpowers', {
    contractor_id: DataTypes.INTEGER,
    specalization: DataTypes.STRING,
    employee_type: DataTypes.INTEGER,
    employee_no_oman: DataTypes.INTEGER,
    employee_no_non_oman: DataTypes.INTEGER
  }, {});
  contractor_manpowers.associate = function(models) {
    // associations can be defined here
  };
  return contractor_manpowers;
};

/**
* @swagger
* components:
*  schemas:
*   contractor_manpowers:
*    type: object
*    properties:
*     contractor_id:
*       type: INTEGER
*     specalization:
*       type: STRING
*     employee_type:
*       type: INTEGER
*     employee_no_oman:
*       type: INTEGER
*     employee_no_non_oman:
*       type: INTEGER
*/