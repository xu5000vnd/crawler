require('dotenv').load();
const _ = require('lodash');
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
    const browser = await puppeteer.launch({ headless: false });
    let linkIdStop = 0;
    const login = async () => {
      const page = await browser.newPage();
      await page.goto(keys.crawlerURLLogin);
      await page.waitFor(2000);
      if (await page.$('div.header__nav__item.nav__user')) {
        return true;
      }

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
      await page.goto(linkPackagePriceDetail);
      await page.waitFor(2000);
      await page.addScriptTag({ url: 'https://code.jquery.com/jquery-3.3.1.min.js' });
      const content = await page.evaluate(() => { //eslint-disable-line
        return {
          text: $('pre').text()
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
      }
      // await page.close();
      return prices;
    };

    const getPackageDetail = async (item) => {
      let data = {};
      const packageId = item.package_id;
      const linkPackageDetail = `https://klook.klktech.com/v1/usrcsrv/packages/${packageId}/schedules`;
      console.log('linkPackageDetail: ', linkPackageDetail);
      const page = await browser.newPage();
      await page.waitFor(3000);
      await page.goto(linkPackageDetail);
      await page.addScriptTag({ url: 'https://code.jquery.com/jquery-3.3.1.min.js' });
      console.log('addScriptTag');
      const content = await page.evaluate(() => { //eslint-disable-line
        return {
          text: $('pre').text()
        };
      });
      console.log('get Text');
      const packageDetail = JSON.parse(content.text);
      console.log(packageDetail.result[0].arrangement_id);
      if (packageDetail.success) {
        const prices = await getPackagePriceDetail(packageDetail.result[0].arrangement_id);
        const date = packageDetail.result[0].date;
        data = {
          prices,
          date,
          packageId,
          packageName: item.package_name
        };
      }

      // await page.close();
      return await data;
    };

    const getProductDetail = async (productId, i) => {
      const packagesDetail = [];
      const linkProductDetail = `https://klook.klktech.com/v1/agentwebserv/activity/${productId}/detail`;
      console.log('linkProductDetail: ', linkProductDetail);
      const page = await browser.newPage();
      await page.goto(linkProductDetail);
      await page.waitFor(2000);
      await page.addScriptTag({ url: 'https://code.jquery.com/jquery-3.3.1.min.js' });
      const content = await page.evaluate(() => { //eslint-disable-line
        return {
          text: $('pre').text()
        };
      });
      const productDetail = JSON.parse(content.text);
      if (productDetail.success) {
        _.each(productDetail.result.packages, async (item) => {
          const packageDetail = await getPackageDetail(item);
          packagesDetail.push(packageDetail);
        });
      } else {
        //login
        linkIdStop = i;
      }

      // await page.close();
      return packagesDetail;
    };

    //run Crawler
    if (await login()) {
      const mappings = await MappingModel.find({});
      if (mappings) {
        // for (let i = 0; i < mappings.length; i++) {
        //   if (linkIdStop) {
        //     i = linkIdStop;
        //   }

        //   const data = await getProductDetail(mappings[i].linkId, i);
        //   console.log('=====get product=====');
        //   console.log(data);
        // }
        await getProductDetail(199);
        console.log('getProductDetail');

      } else {
        console.log('Mapping Empty');
      }
    } else {
      console.log('login failed');
    }

    // await browser.close();
  }
})();
