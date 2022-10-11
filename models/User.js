// Requisita o Sequelize
const Sequelize = require('sequelize');

// Sequilize connection
const db = require('./db');

// Criar tabela dos Grupos
const User = db.define('users', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    group_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    user_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    castle_id: {
        type: Sequelize.STRING,
        allowNull: true
    },
    shield_status: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    war_time_start: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    war_time_end: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    infernal_time_start: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    infernal_time_end: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    orb_red_research_status: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    orb_red_pact_status: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    orb_red_troop_status: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    orb_yellow_research_status: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    orb_yellow_pact_status: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    orb_yellow_troop_status: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    dc_research_status: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    dc_pact_status: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    vigilant_research_status: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    vigilant_pact_status: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    core_research_status: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    core_pact_status: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    core_troop_status: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    
}, {
    timestamps: false
});

// Função criar ou atualizar quando alguma coluna for modificada
User.sync({alter: true});

// Exporta a model
module.exports = User;