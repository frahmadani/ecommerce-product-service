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

        logger.info('Success creating product');
        return res.status(201).json({status: 'success', message: 'Success creating product', data});
    });

    app.get('/product/:id', async (req, res, next) => {
        logger.info('API GET /product/:id is called');
        const productId = req.params.id;

        try {
            const { data } = await service.getProductById(productId);
            logger.info('Success retrieving product by id')
            return res.status(200).json({ status: 'success', message: 'Success retrieving product by id', data});
        } catch (err) {
            logger.error(`Failed retrieving product by id: ${err}`)
            return res.status(404).json({ status: 'error', message: 'Failed retrieving product by id' });
        }
    });

    app.get('/product', async (req, res, next) => {
        logger.info('API GET /product is called');
        try {
            const { data } = await service.getProducts();
            logger.info('Success retrieving products')
            return res.status(200).json({ status: 'success', message: 'Success retrieving products', data});
        } catch (error) {
            logger.error(`Failed retrieving products: ${error}`);
            return res.status(404).json({ status: 'error', message: 'Failed retrieving products' });
        }
    });

    app.get('/product/category/:type', async (req, res, next) => {
        logger.info('API GET /product/category/:type is called');
        const type = req.params.type;

        try {
            const { data } = await service.getProductsByCategory(type);
            logger.info('Success retrieving products by category');
            return res.status(200).json({status: 'success', message: 'Success retrieving products by category', data});
        } catch (error) {
            logger.error(`Failed retrieving products by category: ${error}`);
            return res.status(404).json({ status: 'error', message: 'Failed retrieving products by category', data: error });
        }
    });

    app.put('/product/cart', isAuth, async (req, res, next) => {
        logger.info('API PUT /product/cart is called');

        const userId = req.user._id;
        const { _id, qty } = req.body;

        try {
            const { data } = await service.getProductPayload(userId, { productId: _id, qty: qty }, 'ADD_TO_CART');

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

            logger.info('Success adding product to cart');
            return res.status(200).json({status: 'success', message: 'Success adding product to cart', data: response});

        } catch (error) {
            logger.error(`Failed adding product to cart: ${error}`);
        
            return res.status(500).json({ status: 'error', message: 'Failed adding product to cart', data: error });
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

            logger.info('Success removing product from cart');
            return res.status(200).json({status: 'success', message: 'Success removing product from cart', data: response});

        } catch (error) {
            logger.error(`Failed removing product from cart: ${error}`);
            return res.status(500).json({status: 'error', message: 'Failed removing product from cart', data: error });
        }
        
    });

};