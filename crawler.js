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
    const browser = await puppeteer.launch({ headless: true });
    const login = async () => {
      const page = await browser.newPage();
      await page.goto(keys.crawlerURLLogin);
      await page.type('#username', username);
      await page.type('#password', password);
      await page.click('form.signin-box button');
      await page.waitFor(2000);
      await page.waitForNavigation();

      const loggedIn = await page.evaluate(() => { //eslint-disable-line
        return {
          state: document.querySelector('div.header__nav__item.nav__user') ? true : false //eslint-disable-line
        };
      });
      page.close();

      return loggedIn.state;

      // await page.waitForSelector('.package .pkg_list>li .g_right button');
      // await page.click('.package .pkg_list>li .g_right button');
      // await page.waitFor(1000);
      // await page.click('.package .pkg_list>li .package_select .j_pkg_date');
      // await page.waitFor(1000);
      // await page.click('#pkg_datepicker .datepicker-days th.next');
      // await page.click('#pkg_datepicker .datepicker-days td.day');
      // await page.waitFor(1000);
      // await page.click('.package .pkg_list>li .package_select .j_pkg_time');
      // await page.click('.package .pkg_list>li .package_select .j_pkg_time ul.time_dropdown>li');
      // await page.waitFor(2000);
      // await page.click('.package .pkg_list>li .package_select .quantity');


      // const result = await page.evaluate(() => {
      //   let listEle = $('.package .pkg_list>li .package_select .unit_list ul li.j_price_item');
      //   return {
      //     title: $('title').text(),
      //     priceAdult: $(listEle[0]).data('price'),
      //     priceChild: $(listEle[1]).data('price'),
      //     priceElderly: $(listEle[2]).data('price'),
      //   }
      // });
    };

    const checkLogin = async (page) => {
      if (await page.$('div.header__nav__item.nav__user')) {
        return true;
      }

      return false;
    };

    let linkIdStop = 0;
    const crawlPrices = async ({ linkId }, i) => {
      const link = keys.crawlerURL + linkId;
      const linkPackages = `https://klook.klktech.com/v1/agentwebserv/activity/${linkId}/detail`;
//https://klook.klktech.com/v1/usrcsrv/activity/122/schedules
//for packages
//https://klook.klktech.com/v1/usrcsrv/packages/2765/schedules
//select day
//https://klook.klktech.com/v1/agentwebserv/arrangements/21160315/units
//https://klook.klktech.com/v1/agentwebserv/arrangements/21160864/units?_=1541325538337
      const page = await browser.newPage();
      await page.goto(link);
      // await page.addScriptTag({ url: 'https://code.jquery.com/jquery-3.3.1.min.js' });
      if (await checkLogin) {
        let packages = []; //eslint-disable-line
        await page.waitForResponse((response) => {
          if (response.url() === linkPackages) {
            console.log(response);
            if (response.body.success) {
              packages = response.body.success.packages;
            }
          }
        });
      } else {
        linkIdStop = i;
        login();
      }
      page.close();
    };

    if (await login) {
      const mappings = await MappingModel.find({});
      if (mappings) {
        for (let i = 0; i < mappings.length; i++) {
          if (linkIdStop) {
            i = linkIdStop;
          }

          crawlPrices(mappings[i], i);
        }
      } else {
        console.log('Mapping Empty');
      }
    } else {
      console.log('login failed');
    }
    // await browser.close();
  }
})();
