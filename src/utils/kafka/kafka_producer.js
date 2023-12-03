const kafka = require('kafka-node');
// const logger = require('../../utils/logger');
const config = require('../../config/index');
const validate = require('validate.js');
const kafkaHost = config.kafka;
const ctx = 'kafka-producer';

const options = {
    kafkaHost: kafkaHost.broker
};

if(!validate.isEmpty(kafkaHost.username)){
    options.sasl = {
        mechanism: 'plain',
        username: kafkaHost.username,
        password: kafkaHost.password
    };
}

const client = new kafka.KafkaClient(options);
const producer = new kafka.HighLevelProducer(client);

producer.on('ready', () => {
    // logger.info(ctx, 'Kafka producer ready', 'kafkaSendProducer');
    console.log('Kafka producer ready');
});

producer.on('error', async (error) => {
    // logger.error(ctx, 'Kafka producer error', 'kafkaSendProducer', error);
    console.log('Kafka producer error');
});

const send = (data) => {
    const buffer = Buffer.from(JSON.stringify(data.body));
    const record = [
        {
            topic: data.topic,
            messages: buffer,
            attributes: data.attributes,
            partitionerType: data.partition
        }
    ];
    producer.send(record, (err) => {
        if (err) {
            console.log('Kafka producer error publishing to topic');
            // logger.error(ctx, 'Kafka producer error publishing to topic', 'kafkaSendProducer', { topic, err });
        } else {
            console.log('Kafka producer success publishing to topic');
            // logger.debug(ctx, 'Kafka producer success publishing to topic', 'kafkaSendProducer', topic);
        }
    });
};

module.exports = {
    send
};
