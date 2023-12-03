const express = require('express');

const { PORT } = require('./config');
const { databaseConn } = require('./database');
const expressApp = require('./express-app');
const observer = require('./utils/observers');
const logger = require('./utils/app-logger');

const StartServer = async () => {

    const app = express();

    await databaseConn();

    observer.init();
    await expressApp(app);

    app.listen(PORT, () => {
        console.log(`Product service listening on port ${PORT}`);
        logger.info(`Product service listening on port ${PORT}`)
        
    })
        .on('error', (err) => {
            console.log(err);
        });
};

StartServer();