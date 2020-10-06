aws = require("../models/aws");
db  = require("../controllers/users");

/*
 * upload a file to the aws servers, then add it to the mongo db database
 * 
 * For now, is taking in a filename only while waiting for the file-type selection to be implemented
 */
const uploadFile = (req, res) => {
    var username = req.user.username;   // from jwt
    var filename = req.body.file;
    var projectname = req.params.projectid;

    aws.uploadFile(filename, username, projectname, (err, url) => {
        if (err) {
            throw err;
            // res.send(500).send("upload error");
            // return
        }

        // upload to Mongo
        // at the moment, projects haven't been set up so this can't do anything

        // var query = { username: username };
  
        // var updateDocument = {
        //   $push: {"projects.$[project].attachments": url}  // maybe addToSet should be used instead?
        // };
      
        // // choose only the array matching the desired project
        // var options = {
        //   arrayFilters: [{
        //     "project.title" : projectname
        //   }]
        // }
        // var result = /*await*/ Users.collection.updateOne(query, updateDocument, options);

        // // at this point, the URL should be added to the mongoDB
        // // res.send(url);
        res.send(200);
    })
};



/*
 * delete a file from the aws servers, then remove it from the mongo db database
 * 
 * Could this just be done with the URL instead?
 */
const deleteFile = (req, res) => {
    var username = req.user.username;   // from jwt
    var filename = req.body.filename;
    var projectname = req.params.projectid;

    aws.deleteFile(filename, username, projectname, (err) => {
        if (err) {
            res.send(500).send("error deleting file");
        } else {
            // at this point we should remove the link from the mongoDB
            res.send(200);
        }
    })
};




/* if I put the Mongo stuff back into functions, use this. Delete functionality is below */

// /* 
//  * update the attachments for a given user and add the given url
//  * res:
//  *  - username: user uploading
//  *  - projectTitle: title of the project
//  *  - url: the newly added link
//  * 
//  * https://docs.mongodb.com/drivers/node/fundamentals/crud/write-operations/embedded-arrays
//  */
// const addUserAttachment = (req, res) => {
//     // var query = { username: req.body.username, "projects.title": req.body.projectTitle};
//     // var updateDocument = {
//     //   $set: {"projects.$.attachments": null }
//     // }
//     // var result = await collection.updateOne(query, updateDocument);
  

  
//     //res.send(200) ?
//   };
  
  
//   /* 
//    * update the attachments for a given user and delete the given url
//    * res:
//    *  - username: user uploading
//    *  - projectTitle: title of the project
//    *  - url: the newly added link
//    * 
//    * https://docs.mongodb.com/drivers/node/fundamentals/crud/write-operations/embedded-arrays
//    */
//   const removeUserAttachment = (req, res) => {
//     var query = { username: req.body.username };
  
//     var updateDocument = {
//       $pull: {"projects.$[project].attachments": req.body.url}    // this could work but I have no idea
//     };
  
//     // choose only the array matching the desired project
//     var options = {
//       arrayFilters: [{
//         "project.title" : req.body.projectTitle
//       }]
//     }
//     var result = /*await*/ Users.collection.updateOne(query, updateDocument, options);
  
//     // OR
  
//     // https://stackoverflow.com/questions/55738068/remove-element-in-array-by-value-mongodb-nodejs
//     //  but I think that deletes the attachments array or something?
//     // Users.collection.updateOne(
//     //   { username: req.body.username }, 
//     //   { $pull: 
//     //     { projects: 
//     //       { attachments: req.body.url }
//     //     }
//     //   }
//     // );
  
//     //res.send(200) ?
//   };
  

module.exports = {
    uploadFile,
    deleteFile,
}