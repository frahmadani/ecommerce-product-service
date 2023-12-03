const express = require('express');
const cors = require('cors');
const { products } = require('./api');
const ErrorHandler = require('./utils/error-handlers');


module.exports = async (app) => {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true, limit: '1mb' }));
    app.use(cors());
    

    // Product APIs
    products(app);

    app.use(ErrorHandler);
};