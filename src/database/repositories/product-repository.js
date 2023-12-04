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
            throw new APIError('API Error', 500, 'Failed to create product');
        }
        

    }

    async GetProducts() {
        try {

            return await Product.find();

        } catch (error) {
            throw new APIError('API Error', 500, 'Failed to retrieve products');
        }
    }

    async FindProductById(id, qty) {
        try {
            const product = await Product.findById(id)
            if (!product) {
                return { code: 404, err: "Not found" }
            }
            if (product.unit < qty) {
                return {
                    code: 400,
                    err: `Requested quantity (${qty}) more than stock (${product.unit})`
                }
            }
            return product

        } catch (error) {
            throw new APIError('API Error', 500, 'Failed to retrieve product');
        }

    }

    async FindByCategory(category) {
        try {
            return await Product.find({ type: category });

        } catch (error) {
            throw new APIError('API Error', 500, 'Failed to retrieve product');
        }
    }

    async reduceUnits(idAndUnitList) {
        console.log("idAndUnitList (reduceUnits):", idAndUnitList)
        try {
            let ops = [];
            for (let item of idAndUnitList) {
                ops.push(Product.findByIdAndUpdate(item.id, { "$inc": {
                    unit: -item.unit
                }}));
            }
            return await Promise.all(ops);
        } catch(e) {
            console.log(e)
            throw new APIError('API Error', 500, e);
        }
    }

}

module.exports = ProductRepository;