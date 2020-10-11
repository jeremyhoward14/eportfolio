const aws = require("../models/aws");
const Users = require("../models/users");

/*
 * upload a file to the aws servers, then add it to the mongo db database
 * 
 * For now, is taking in a filename only while waiting for the file-type selection to be implemented
 */
const uploadFile = async (req, res) => {
    var username = req.user.username;   // from jwt
    var filename = req.body.file;
    var projectname = req.params.projectid;

    // first, check if the project exists
    Users.collection.findOne({username: username, "projects.title": { "$in": [projectname]} })
    .then( async (project) => {
        if (project) {
            aws.uploadFile(filename, username, projectname, async (err, url) => {
                if (err) { throw err; }
        
                // upload to Mongo
                var query = { username: username };
                var updateDocument = {
                    $addToSet: {"projects.$[project].attachments": {url: url}}      // addToSet means that a url will be unique
                };
                // choose only the array matching the desired project
                var options = {
                    arrayFilters: [{
                        "project.title" : projectname
                    }]
                }
        
                const user = await Users.collection.updateOne(query, updateDocument, options);
                if (user == null){
                    return res.status(500).json({msg:"Could not insert url into database."});
                } else {
                    return res.status(201).send(url);   // on success, send the url uploaded to
                }
            })
    } else {
        return res.status(404).json({msg:"Could not find specified project-id for user."});
    }})
    .catch(project => { return res.status(404).json({msg:"Could not find specified project-id for user."}); })
};



/*
 * delete a file from the aws servers, then remove it from the mongo db database
 * 
 * File comes in the form of its url as stored in mongo
 */
const deleteFile = async (req, res) => {
    var username = req.user.username;   // from jwt
    var fileurl = req.body.fileurl;
    var title = req.params.projectid;

    // should we check that the file exists for the user?
    // I think we can get away with not doing it, because aws will just throw and error instead
    aws.deleteFile(fileurl, (err) => {
        if (err) {
            res.status(500).json({msg: "error deleting file"});
        } else {
            // file successfully deleted, remove the link from mongoDB
            Users.findOne({"username": username, "projects.title": { "$in": [title]} })
            .then( (search) => {
                if (search) {     // remove it
                    // find the project with the title, and remove the url from the list
                    for (var p of search.projects) {
                        if (p.title === title) {
                            p.attachments = p.attachments.filter( el => el.url !== fileurl);
                        }
                    }

                    search.save()
                    res.status(200).json({msg:"Successfully deleted file"});
            
                } else {
                    // TODO this means that the file was deleted from aws but not mongo, what do we want to do??
                    return res.status(404).json({msg:"Could not find specified project-id for user."});
                }
            })
            .catch( (search) => es.status(404).json({msg:"Could not find specified project-id for user."}));
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
    deleteProjectFiles
}