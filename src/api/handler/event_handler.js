const kafkaConsumer = require('../../utils/kafka/kafka_consumer');
const Product = require('../../services/product-service');
const product = new Product();

const addOrder = async () => {
    const dataConsumer = {
        topic: 'ecommerce-service-create-order',
        groupId: 'ecommerce-product-service'
    };
    const consumer = new kafkaConsumer(dataConsumer);
    let ctx = 'addOrder';
    consumer.on('message', async (message) => {
        try {

            // const result = await order.createOrder(message); -> TO CHANGE, BELUM SELESAI

            console.log('Data diterima: ', message);

            console.log('Value: ', JSON.parse(message.value));
            // if (result.err) {
            //     // logger.log(ctx, result.err, 'Data not commit Kafka');
            // } else {
            //     consumer.commit(true, async (err, data) => {
            //         if (err) {
            //             // logger.log(ctx, err, 'Data not commit Kafka');
            //         }
            //         //   logger.log(ctx, data, 'Data Commit Kafka');
            //     });
            // }
        } catch (error) {
            //   logger.log(ctx, error, 'Data error');
        }
    });
};


module.exports = {
    addOrder
};
