const kafka = require('kafka-node');
const Consumer = kafka.ConsumerGroup;
const validate = require('validate.js');
const config = require('../../config');
// const logger = require('../../utils/logger');

class KafkaConsumer {
    constructor(data) {
        let options = {
            kafkaHost: config.kafka.broker,// connect directly to kafka broker (instantiates a KafkaClient)
            autoCommit: false, // enable retry
            fetchMaxBytes: 10 * 1024 * 1024,
            groupId: data.groupId,
            sessionTimeout: 15000,
            protocol: ['roundrobin'],
            fromOffset: 'latest', // default
            encoding: 'utf8',
            keyEncoding: 'utf8'
        };
        return new Consumer(options,data.topic);
    }
}

module.exports = KafkaConsumer;
