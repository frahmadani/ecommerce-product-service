const ProductService = require('../services/product-service');
const isAuth = require('./middlewares/auth');
const kafkaProducer = require('../utils/kafka/kafka_producer');
const logger = require('../utils/app-logger');


module.exports = async (app) => {

    const service = new ProductService();

    app.post('/product/create', async (req, res, next) => {
        logger.info('API POST /product/create is called');
        const { name, desc, banner, type, unit, price, available, supplier } = req.body;

        const { data } = await service.createProduct({
            name, desc, banner, type, unit, price, available, supplier
        });

        return res.status(200).json({
            status: "success", message: "success",
            data,
        });
    });

    app.get('/product/:id', async (req, res, next) => {
        logger.info('API GET /product/:id is called');
        const productId = req.params.id;

        try {
            const { data } = await service.getProductById(productId);
            return res.status(200).json({
                status: "success", message: "success",
                data,
            });
        } catch (err) {
            return res.status(404).json({
                status: "error", message: err?.message
            });
        }
    });

    app.get('/product', async (req, res, next) => {
        logger.info('API GET /product is called');
        try {
            const { data } = await service.getProducts();
            return res.status(200).json({
                status: "success", message: "success",
                data,
            });
        } catch (error) {
            return res.status(404).json({
                status: "error", message: error?.message
            });
        }
    });

    app.get('/product/category/:type', async (req, res, next) => {
        logger.info('API GET /product/category/:type is called');
        const type = req.params.type;

        try {
            const { data } = await service.getProductsByCategory(type);
            return res.status(200).json({
                status: "success", message: "success",
                data,
            });
        } catch (error) {
            return res.status(404).json({
                status: "error", message: error?.message
            });
        }
    });

    app.put('/product/cart', isAuth, async (req, res, next) => {
        logger.info('API PUT /product/cart is called');

        const userId = req.user._id;
        const { _id, qty } = req.body;

        try {
            const { data } = await service.getProductPayload(userId, { productId: _id, qty: qty }, 'ADD_TO_CART');
            if (data?.err) {
                return res.status(data.code).json({
                    status: "error", message: data.err,
                })
            }

            const dataToKafka = {
                topic: 'ecommerce-service-add-to-cart',
                body: data,
                partition: 1,
                attributes: 1
            };

            kafkaProducer.send(dataToKafka);

            console.log('Data yg dikirim ke user service dan order service: ', dataToKafka);
            logger.info('Success sending message Add To Cart to kafka');

            console.log('Success sending message Add To Cart to kafka');

            const response = {
                product: data.data.product,
                qty: data.data.qty
            };

            return res.status(200).json({
                status: "success", message: "success",
                data: response,
            });

        } catch (error) {
            return res.status(500).json({
                status: "error", message: error?.message
            });
        }

    });

    app.delete('/product/cart/:id', isAuth, async (req, res, next) => {
        logger.info('API DELETE /product/cart/:id is called');

        const userId = req.user._id;
        const productId = req.params.id;

        try {
            const { data } = await service.getProductPayload(userId, { productId }, 'REMOVE_FROM_CART');

            const dataToKafka = {
                topic: 'ecommerce-service-remove-from-cart',
                body: data,
                partition: 1,
                attributes: 1
            };

            kafkaProducer.send(dataToKafka);

            console.log('Data yg dikirim ke user service dan order service: ', dataToKafka);

            logger.info('Success sending message Remove From Cart to kafka');
            console.log('Success sending message Remove From Cart to kafka');

            const response = {
                product: data.data.product,
                qty: data.data.qty
            };

            return res.status(200).json({
                status: "success", message: "success",
                data: response
            });

        } catch (error) {
            return res.status(500).json({
                status: "error", message: error
            });
        }

    });

};