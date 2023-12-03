const { ProductRepository } = require('../database');
const { formattedData } = require('../utils');

class ProductService {

    constructor(productRepo) {
        if (productRepo) {
            this.repository = productRepo;
        } else {
            this.repository = new ProductRepository();
        }
    }

    async createProduct(productData) {

        const productResult = await this.repository.CreateProduct(productData);
        return formattedData(productResult);
    }

    async getProducts() {

        const products = await this.repository.GetProducts();

        let categories = {};

        products.forEach(({ type }) => {
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

    async createOrder(bodydata) {
        const items = bodydata?.order?.items?.map((val, _idx) => {
            return {
                id: val?.product?._id,
                unit: val?.unit
            };

        });
        console.log("Items: ", items);
        let result = {};
        try {
            await this.repository.reduceUnits(items);
        } catch(e) {
            result.err = e;
        }
        return result;
    }

    async revertStock(itemList) {
        console.log("itemList:", itemList)
        for (let idunit of itemList.items) {
            idunit.unit = idunit.unit * -1 // to reverse the reduce
        }
        let result = {};
        try {
            result = await this.repository.reduceUnits(itemList.items)
        } catch(e) {
            result.err = e
        }
        return result;
    }

}

module.exports = ProductService;