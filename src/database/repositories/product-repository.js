const { APIError } = require('../../../../user/src/utils/app-errors');
const { Product } = require('../models');

class ProductRepository {

    async CreateProduct({ name, desc, banner, type, unit, price, available, supplier }) {

        try {
            const product = new Product({
                name, desc, banner, type, unit, price, available, supplier
            });

            const productResult = await product.save();
            return productResult;    

        } catch (error) {
            throw APIError('API Error', 500, 'Failed to create product');
        }
        

    }

    async GetProducts() {
        try {

            return await Product.find();

        } catch (error) {
            throw APIError('API Error', 500, 'Failed to retrieve products');
        }
    }

    async FindProductById(id) {
        try {
            return await Product.findById(id);

        } catch (error) {
            throw APIError('API Error', 500, 'Failed to retrieve product');
        }

    }

    async FindByCategory(category) {
        try {
            return await Product.find({ type: category });

        } catch (error) {
            throw APIError('API Error', 500, 'Failed to retrieve product');
        }
    }

}

module.exports = ProductRepository;