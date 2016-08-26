import async from 'async';
import parse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { sendSms, logToS3 } from './helper.js';
import chalk from 'chalk';

const inputFile = path.join(__dirname, 'sample.csv');

function transformName(line) {
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
  return dataObj;
}

let send = (data) => {
  return new Promise((resolve, reject) => {
    sendSms(data , (err, status) => {
      if (err) {
        reject(err)
      } else {
        resolve(status);
      }
    });
  });
}

let log = (data) => {
  return new Promise((resolve, reject) => {
    logToS3(data , (err, status) => {
       if (err) {
        reject(err)
      } else {
        resolve(status);
      }
    });
  });
}


const parser = parse({ delimiter: ',' }, (err, data) => {
  async.eachSeries(data, (line, callback) => {
    const obj = {
      data: {},
      status: {},
      message: ''
    };

    const transformObj = new Promise((resolve, reject) => {
      resolve(transformName(line));
    });

    const sendsms = transformObj.then((data) => {
      obj.data = data;
      return send(data);
    })

    const logtos3 = sendsms.then((status) => {
      obj.status = status.status;
      obj.message = status.message;
      if(line[0] !== 'first_name') {
        return log(obj);
      } else {
        callback();
      }
    }).catch((err) => {
      console.log(chalk.bold.red(err));
    })

    logtos3.then((status) => {
      console.log(obj);
      console.log(chalk.green('Log to s3 Success'));
      callback();
    }).catch((err) => {
      console.log(chalk.bold.red(err));
    })

  });
});
fs.createReadStream(inputFile).pipe(parser);
