require('dotenv').config();
const fs = require('fs');
const AWS = require('aws-sdk');

// const SESConfig = {
//     accessKeyId: process.env.AWS_ACCESS_KEY,
//     accessSecretKey: process.env.AWS_SECRET_KEY,
//     region: 'ap-southeast-2'
// }

// AWS.config.update(SESConfig);

AWS.config = new AWS.Config();
AWS.config.accessKeyId = process.env.AWS_ACCESS_KEY;
AWS.config.secretAccessKey = process.env.AWS_SECRET_KEY;
AWS.config.region = 'ap-southeast-2';

// const s3 = new AWS.S3({
//     accessKeyID: process.env.AWS_ACCESS_KEY,
//     secretAccessKey: process.env.AWS_SECRET_KEY,
//     region: 'ap-southeast-2'
// });

const s3 = new AWS.S3();

const uploadFile = (filename) => {
    fs.readFile(filename, (err, data) => {
        if (err) throw err;
        const params = {
            Bucket: process.env.AWS_BUCKET,
            Key: 'tests/' + filename,
            Body: JSON.stringify(data, null, 2)
        };
        s3.upload(params, function(s3Err, data) {
            if (s3Err) throw s3Err
            console.log(`File uploaded successfully at ${data.Location}`);
        });
    });
};



uploadFile("test3.pdf");

