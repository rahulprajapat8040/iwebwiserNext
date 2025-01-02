const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: 'localhost',
    logging: false,
    dialect: 'mysql',
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

const connectToDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');

        // Use this once to rebuild tables, then change back to {alter: false}
        console.log('Database synced successfully');
    } catch (err) {
        console.error('Database connection error:', err);
    }
};

connectToDatabase();

module.exports = sequelize;

