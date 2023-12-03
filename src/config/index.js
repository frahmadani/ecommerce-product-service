const dotenv = require('dotenv');

dotenv.config();

if (process.env.NODE_ENV !== 'prod') {
    const configFile = `./.env.${process.env.NODE_ENV}`;
    dotenv.config({ path: configFile });
} else {
    dotenv.config();
}

module.exports = {
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,
    BASE_URL: process.env.BASE_URL,
    APP_SECRET: process.env.APP_SECRET,
    kafka: {
        broker: process.env.KAFKA_HOST,
        username: process.env.KAFKA_USERNAME,
        password: process.env.KAFKA_PASSWORD,
    },
};