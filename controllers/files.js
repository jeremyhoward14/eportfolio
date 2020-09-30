aws = require("../models/aws");
db  = require("../models/users");

/*
 * upload a file to the aws servers, then add it to the mongo db database
 * 
 * For now, is taking in a filename only while waiting for the file-type selection to be implemented
 */
const uploadFile = (req, res) => {
    var username = req.body.username;
    var filename = req.body.file;
    var projectname = req.body.projectname;

    aws.uploadFile(filename, username, projectname, (url) => {
        if (url === undefined) {
            res.send(500).send("upload error");
        } else {
            res.send(url);          // does url get sent?
        }
    })
};



/*
 * delete a file from the aws servers, then remove it from the mongo db database
 * 
 * Could this just be done with the URL instead?
 */
const deleteFile = (req, res) => {
    var filename = req.body.filename;
    var username = req.body.username;
    var projectname = req.body.projectname;

    aws.deleteFile(filename, username, projectname, (err) => {
        if (err) {
            res.send(500).send("error deleting file");
        } else {
            res.send(200);
        }
    })
};

module.exports = {
    uploadFile,
    deleteFile
}