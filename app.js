import async from 'async';
import parse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { sendSms, logToS3 } from './helper.js';
import chalk from 'chalk';

const inputFile = path.join(__dirname, 'sample.csv');

function transformName(line, cb) {
  const fullName = `${line[0]} ${line[1]}`;
  const dataObj = {
    full_name: fullName,
    first_name: line[0],
    last_name: line[1],
    company_name: line[2],
    address: line[3],
    city: line[4],
    country: line[5],
    state: line[6],
    zip: line[7],
    phone1: line[8],
    phone2: line[9],
    email: line[10],
    web: line[11]
  };
  cb(dataObj);
}

const parser = parse({ delimiter: ',' }, (err, data) => {
  async.eachSeries(data, (line, callback) => {
    const obj = {
      data: {},
      status: {},
      message: '',
      log: ''
    };
    transformName(line, (dataObj) => {
      obj.data = dataObj;
      sendSms(obj, (error, resp) => {
        if (error) {
          obj.status = 400;
          obj.message = 'error sending sms';
        } else {
          obj.status = resp.status;
          obj.message = resp.message;
        }
        if (line[0] !== 'first_name') {
          logToS3(obj, (errS3, log) => {
            if (errS3) {
              obj.log = 'Log to s3 Failed';
              console.log(chalk.bold.red(errS3));
            } else {
              obj.log = 'Log to s3 Success';
              console.log(obj);
              console.log(chalk.green(obj.log));
            }
            callback();
          });
        } else {
          callback();
        }
      });
    });
  });
});
fs.createReadStream(inputFile).pipe(parser);
