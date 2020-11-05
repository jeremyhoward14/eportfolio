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
    console.log(filekey)
    chai.request("https://circlespace-uploads.s3-ap-southeast-2.amazonaws.com/")
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
    // upload the image
    chai.request(app)
        .post("/files/" + projectname + "/upload")
        .set('x-auth-token', jwt)
        .attach('userFile', filename)
        .end((err, res) => {
            res.should.have.status(uploadStatus)
            // res.text should be the url: don't bother with URI encoding because these tests aren't what we're looking for
            // the .eql is a mess: basically when we upload the file, stored here as "media/filename", the test knows to go
            // to the media folder to grab the file, and so does aws, just calling the file "filename".
            // but, no one told this function, so we have to remove the "media/"
            // Also doesn't bother with .env config: nothing more permanent than a temporary solution
            res.should.have.property('text')
                .eql("https://circlespace-uploads.s3.ap-southeast-2.amazonaws.com/" 
                     + username + "/" + projectname + "/" + filename.replace('media/', ''))
            // verify that we can actually find the image on the internet
            verifyFileOnAWS(res.text, existsStatus, (err, res) => {
                cb(err, res)
            })
        })
}

/* delete a DP and then test that it deleted
 * @param deleteStatus: 200 for successful deletion, 400 for user does not have dp
 * @param existsStatus: 200 for file exists, 403 for file does not exist
 */
function testDeleteDP(username, jwt, deleteStatus, existsStatus, cb) {
    // upload the dp
    chai.request(app)
        .post("/profile/deleteDP")
        .set('x-auth-token', jwt)
        .end((err, res) => {
            res.should.have.status(deleteStatus)

            // verify that we can no longer find the image on AWS
            verifyFileOnAWS(username + "/dp", existsStatus, (err, res) => {
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


/* test the GET route for bios */
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

    
})


});


