let mongoose = require("mongoose");
let Users = require('../models/users');
let userController = require('../controllers/users');
let fileController = require('../controllers/files');
let awsAdaptor = require('../models/aws');


//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../app');
const { expect } = require("chai");
let should = chai.should(); 

chai.use(chaiHttp);


// put some definitions of local files to try uploading
const textFile = "media/file.txt";
const noExtensionFile = "media/file";
const unknownExtensionFile = "media/file.extension.bad";
const pdfFile = "media/file.pdf";
const pngFile = "media/file.png";


/* register a user and the verify that worked, used for tests that create a new user first */
function signUpUserAndTest(username, cb) {
    let newUser = {
        "username": username,
        "email": username + "@email.com",
        "password": username + "password",
        "firstname": username + "FirstName",
        "lastname": username + "LastName"
    }
    chai.request(app)
        .post('/users/signup')
        .send(newUser)
        .end((err, res) => {
            // don't have to do the rest of the verification here because that's 
            // covered in users tests, just need to make sure it succeded
            res.should.have.status(200)
            cb(err, res)
        })
}


/* check if a file exists / doesn't exist on AWS S3 based on its filekey 
 * @param status: 200 for file exists, 403 for file does not exist
 */
function verifyFileOnAWS(filekey, status, cb) {
    chai.request("https://circlespace-uploads.s3-ap-southeast-2.amazonaws.com/")
        // this GET request isn't the most robust it could be w.r.t. .env values, but it's fine for now
        // want to chop off the front half and get the file key, stops us having to import awsAdaptor functions
        .get(filekey.replace("https://circlespace-uploads.s3.ap-southeast-2.amazonaws.com/", ""))
        .end((err, res) => {
            res.should.have.status(status)
            cb(err, res)
        })
}


/* create a new project based on the project name
 * @param projectname: String
 * @param jwt: jwt token for the user
 * @param cb: callback, taking (err, res)
 */
function testCreateProject(projectname, jwt, cb) {
    let newProject = {
        "title": projectname,
        "text": projectname + " description",
        "tags": []
      }
    chai.request(app)
        .post('/projects/create')
        .set('x-auth-token', jwt)
        .send(newProject)
        .end((err, res) => {
            res.should.have.status(201);    // only interested in successful upload here
            cb(err, res);
        })
}

/* upload a file and then test that it uploaded
 * AWS S3 filekey is created from the username and projectname
 *
 * @param username: username in database
 * @param projectname: project name in database
 * @param jwt: jwt token for the user
 * @param uploadStatus: 200 for successful upload, 400 for no file present, 500 for server error
 * @param status: 200 for file exists, 403 for file does not exist
 */
function testUploadFile(username, projectname, jwt, filename, uploadStatus, existsStatus, cb) {
    expect(uploadStatus).to.be.oneOf([201, 404, 500]);   // code must be valid 

    // upload the image
    chai.request(app)
        .post("/files/" + projectname + "/upload")
        .set('x-auth-token', jwt)
        .attach('userFile', filename)
        .end((err, res) => {
            res.should.have.status(uploadStatus)

            if (uploadStatus == 201) {
                // res.text should be the url: don't bother with URI encoding because these tests aren't what we're looking for
                // the .eql is a mess: basically when we upload the file, stored here as "media/filename", the test knows to go
                // to the media folder to grab the file, and so does aws, just calling the file "filename".
                // but, no one told this function, so we have to remove the "media/"
                // Also doesn't bother with .env config: nothing more permanent than a temporary solution
                res.should.have.property('text')
                    .eql("https://circlespace-uploads.s3.ap-southeast-2.amazonaws.com/" 
                        + username + "/" + projectname + "/" + encodeURIComponent(filename.replace('media/', '')))
            } else if (uploadStatus == 404) {
                res.should.have.property('text').eql('{"msg":"Could not find specified project-id for user."}')
            } else if (uploadStatus == 500) {
                res.should.have.property('text').eql('{"msg":"Could not insert url into database."}')
            } // no else, we've guaranteed values for uploadStatus

            // verify that we can actually find the image on the internet
            verifyFileOnAWS(res.text, existsStatus, (err, res) => {
                cb(err, res)
            })
        })
}

