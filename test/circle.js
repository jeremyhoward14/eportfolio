let mongoose = require("mongoose");
let User = require('../models/users');
let userController = require('../controllers/users');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../app');
let should = chai.should(); 


chai.use(chaiHttp);
//Our parent block
describe('Circles', () => {
    beforeEach((done) => { //Before each test we empty the database
        userController.deleteAllUsers( (err) => {
            if (err != null) {
                console.log("error deleting database (code " + err + ")")
            }
            done();
        });
    });
/*
  * Test the /GET route for getting the circle from a specific user
  */
 describe('/GET users for /circle/{friend}', () => {
    it('it should get the circle from a specific user', (done) => {
      let registerUser = {
        "username": "regGetUserCircle",
        "email": "regGetUserCircle@gmail.com",
        "password": "regGetUserCircle",
        "firstname": "regGetUserCircle",
        "lastname": "regGetUserCircle"
      }
    chai.request(app)
        .post('/users/signup')
        .send(registerUser)
        .end((err, res) => {
          res.should.have.status(200);
  
          chai.request(app)
          .get('/circle/'+registerUser.username)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.be.eql(0);
            done();  
            });          
          });
    });

    it('it should fail to get a circle from an unregistered user', (done) => {
    chai.request(app)
    .get('/circle/'+'Nonexistentuser')
    .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property('msg').eql('Could not find username in database');
        done();  
        });          
      });
  });
/*
  * Test the /POST route for adding a friend to your circle
  */
  describe('/POST friend for /circle/add/{friend}', () => {
    it('it should get the circle from a specific user', (done) => {
      let registerUser = {
        "username": "reg1",
        "email": "reg1@gmail.com",
        "password": "reg1",
        "firstname": "reg1",
        "lastname": "reg1"
      }
    chai.request(app)
        .post('/users/signup')
        .send(registerUser)
        .end((err, res) => {
          res.should.have.status(200);
          let jwt = res.body.token;
          let registerUser2 = {
            "username": "reg2",
            "email": "reg2@gmail.com",
            "password": "reg2",
            "firstname": "reg2",
            "lastname": "reg2"
          }
          chai.request(app)
            .post('/users/signup')
            .send(registerUser2)
            .end((err, res) => {
                res.should.have.status(200);
                chai.request(app)
                    .post('/circle/add/'+registerUser2.username)
                    .set('x-auth-token', jwt)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.have.property('msg').eql("You have added " + registerUser2.username + " to your circle!");
                        done();  
                    }); 
            });         
        });
    });

    it('it should not add to circle if friend added is yourself', (done) => {
      let registerUser = {
        "username": "nofriendreg",
        "email": "nofriendreg@gmail.com",
        "password": "nofriendreg",
        "firstname": "nofriendreg",
        "lastname": "nofriendreg"
      }
    chai.request(app)
        .post('/users/signup')
        .send(registerUser)
        .end((err, res) => {
            res.should.have.status(200);
            let jwt = res.body.token;
            chai.request(app)
            .post('/circle/add/'+registerUser.username)
            .set('x-auth-token', jwt)
            .end((err, res) => {
                res.should.have.status(400);
                res.body.should.have.property('msg').eql('You can\'t add yourself you silly goose!');
                done();  
                });          
        });
    });    

    it('it should not add to circle if friend does not exist', (done) => {
        let registerUser = {
          "username": "nofriendreg2",
          "email": "nofriendreg2@gmail.com",
          "password": "nofriendreg2",
          "firstname": "nofriendreg2",
          "lastname": "nofriendreg2"
        }
      chai.request(app)
          .post('/users/signup')
          .send(registerUser)
          .end((err, res) => {
              res.should.have.status(200);
              let jwt = res.body.token;
              chai.request(app)
              .post('/circle/add/'+'nonregisteredUsser')
              .set('x-auth-token', jwt)
              .end((err, res) => {
                  res.should.have.status(404);
                  res.body.should.have.property('msg').eql('Could not find username in database');
                  done();  
                  });          
          });
      });

      it('it should fail to add friend because friend is already part of circle', (done) => {
        let registerUser = {
          "username": "asdf",
          "email": "asdf@gmail.com",
          "password": "asdf",
          "firstname": "asdf",
          "lastname": "asdf"
        }
      chai.request(app)
          .post('/users/signup')
          .send(registerUser)
          .end((err, res) => {
            res.should.have.status(200);
            let jwt = res.body.token;
            let registerUser2 = {
              "username": "yuio",
              "email": "yuio@gmail.com",
              "password": "yuio",
              "firstname": "yuio",
              "lastname": "yuio"
            }
            chai.request(app)
              .post('/users/signup')
              .send(registerUser2)
              .end((err, res) => {
                  res.should.have.status(200);
  
                  chai.request(app)
                  .post('/circle/add/'+registerUser2.username)
                  .set('x-auth-token', jwt)
                  .end((err, res) => {
                    res.should.have.status(200);
                    chai.request(app)
                    .post('/circle/add/'+registerUser2.username)
                    .set('x-auth-token', jwt)
                    .end((err, res) => {
                        res.should.have.status(400);
                        res.body.should.have.property('msg').eql('Friend is already part of your circle!');  
                        done();
                        }); 
                    
                    }); 
              });         
          });
      }); 
  });

/*
  * Test the /POST route for removing a friend from your circle
  */
 describe('/POST remove friend for /circle/remove/{friend}', () => {
    it('it should remove a friend from the user\'s circle' , (done) => {
      let registerUser = {
        "username": "manwithfriend",
        "email": "manwithfriend@gmail.com",
        "password": "manwithfriend",
        "firstname": "manwithfriend",
        "lastname": "manwithfriend"
      }
    chai.request(app)
        .post('/users/signup')
        .send(registerUser)
        .end((err, res) => {
          res.should.have.status(200);
          let jwt = res.body.token;

          let registerUser2 = {
            "username": "friendtoremove",
            "email": "friendtoremove@gmail.com",
            "password": "friendtoremove",
            "firstname": "friendtoremove",
            "lastname": "friendtoremove"
          }
          chai.request(app)
            .post('/users/signup')
            .send(registerUser2)
            .end((err, res) => {
                res.should.have.status(200);

                chai.request(app)
                .post('/circle/add/'+registerUser2.username)
                .set('x-auth-token', jwt)
                .end((err, res) => {
                  res.should.have.status(200);
                  chai.request(app)
                  .post('/circle/remove/'+registerUser2.username)
                  .set('x-auth-token', jwt)
                  .end((err, res) => {
                      res.should.have.status(200);
                      res.body.should.have.property('msg').eql("Successfully removed " + registerUser2.username + " from your circle!");  
                      done();
                  })
                 
                  }); 
            });         
        });
    });
    it('it should not remove from circle if friend does not exist', (done) => {
        let registerUser = {
          "username": "nofriendreg33",
          "email": "nofriendre33g@gmail.com",
          "password": "nofriendreg33",
          "firstname": "nofriendreg33",
          "lastname": "nofriendreg33"
        }
      chai.request(app)
          .post('/users/signup')
          .send(registerUser)
          .end((err, res) => {
              res.should.have.status(200);
              let jwt = res.body.token;

              chai.request(app)
              .post('/circle/remove/'+'nonregisteredUsser')
              .set('x-auth-token', jwt)
              .end((err, res) => {
                  res.should.have.status(404);
                  res.body.should.have.property('msg').eql('Could not find username in your circle');
                  done();  
                  });          
          });
      });
});

});
