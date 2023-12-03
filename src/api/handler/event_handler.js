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

            let { payload } = JSON.parse(message.value);
            let data = payload?.data?.data;
            const result = await product.createOrder(data);

            if (result?.err) {
                console.log(ctx, result.err, 'Data not commit Kafka');
            } else {
                consumer.commit(true, async (err, data) => {
                    if (err) {
                        console.log(ctx, err, 'Data not commit Kafka');
                    }
                      console.log(ctx, data, 'Data Commit Kafka');
                });
            }
        } catch (error) {
              console.log(ctx, error, 'Data error');
        }
    });
};

const revertStock = async () => {
    const dataConsumer = {
        topic: 'ecommerce-service-revert-stock',
        groupId: 'ecommerce-product-service'
    };
    const consumer = new kafkaConsumer(dataConsumer);
    let ctx = 'revertStock';
    consumer.on('message', async (message) => {
        try {

            let { payload } = JSON.parse(message.value);
            let data = payload?.data;
            const result = await product.revertStock(data);

            if (result?.err) {
                console.log(ctx, result.err, 'Data not commit Kafka');
            } else {
                consumer.commit(true, async (err, data) => {
                    if (err) {
                        console.log(ctx, err, 'Data not commit Kafka');
                    }
                      console.log(ctx, data, 'Data Commit Kafka');
                });
            }
        } catch (error) {
              console.log(ctx, error, 'Data error');
        }
    });
};

module.exports = {
    addOrder,
    revertStock,
};