/* delete a File and then test that it deleted
 * @param username: username in database
 * @param projectname: project name in database
 * @param fileurl: url on aws where the file is stored
 * @param jwt: jwt token for the user
 * @param deleteStatus: 200 for successful deletion, 400 for validation error, 404 for could not find project-id for user
 * @param existsStatus: 200 for file exists, 403 for file does not exist
 */
function testDeleteFile(username, projectname, fileurl, jwt, deleteStatus, existsStatus, cb) {
    let urlObject = {"fileurl": fileurl}

    chai.request(app)
        .post("/files/" + projectname + "/delete")
        .set('x-auth-token', jwt)
        .send(urlObject)
        .end((err, res) => {
            res.should.have.status(deleteStatus)
            
            // check if we can find the image on AWS (can or can't based on status)
            verifyFileOnAWS(fileurl, existsStatus, (err, res) => {
                cb(err, res)
            })
        })
}



//Our parent block
describe('Files', () => {
    beforeEach((done) => { //Before each test we empty the database
        userController.deleteAllUsers( (err) => {
            if (err != null) {
                console.log("error deleting database (code " + err + ")")
            }
            done();
        });
    });


/* test the POST route for upload */
describe('/POST file for /files/{project-id}/upload', () => {
    it("it should sucessfully upload a file", (done) => {
        let newUser = "uploadFile";
        let newProject = newUser + "Project";

        signUpUserAndTest(newUser, (err, res) => {
            let jwt = res.body.token;
            testCreateProject(newProject, jwt, (err, res) => {
                testUploadFile(newUser, newProject, jwt, textFile, 201, 200, (err, res) => {
                    done()
                })
            })
        })
    })

    it("it should overwrite a file if it's given the same filename", (done) => {
        let newUser = "uploadFileOverwrite";
        let newProject = newUser + "Project";
        signUpUserAndTest(newUser, (err, res) => {
            let jwt = res.body.token;
            testCreateProject(newProject, jwt, (err, res) => {
                testUploadFile(newUser, newProject, jwt, textFile, 201, 200, (err, res) => {
                    testUploadFile(newUser, newProject, jwt, textFile, 201, 200, (err, res) => {
                        done()
                    })
                })
            })
        })
    })

    it("it should not upload a file if the project does not exist", (done) => {
        let newUser = "uploadFilenoPorjectFail";
        let newProject = newUser + "Project";
        signUpUserAndTest(newUser, (err, res) => {
            let jwt = res.body.token;
            testUploadFile(newUser, newProject, jwt, textFile, 404, 403, (err, res) => {
                done()
            })
        })
    })




    
})

describe('/POST upload and delete files of different types (upload and delete)', () => {

    it("it should sucessfully upload and delete a file withan unknown extension", (done) => {
        let newUser = "uploadFileUnkownExtension";
        let newProject = newUser + "Project";

        signUpUserAndTest(newUser, (err, res) => {
            let jwt = res.body.token;
            testCreateProject(newProject, jwt, (err, res) => {
                testUploadFile(newUser, newProject, jwt, unknownExtensionFile, 201, 200, (err, res) => {
                    let url = res.request.url;
                    testDeleteFile(newUser, newProject, url, jwt, 200, 403, (err, res) => {
                        done()
                    })
                })
            })
        })
    })

    it("it should sucessfully upload and delete a file with no extension", (done) => {
        let newUser = "uploadFileUnkownExt";
        let newProject = newUser + "Project";

        signUpUserAndTest(newUser, (err, res) => {
            let jwt = res.body.token;
            testCreateProject(newProject, jwt, (err, res) => {
                testUploadFile(newUser, newProject, jwt, noExtensionFile, 201, 200, (err, res) => {
                    let url = res.request.url;
                    testDeleteFile(newUser, newProject, url, jwt, 200, 403, (err, res) => {
                        done()
                    })
                })
            })
        })
    })

    it("it should sucessfully upload and delete a png file", (done) => {
        let newUser = "uploadFilePng";
        let newProject = newUser + "Project";

        signUpUserAndTest(newUser, (err, res) => {
            let jwt = res.body.token;
            testCreateProject(newProject, jwt, (err, res) => {
                testUploadFile(newUser, newProject, jwt, pngFile, 201, 200, (err, res) => {
                    let url = res.request.url;
                    testDeleteFile(newUser, newProject, url, jwt, 200, 403, (err, res) => {
                        done()
                    })
                })
            })
        })
    })

    it("it should sucessfully upload and delete a pdf file", (done) => {
        let newUser = "uploadFilePdf";
        let newProject = newUser + "Project";

        signUpUserAndTest(newUser, (err, res) => {
            let jwt = res.body.token;
            testCreateProject(newProject, jwt, (err, res) => {
                testUploadFile(newUser, newProject, jwt, pdfFile, 201, 200, (err, res) => {
                    let url = res.request.url;
                    testDeleteFile(newUser, newProject, url, jwt, 200, 403, (err, res) => {
                        done()
                    })
                })
            })
        })
    })

})



describe('/POST delete file for /files/{project-id}/delete', () => {
    it("it should sucessfully delete a file", (done) => {
        let newUser = "deleteFile";
        let newProject = newUser + "Project";

        signUpUserAndTest(newUser, (err, res) => {
            let jwt = res.body.token;
            testCreateProject(newProject, jwt, (err, res) => {
                testUploadFile(newUser, newProject, jwt, textFile, 201, 200, (err, res) => {
                    let url = res.request.url;
                    testDeleteFile(newUser, newProject, url, jwt, 200, 403, (err, res) => {
                        done()
                    })
                })
            })
        })
    })

    it("it should fail to delete a file if the project does not exist", (done) => {
        let newUser = "deleteFileFailNoProject";
        let newProject = newUser + "Project";

        signUpUserAndTest(newUser, (err, res) => {
            let jwt = res.body.token;
            let url = "https://circlespace-uploads.s3-ap-southeast-2.amazonaws.com/deleteFileFailNoProject/deleteFileFailNoProjectProject/file.txt";
            testDeleteFile(newUser, newProject, url, jwt, 404, 403, (err, res) => {
                done()
            })
        })
    })

    // aws gives us no indication that the deletion didn't work? 
    // it("it should fail to delete a file that doesn't exist", (done) => {
    //     let newUser = "deleteFileDoesNotExist";
    //     let newProject = newUser + "Project";

    //     signUpUserAndTest(newUser, (err, res) => {
    //         let jwt = res.body.token;
    //         testCreateProject(newProject, jwt, (err, res) => {
    //             console.log("here")
    //             let url = "https://circlespace-uploads.s3-ap-southeast-2.amazonaws.com/deleteFileDoesNotExist/deleteFileDoesNotExistProject/file.txt"
    //             testDeleteFile(newUser, newProject, url, jwt, 200, 403, (err, res) => {
    //                 done()
    //             })
    //         })
    //     })
    // })
})


describe('/POST delete all files for /projects/delete/{id}/', () => {
    it("it should sucessfully delete all files in a project when the project is deleted", (done) => {
        let newUser = "deleteProject";
        let newProject = newUser + "Project";

        signUpUserAndTest(newUser, (err, res) => {
            let jwt = res.body.token;
            testCreateProject(newProject, jwt, (err, res) => {

                // upload 3 files of different types, so it's also checking that
                testUploadFile(newUser, newProject, jwt, textFile, 201, 200, (err, res) => {
                    let url1 = res.request.url;
                    testUploadFile(newUser, newProject, jwt, pdfFile, 201, 200, (err, res) => {
                        let url2 = res.request.url;
                        testUploadFile(newUser, newProject, jwt, pngFile, 201, 200, (err, res) => {
                            let url3 = res.request.url;

                            // delete project
                            chai.request(app)
                            .post('/projects/delete/' + newProject)
                            .set('x-auth-token', jwt)
                            .end((err, res) => {
                                res.should.have.status(200);
                                res.body.should.have.property('msg').eql('Successfully deleted project.');
                              
                                // verify that all 3 files have been deleted
                                verifyFileOnAWS(url1, 403, (err, res) => {
                                    verifyFileOnAWS(url2, 403, (err, res) => {
                                        verifyFileOnAWS(url3, 403, (err, res) => {
                                            done()
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    })

})

});


