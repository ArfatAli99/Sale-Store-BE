'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('site_settings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      otp_validity: {
        type: Sequelize.INTEGER
      },
      max_tender_submission_limit: {
        type: Sequelize.INTEGER
      },
      admin_contact: {
        type: Sequelize.STRING
      },
      admin_email: {
        type: Sequelize.STRING
      },
      facebook_link: {
        type: Sequelize.STRING
      },
      linkedin_link: {
        type: Sequelize.STRING
      },
      twitter_link: {
        type: Sequelize.STRING
      },
      instagram_link: {
        type: Sequelize.STRING
      },
      partner_text: {
        type: Sequelize.STRING
      },
      service_text: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        timestamps: false
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        timestamps: false
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('site_settings');
  }
};