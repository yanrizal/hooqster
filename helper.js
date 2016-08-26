import debug from 'debug';
import AWS from 'mock-aws-s3';
// const debug = require('debug')('hello-helper');
// const AWS = require('mock-aws-s3');

AWS.config.basePath = __dirname + '/buckets';
console.log(AWS.config.basePath)

const s3 = AWS.S3({ params: { Bucket: 'example' } });

function surprise(name) {
    //console.log(Math.floor(Math.random() * 100) + 1);
    if (Math.floor(Math.random() * 100) + 1 <= 50) {
        return new Error(`w00t!!! ${name} error`);
    }
}

// simulates sending sms
export const sendSms = (data, callback) => {
    setTimeout(() => {
        debug(`sending out sms: ${JSON.stringify(data)}`);
        //console.log(surprise('sending-sms'));
        callback(surprise('sending-sms'), {
            status: 200,
            message: 'OK',
        });
    }, 200);
}
// exports.sendSms = function(data, callback) {

//     setTimeout(() => {
//         debug(`sending out sms: ${JSON.stringify(data)}`);
//         callback(surprise('sending-sms'), {
//             status: 200,
//             message: 'OK',
//         });
//     }, 200);
// };

// simulates logging to s3

export const logToS3 = (data, callback) => {
    setTimeout(() => {
        debug(`putting data to S3: ${JSON.stringify(data)}`);
        s3.putObject({
            Key: `row/line-${new Date().valueOf()}.json`,
            Body: JSON.stringify(data),
        }, (err) => {
            callback(err ? err : surprise('log-to-s3'), { data, logged: true });
        });
    });
};