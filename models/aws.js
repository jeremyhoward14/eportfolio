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

function uploadFile(filename, folderName) {
    fs.readFile(filename, (err, data) => {
        if (err) throw err;

        var fileKey = getFolderKey(folderName) + encodeURIComponent(filename);

        const params = {
            Bucket: process.env.AWS_BUCKET,
            Key: fileKey,
            Body: JSON.stringify(data, null, 2)
        };
        // s3.upload(params, function (s3Err, data) {
        //     if (s3Err) throw s3Err
        //     console.log(`File uploaded successfully at ${data.Location}`);
        // });

        var upload = new AWS.S3.ManagedUpload({params});

        var promise = upload.promise();

        promise.then(
            function (data) {
                console.log(`Successfully uploaded file: ${data.Location}`);
                return getFileURL(fileKey);
            },
            function (err) {
                return console.log("Error uploading file: " + err.message);
            }
        );
    });
};


function createFolder(folderName) {
    folderName = folderName.trim();
    if (!folderName) {
        console.log("Folder names must contain at least one non-space character.");
        return
    }
    if (folderName.includes('/')) {
        console.log("Folder names cannot contain slashes.");
        return
    }

    // here we don't use getFolderKey as that adds a '/'
    var folderKey = encodeURIComponent(folderName);

    s3.headObject({ Key: folderKey, Bucket: process.env.AWS_BUCKET }, function (err, data) {
        if (!err) {
            console.log("Folder already exists.");
            return
        }
        if (err.code !== "NotFound") {
            console.log("There was an error creating folder: " + err.message);
            return
        }
        s3.putObject({ Key: folderKey, Bucket: process.env.AWS_BUCKET }, function (err, data) {
            if (err) {
                console.log("There was an error creating folder: " + err.message);
                return
            }
            console.log("Successfully created folder: " + folderKey);
        });
    });
}


function deleteFile(fileName, folderName) {

    var fileKey = getFolderKey(folderName) + encodeURIComponent(fileName);

    s3.deleteObject({ Key: fileKey, Bucket: process.env.AWS_BUCKET }, function (err, data) {
        if (err) {
            console.log("There was an error deleting the file " + err.message);
            return
        }
        console.log("Successfully deleted file.");
    });
}


function getFolderKey(folderName = undefined) {
    if (folderName === undefined) {
        var folderKey = "tests/";
    } else {
        var folderKey = encodeURIComponent(folderName) + "/";
    }
    return folderKey;
}

function getFileURL(fileKey) {
    return "https://" + process.env.AWS_BUCKET + ".s3." + process.env.AWS_REGION + ".amazonaws.com/" + fileKey
}