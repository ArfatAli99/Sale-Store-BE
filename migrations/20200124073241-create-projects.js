'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('projects', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      project_location_id: {
        type: Sequelize.INTEGER
      },
      address: {
        type: Sequelize.STRING
      },
      project_use_type: {
        type: Sequelize.STRING
      },
      project_use_id: {
        type: Sequelize.INTEGER
      },
      project_level_id: {
        type: Sequelize.INTEGER
      },
      project_size: {
        type: Sequelize.FLOAT
      },
      is_user_owner: {
        type: Sequelize.TINYINT
      },
      status: {
        type: Sequelize.TINYINT
      },
      bid_closed_date:{

        type: Sequelize.DATE
      },
      project_total_bids:{
        type: Sequelize.INTEGER
      },
      is_active: {
        type: Sequelize.TINYINT
      },
      is_delete: {
        type: Sequelize.TINYINT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('projects');
  }
};