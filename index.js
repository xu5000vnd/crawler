const express = require('express');
const { exec } = require('child_process');
const Utils = require('./utils/utils');
const mongoose = require('mongoose');
const keys = require('./config/keys');
require('./models/Product');
require('./models/Mapping');
require('./models/Setting');
require('./models/Log');

mongoose.connect(keys.mongoURI);

const MappingModel = mongoose.model('mappings');
const ProductioModel = mongoose.model('products');
// const SettingModel = mongoose.model('settings');
// const LogModel = mongoose.model('logs');

const app = express();

const handleCallCrawler = (req, res, next) => { //eslint-disable-line
  if (req.headers.origin === 'https://singbui.com') {
    next();
  } else {
    const resAPI = Utils.resAPI();
    resAPI.error.message = 'forbidden page';
    res.send(resAPI);
  }
};

// Add headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});


app.get('/api/klook/posts/:postId', async (req, res) => {
  const postId = req.params.postId;
  const mapping = await MappingModel.findOne({ productId: postId });
  const resAPI = Utils.resAPI();
  if (mapping) {
    const activity = await ProductioModel.findOne({ id: mapping.activityId });
    if (activity) {
      resAPI.success = true;
      resAPI.result.push(activity);
      res.send(resAPI);
    } else {
      resAPI.error.message = 'Not found Activity ID';
      res.send(resAPI);
    }
  } else {
    resAPI.error.message = 'Not found Post ID';
    res.send(resAPI);
  }
});

//====Cronjob====
const CronJob = require('node-cron');
/*
* Seconds: 0-59
* Minutes: 0-59
* Hours: 0-23
* Day of Month: 1-31
* Months: 0-11 (Jan-Dec)
* Day of Week: 0-6 (Sun-Sat)
* set run once a week on Saturday (0 0 0 * * 6)
*/
// const job = CronJob.schedule('0 */5 * * * *',
//   () => {
//     console.log('Set run cmd once a week');
//     console.log(Date(Date.now()));
//     exec('node crawler.js', (err, res) => {
//       if (err) {
//         console.log(err);
//       }

//       console.log('===Finished cronjob crawler===');
//     });
//   },
//   {
//     scheduled: true
//   }
// );
// job.start();
//====Cronjob====

const PORT = process.env.PORT || 3000;
app.listen(PORT);
