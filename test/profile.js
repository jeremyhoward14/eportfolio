let mongoose = require("mongoose");
let Users = require('../models/users');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../app');
const { expect } = require("chai");
const verifyProjectExists = require("../middleware/verifyProjectExists");
let should = chai.should(); 

chai.use(chaiHttp);

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

/* for some reason we sometimes need to use logIn as opposed to signup, 
 * all you need to do is switch out the name if it doesn't work */
function logInUserAndTest(username, cb) {
    let user = {
        "email": username + "@email.com",
        "password": username + "password",
    }
    chai.request(app)
    .post('/users/login')
    .send(user)
    .end((err, res) => {
        // don't have to do the rest of the verification here because that's 
        // covered in users tests, just need to make sure it succeded
        res.should.have.status(200)
        cb(err, res)
    })

}


/* check if a file exists / doesn't exist on AWS S3 based on its filekey */
function verifyFileOnAWS(filekey, status, cb) {
    chai.request("https://circlespace-uploads.s3-ap-southeast-2.amazonaws.com/")
        .get(filekey)
        .end((err, res) => {
            res.should.have.status(status)
            cb(err, res)
        })
}



//Our parent block
describe('Profiles', () => {
    beforeEach((done) => { //Before each test we empty the database
        Users.deleteOne({}, (err) => {
           done();
        });
    });


/* test the GET route for bios */
describe('/GET bio for profile/bio/{username}', () => {
    it("it should sucessfully return a user's bio", (done) => {
        let newUser = "getBio";

        signUpUserAndTest(newUser, (err, res) => {
            chai.request(app)
                .get("/profile/bio/" + newUser)
                .end((err, res) => {
                    res.body.should.have.all.keys("socials", "category");
                    done()
                })
        })
    })

    it('it should not GET user if user is not in database', (done) => {
        let id = "notInDb";
        chai.request(app)
        .get('/profile/bio/' + id)
        .end((err, res) => {
            res.should.have.status(404);
            res.body.should.have.property('msg').eql('Could not find username in database.')
          done();
        });
      });
})


/* test the POST route name updates */

describe('/POST update bio for /profiles/name/update', () => {
    var newUser = "profileBioChangeNameSuccess";
    var validNewName = {
        firstname: "validFirstName",
        lastname: "validLastName"
    }

    it("it should allow a valid name change", (done) => {

        signUpUserAndTest(newUser, (err, res) => {
            let jwt = res.body.token;
            chai.request(app)
                .post("/profile/name/update")
                .set('x-auth-token', jwt)
                .send(validNewName)
                .end((err, res) => {
                    res.should.have.status(200)
                    done()
                })
            })
        })

    it("it should reject change to non-existant user", (done) => {
        let jwt = "notAValidJWT";

        chai.request(app)
            .post("/profile/name/update")
            .set('x-auth-token', jwt)
            .send(validNewName)
            .end((err, res) => {
                res.should.have.status(400)
                done()
            })
    })

    it("it should not allow a change if first name has length 0", (done) => {
        signUpUserAndTest("profileBioChangeNameFailureFirstNameLength", (err, res) => {
            let jwt = res.body.token;
            let newName = { 
                firstname: "",
                lastname: "validLastName"
            }
            chai.request(app)
                .post("/profile/name/update")
                .set('x-auth-token', jwt)
                .send(newName)
                .end((err, res) => {
                    res.should.have.status(400)
                    done()
                })
        })
    })

    it("it should not allow a change if last name has length 0", (done) => {
        signUpUserAndTest("profileBioChangeNameFailureLastNameLength", (err, res) => {
            let jwt = res.body.token;
            let newName = { 
                firstname: "validFirstName",
                lastname: ""
            }
            chai.request(app)
                .post("/profile/name/update")
                .set('x-auth-token', jwt)
                .send(newName)
                .end((err, res) => {
                    res.should.have.status(400)
                    done()
                })
        })
    })

    it("it should reject a change if one of the name fields is missing", (done) => {
        signUpUserAndTest("profileBioChangeNameFailureMissingField", (err, res) => {
            let jwt = res.body.token;
            let newName = { 
                firstname: "validFirstName"
                // no last name
            }
            chai.request(app)
                .post("/profile/name/update")
                .set('x-auth-token', jwt)
                .send(newName)
                .end((err, res) => {
                    res.should.have.status(400)
                    done()
                })
        })
    })


    })



/* test the POST route to upload DPs */
describe('/POST upload DP for /profiles/uploadDP', () => {
    it("it should successfully upload a DP", (done) => {
        signUpUserAndTest("profileUploadDPSuccess", (err, res) => {
            let jwt = res.body.token

            // upload the image
            chai.request(app)
                .post("/profile/uploadDP")
                .set('x-auth-token', jwt)
                .attach('userFile', 'media/profile pic sample 1.png')
                .end((err, res) => {
                    res.should.have.status(201)

                    // verify that we can actually find the image on the internet
                    verifyFileOnAWS("profileUploadDPSuccess/dp", 200, (err, res) => {
                        done()
                    })
                })
        })
    })

    // it("it should fail when uploading a pdf", () => {
    //     signUpUserAndTest("profileUploadDPFailureFileType", (err, res) => {
    //         let jwt = res.body.token

    //         chai.request(app)
    //             .post("/profile/uploadDP")
    //             .set('x-auth-token', jwt)
    //             .attach('userFile', 'te1.pdf')
    //             .end((err, res) => {
    //                 res.should.have.status(201)

    //                 // verify that we can actually find the image on the internet
    //                 verifyFileOnAWS("profileUploadDPFailureFileType/dp", 200, (err, res) => {
    //                     done()
    //                 })
    //             })

    //     })
    // })


    it("it should fail when a file is not provided", () => {
        let username = "profileUploadDPFailureNoFileProvided";
        signUpUserAndTest(username, (err, res) => {
            let jwt = res.body.token

            // upload the image
            chai.request(app)
                .post("/profile/uploadDP")
                .set('x-auth-token', jwt)
                .attach('userFile', '')
                .end((err, res) => {
                    res.should.have.status(400)

                    // make sure there's no file on AWS
                    verifyFileOnAWS(username + '/dp', 403, (err, res) => {
                        done()
                    })
                })
        })
    })

    it("it should allow overwriting an existing file", () => {
        let username = "profileUploadDPSuccessOverwriting";

        function testUploadDP(username, jwt, filename, cb) {
            // upload the image
            chai.request(app)
                .post("/profile/uploadDP")
                .set('x-auth-token', jwt)
                .attach('userFile', filename)
                .end((err, res) => {
                    res.should.have.status(201)

                    // verify that we can actually find the image on the internet
                    verifyFileOnAWS(username + "/dp", 200, (err, res) => {
                        cb(err, res)
                    })
                })
        }

        signUpUserAndTest(username, (err, res) => {
            let jwt = res.body.token
            testUploadDP(username, jwt, 'media/profile pic sample 1.png', (err, res) => {
                testUploadDP(username, jwt, 'media/profile pic sample 2.png', (err, res) => {
                    done()
                })
            })
        })
    })
})

});


