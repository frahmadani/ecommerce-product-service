const { ProductRepository } = require('../database');
const { formattedData } = require('../utils');

class ProductService {

    constructor() {
        this.repository = new ProductRepository();
    }

    async createProduct(productData) {

        const productResult = await this.repository.CreateProduct(productData);
        return formattedData(productResult);
    }

    async getProducts() {

        const products = await this.repository.GetProducts();

        let categories = {};

        products.map(({ type }) => {
            categories[type] = type;
        });

        return formattedData({
            products,
            categories: Object.keys(categories)
        });
    }

    async getProductById(productId) {

        const product = await this.repository.FindProductById(productId);
        return formattedData(product);
    }

    async getProductsByCategory(category) {

        const products = await this.repository.FindByCategory(category);
        return formattedData(products);
    }

    async getProductPayload(userId, { productId, qty}, event) {

        const product = await this.repository.FindProductById(productId);

        if (product) {
            const payload = {
                event,
                data: {
                    userId,
                    product,
                    qty
                }
            };
            return formattedData(payload);
        }

        return formattedData({ error: 'No product found'});
    }

}

module.exports = ProductService;