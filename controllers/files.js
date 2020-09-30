aws = require("../models/aws");
db  = require("../models/users");

const uploadFile = (req, res) => {
    var filename = req.body.filename;
    var folerName = req.body.folderName;

    aws.uploadFile(filename, folderName, (url) => {
        if (url === undefined) {
            res.send(500).send("upload error");
        } else {
            res.send(url);          // does url get sent?
        }
    })
};

const deleteFile = (req, res) => {
    var filename = req.body.filename;
    var folerName = req.body.folderName;

    aws.deleteFile(filename, folderName, (err, data) => {
        if (url === undefined) {
            res.send(500).send("upload error");
        } else {
            res.send(url);          // does url get sent?
        }
    })
};

module.exports = {
    uploadFile,
    deleteFile
}