const ProductService = require('../services/product-service');
const isAuth = require('./middlewares/auth');
const kafkaProducer = require('../utils/kafka/kafka_producer');


module.exports = async (app) => {

    const service = new ProductService();

    app.post('/product/create', async (req, res, next) => {
        const { name, desc, banner, type, unit, price, available, supplier } = req.body;

        const { data } = await service.createProduct({
            name, desc, banner, type, unit, price, available, supplier  
        });

        return res.json(data);
    });

    app.get('/product/:id', async (req, res, next) => {
        const productId = req.params.id;

        try {
            const { data } = await service.getProductById(productId);
            return res.status(200).json(data);
        } catch (err) {
            return res.status(404).json({ err });
        }
    });

    app.get('/product', async (req, res, next) => {
        try {
            const { data } = await service.getProducts();
            return res.status(200).json(data);
        } catch (error) {
            return res.status(404).json({ error });
        }
    });

    app.get('/product/category/:type', async (req, res, next) => {
        const type = req.params.type;

        try {
            const { data } = await service.getProductsByCategory(type);
            return res.json(data);
        } catch (error) {
            return res.status(404).json({ error });
        }
    });

    app.put('/product/cart', isAuth, async (req, res, next) => {

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

            await kafkaProducer.send(dataToKafka);

            console.log('Data yg dikirim ke user service dan order service: ', dataToKafka);

            console.log('Success sending message Add To Cart to kafka');
        
            const response = {
                product: data.data.product,
                qty: data.data.qty
            };

            return res.status(200).json(response);

        } catch (error) {
            return res.status(500).json({ error });
        }

    });

    app.delete('/product/cart/:id', isAuth, async (req, res, next) => {

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

            await kafkaProducer.send(dataToKafka);

            console.log('Data yg dikirim ke user service dan order service: ', dataToKafka);

            console.log('Success sending message Remove From Cart to kafka');
        
            const response = {
                product: data.data.product,
                qty: data.data.qty
            };

            return res.status(200).json(response);

        } catch (error) {
            return res.status(500).json({ error });
        }
        
    });

};