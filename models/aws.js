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

function uploadFile(filename, folderName = undefined) {
    fs.readFile(filename, (err, data) => {
        if (err) throw err;

        if (folderName === undefined) {
            var folderKey = "tests/";
        } else {
            var folderKey = encodeURIComponent(folderName) + "/";
        }

        const params = {
            Bucket: process.env.AWS_BUCKET,
            Key: folderKey + filename,
            Body: JSON.stringify(data, null, 2)
        };
        s3.upload(params, function(s3Err, data) {
            if (s3Err) throw s3Err
            console.log(`File uploaded successfully at ${data.Location}`);
        });
    });
};


function createFolder(folder) {
    folder = folder.trim();
    if (!folder) {
      console.log("Folder names must contain at least one non-space character.");
      return 
    }
    if (folder.includes('/')) {
      console.log("Folder names cannot contain slashes.");
      return 
    }
    var folderKey = encodeURIComponent(folder);

    s3.headObject({ Key: folderKey, Bucket: process.env.AWS_BUCKET }, function(err, data) {
      if (!err) {
        console.log("Folder already exists.");
        return 
      }
      if (err.code !== "NotFound") {
        console.log("There was an error creating your folder: " + err.message);
        return 
      }
      s3.putObject({ Key: folderKey, Bucket: process.env.AWS_BUCKET }, function(err, data) {
        if (err) {
          console.log("There was an error creating your folder: " + err.message);
          return 
        }
        console.log("Successfully created folder: " + folderKey);
      });
    });
}



createFolder("more_tests")

uploadFile("test3.pdf", "more_tests");

