require('dotenv').load();
const _ = require('lodash');
const fs = require('fs');
const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const keys = require('./config/keys');
require('./models/User');
require('./models/Mapping');
require('./models/Product');

mongoose.connect(keys.mongoURI);
const User = mongoose.model('users');
const MappingModel = mongoose.model('mappings');
// const ProductsModel = mongoose.model('products');

(async () => {
  let username = '';
  let password = '';

  try {
    const user = await User.findOne({});
    username = user.username;
    password = user.password;
  } catch (e) {
    throw e;
  }

  if (username !== '' && password !== '') {
    const browser = await puppeteer.launch({ headless: true });
    const login = async () => {
      const page = await browser.newPage();
      await page.goto(keys.crawlerURLLogin);
      await page.waitFor(2000);
      await page.type('#username', username);
      await page.type('#password', password);
      await page.click('#remember');
      await page.click('form.signin-box button');
      await page.waitFor(2000);
      const loggedIn = await page.evaluate(() => { //eslint-disable-line
        return {
          state: document.querySelector('div.header__nav__item.nav__user') ? true : false //eslint-disable-line
        };
      });
      await page.close();
      return loggedIn.state;
    };

    const getPackagePriceDetail = async (arrangementId) => {
      const prices = [];
      const linkPackagePriceDetail = `https://klook.klktech.com/v1/agentwebserv/arrangements/${arrangementId}/units`;
      console.log('linkPackagePriceDetail: ', linkPackagePriceDetail);
      const page = await browser.newPage();
      await page.setExtraHTTPHeaders({
        'accept-language': 'en_US'
      });
      await page.goto(linkPackagePriceDetail);
      await page.waitFor(2000);
      const content = await page.evaluate(() => { //eslint-disable-line
        return {
          text: document.getElementsByTagName('pre')[0].innerText
        };
      });
      const packagePriceDetail = JSON.parse(content.text);
      if (packagePriceDetail.success) {
        _.each(packagePriceDetail.result.prices, price => {
          prices.push({
            market_price: price.market_price,
            price: price.price,
            name: price.name
          });
        });
        await page.close();
        return prices;
      }
    };

    const getPackageDetail = async (item) => {
      let data = {};
      const packageId = item.package_id;
      const linkPackageDetail = `https://klook.klktech.com/v1/usrcsrv/packages/${packageId}/schedules`;
      console.log('linkPackageDetail: ', linkPackageDetail);
      const page = await browser.newPage();
      await page.setExtraHTTPHeaders({
        'accept-language': 'en_US'
      });
      await page.goto(linkPackageDetail);
      const content = await page.evaluate(() => { //eslint-disable-line
        return {
          text: document.getElementsByTagName('pre')[0].innerText
        };
      });
      const packageDetail = JSON.parse(content.text);
      if (packageDetail.success) {
        const prices = await getPackagePriceDetail(packageDetail.result[0].arrangement_id);
        const date = packageDetail.result[0].date;
        data = {
          packageId,
          packageName: item.package_name,
          prices,
          date
        };
        await page.close();
        return data;
      }
    };

    const getProductDetail = async (productId) => {
      const packagesDetail = [];
      const linkProductDetail = `https://klook.klktech.com/v1/agentwebserv/activity/${productId}/detail`;
      console.log('linkProductDetail: ', linkProductDetail);
      const page = await browser.newPage();
      await page.setExtraHTTPHeaders({
        'accept-language': 'en_US'
      });
      await page.goto(linkProductDetail);
      const content = await page.evaluate(() => { //eslint-disable-line
        return {
          text: document.getElementsByTagName('pre')[0].innerText
        };
      });
      const productDetail = JSON.parse(content.text);
      if (productDetail.success) {
        for (let i = 0; i < productDetail.result.packages.length; i++) {
          const item = productDetail.result.packages[i];
          const packageDetail = await getPackageDetail(item);
          packagesDetail.push(packageDetail);
        }
        await page.close();
        return {
          productName: productDetail.result.title,
          packages: packagesDetail
        };
      }
    };

    const products = [];
    products.push('[');
    //run Crawler
    if (await login()) {
      const mappings = await MappingModel.find({});
      if (mappings) {
        for (let i = 0; i < mappings.length; i++) {
          const product = {};
          product.id = mappings[i].activityId;
          const packagesDetail = await getProductDetail(mappings[i].activityId);
          product.name = packagesDetail.productName;
          product.packages = packagesDetail.packages;
          if (i === mappings.length - 1) {
            products.push(`${JSON.stringify(product)}`);
          } else {
            products.push(`${JSON.stringify(product)},`);
          }
        }
      } else {
        console.log('Mapping Empty');
      }
    } else {
      console.log('login failed');
    }

    products.push(']');
    await browser.close();

    fs.writeFile('./output/crawlerdata.json', products.join('\n'), (err, res) => {
      if (err) {
        throw err;
      }
      console.log('---Finished write data -----');
    });
  }
})();
