const mongoose = require('mongoose');
const keys = require('./config/keys');
const products = require('./output/crawlerdata.json');
require('./models/Product');

mongoose.connect(keys.mongoURI);
const ProductsModel = mongoose.model('products');

(async () => {
  for (let i = 0; i < products.length; i++) {
    const product = new ProductsModel(products[i]);
    await product.save();
  }
})();
