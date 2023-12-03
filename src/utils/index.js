const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const amqplib = require('amqplib');

const { APP_SECRET, MESSAGEBROKER_URL, EXCHANGE_NAME, QUEUE_NAME } = require('../config');

module.exports.generateSalt = async () => {
    return await bcrypt.genSalt();
};

module.exports.generatePassword = async (password, salt) => {
    return await bcrypt.hash(password, salt);
};

module.exports.validatePassword = async (enteredPassword, savedPassword, salt) => {

    return (await this.generatePassword(enteredPassword, salt)) === savedPassword;
};

module.exports.formattedData = (data) => {
    if (data) {
        return { data };
    } else {
        throw new Error('Data not found');
    }

};

module.exports.generateSignature = async (payload) => {
    try {
        return await jwt.sign(payload, APP_SECRET, { 'expiresIn': '1h' });
    } catch (error) {
        return error;
    }
};

module.exports.validateSignature = async (req) => {
    try {
        const signature = req.get('Authorization');

        const payload = await jwt.verify(signature.split(' ')[1], APP_SECRET);
        req.user = payload;
        return true;
    } catch (error) {
        return false;
    }
};

// Webhook (to be replaced by Message Broker)

// module.exports.PublishUserEvents = async (payload) => {

//     axios.post('http://user:3001/user/events', { payload });

//     console.log('Sending event to User service', payload);

// };

// module.exports.PublishOrderEvents = async (payload) => {

//     axios.post('http://order:3003/order/events', { payload });

//     console.log('Sending event to Order service', payload);
    
// };


// Message Broker 

// create channel
module.exports.CreateChannel = async () => {

    try {

        const connection = await amqplib.connect(MESSAGEBROKER_URL);
        const channel = await connection.createChannel();
        await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: false });

        return channel;
    
    } catch (error) {
        return error;
    }

};


// publish message
module.exports.PublishMessage = async (channel, binding_key, message) => {

    try {
        console.log('Start sending message to exchange: ', EXCHANGE_NAME);
        await channel.publish(EXCHANGE_NAME, binding_key, Buffer.from(message));
        console.log(`Message has been sent to binding_key: ${binding_key}, with content: ${message}`);

    } catch (error) {
        return error;
    }
};



// subscribe message

module.exports.SubscribeMessage = async (channel, service, binding_key) => {

    try {
        console.log('Product service subscribing...');

        const appQueue = await channel.assertQueue('QUEUE_NAME');

        channel.bindQueue(appQueue.queue, EXCHANGE_NAME, binding_key);

        channel.consume(appQueue.queue, data => {
            console.log('Receive data: ');
            console.log(data.content.toString());
            channel.ack(data);
        });

    } catch (error) {
        return error;
    }
};