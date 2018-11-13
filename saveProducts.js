const mongoose = require('mongoose');
const keys = require('./config/keys');
const products = require('./output/crawlerdata.json');
require('./models/Product');

mongoose.connect(keys.mongoURI);
const ProductsModel = mongoose.model('products');

(async () => {
  for (let i = 0; i < products.length; i++) {
    let product = await ProductsModel.findOne({ id: products[i].id });
    if (product) {
      product.set({
        packages: products[i].packages,
        dateTime: products[i].dateTime
      });
    } else {
      product = new ProductsModel(products[i]);
    }
    await product.save();
  }
})();
