const mongoose = require('mongoose');
const { MONGO_URI } = require('../config');

module.exports = async () => {
    try {
        await mongoose.connect( MONGO_URI);
        console.log('Connected to DB');
    } catch (error) {
        console.log('Error connecting to DB');
        console.log(error);
    }
};