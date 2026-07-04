const { connectDB, sequelize } = require('./config/database');
const User = require('./models/User');
const Listing = require('./models/Listing');

const initializeDatabase = async () => {
    try {
        await connectDB();

        await sequelize.sync({ force: true });
        console.log('All models were synchronized seccussfully!');

        const adminUser = await User.create({
            email: 'admin@example.com',
            password: 'Admin@123',
            fullName: 'Admin',
            role: 'admin'
        });

        console.log('Admin user created: ', adminUser.email);
    } catch (error) {
        console.error('Error initializing database: ', error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
};

initializeDatabase();