const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const start = Date.now();
  const page = await browser.newPage();
  await page.goto('https://www.klook.com/vi/activity/523-peak-tram-3-in-1-combo-ticket-hong-kong/');
  await page.addScriptTag({ url: 'https://code.jquery.com/jquery-3.3.1.min.js' });
  await page.waitForSelector('.package .pkg_list>li .g_right button');
  await page.click('.package .pkg_list>li .g_right button');
  await page.waitFor(1000);
  await page.click('.package .pkg_list>li .package_select .j_pkg_date');
  await page.waitFor(1000);
  await page.click('#pkg_datepicker .datepicker-days th.next');
  await page.click('#pkg_datepicker .datepicker-days td.day');
  await page.waitFor(1000);
  await page.click('.package .pkg_list>li .package_select .j_pkg_time');
  await page.click('.package .pkg_list>li .package_select .j_pkg_time ul.time_dropdown>li');
  await page.waitFor(2000);
  await page.click('.package .pkg_list>li .package_select .quantity');


  const result = await page.evaluate(() => {
    let listEle = $('.package .pkg_list>li .package_select .unit_list ul li.j_price_item');
    return {
      title: $('title').text(),
      priceAdult: $(listEle[0]).data('price'),
      priceChild: $(listEle[1]).data('price'),
      priceElderly: $(listEle[2]).data('price'),
    }
  });
  console.log(result);
  console.log('Performance: ', (Date.now() - start)/1000);
  await browser.close();
})();