'use strict';
module.exports = (sequelize, DataTypes) => {
  const projects = sequelize.define('projects', {
    project_type:DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    name: DataTypes.STRING,
    unique_name:DataTypes.STRING,
    project_location: DataTypes.STRING,
    project_use_type: DataTypes.STRING,
    plot_area: DataTypes.DOUBLE,
    built_up_area: DataTypes.DOUBLE,
    basement: DataTypes.INTEGER,
    levelling_floor: DataTypes.INTEGER,
    gound_floor: DataTypes.INTEGER,
    additional_floors: DataTypes.INTEGER,
    pent_floor: DataTypes.INTEGER,
    is_user_owner: DataTypes.INTEGER,
    current_state: DataTypes.INTEGER,
    is_all_drawing : DataTypes.INTEGER,
    is_drawing_available_comment: DataTypes.STRING,
    land_serial_no: DataTypes.STRING,
    national_id:DataTypes.STRING,
    special_request:DataTypes.STRING, 
    bank_loan: DataTypes.INTEGER,
    status: DataTypes.TINYINT,
    bid_closed_date:DataTypes.DATE,
    project_total_bids: DataTypes.INTEGER,
    project_submit_date:DataTypes.DATE,
    is_active: DataTypes.TINYINT,
    is_delete: DataTypes.TINYINT
  }, {});
  projects.associate = function(models) {
    // associations can be defined here
  };
  return projects;
};

/**
* @swagger
* components:
*  schemas:
*   projects:
*    type: object
*    properties:
*     project_type:
*       type: INTEGER
*     user_id:
*       type: INTEGER
*     name:
*       type: STRING
*     unique_name:
*       type: STRING
*     project_location:
*       type: STRING
*     project_use_type:
*       type: STRING
*     plot_area:
*       type: DOUBLE
*     built_up_area:
*       type: DOUBLE
*     basement:
*       type: INTEGER
*     levelling_floor:
*       type: INTEGER
*     gound_floor:
*       type: INTEGER
*     additional_floors:
*       type: INTEGER
*     pent_floor:
*       type: INTEGER
*     is_user_owner:
*       type: INTEGER
*     current_state:
*       type: INTEGER
*     is_all_drawing:
*       type: INTEGER
*     is_drawing_available_comment:
*       type: STRING
*     land_serial_no:
*       type: STRING
*     national_id:
*       type: STRING
*     special_request:
*       type: STRING
*     bank_loan:
*       type: INTEGER
*     status:
*       type: TINYINT
*     bid_closed_date:
*       type: DATE
*     project_total_bids:
*       type: INTEGER
*     project_submit_date:
*       type: DATE
*     is_active:
*       type: TINYINT
*     is_delete:
*       type: TINYINT
*/