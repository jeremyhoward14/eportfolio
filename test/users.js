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
describe('Users', () => {
    beforeEach((done) => { //Before each test we empty the database
        userController.deleteAllUsers( (status) => {
            if (status != 200) {
                console.log("error deleting database (code " + status + ")")
            }
            done();
        });
    });

  /*
  * Test the /POST route for registering
  */
 describe('/POST users/signup', () => {
  it('it should POST a user to the database', (done) => {
      let user = {
        "username": "registerme",
        "email": "registerme@gmail.com",
        "password": "string",
        "firstname": "string",
        "lastname": "string"
      }
    chai.request(app)
        .post('/users/signup')
        .send(user)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('token');
            res.body.should.have.property('user');
            res.body.user.should.have.property('id');
            res.body.user.should.have.property('username');
            res.body.user.should.have.property('email');
            res.body.user.should.have.property('firstname');
            res.body.user.should.have.property('lastname');
            res.body.user.should.have.property('picture').eql("");
            res.body.user.should.have.property('bio');
            res.body.user.bio.should.have.all.keys('socials', 'category', "text");
            res.body.user.bio.text.should.eql("");
          done();
        });
  });

  it('it should not POST a user with identical usernames to another in db', (done) => {
    let user = {
      "username": "sameUsername",
      "email": "asdf@gmail.com",
      "password": "asdf",
      "firstname": "asdf",
      "lastname": "asdf"
    }
    let user2 = {
      "username": "sameUsername",
      "email": "asdf2@gmail.com",
      "password": "asdf2",
      "firstname": "asdf2",
      "lastname": "asdf2"
    }
  chai.request(app)
      .post('/users/signup')
      .send(user)
      .end((err, res) => {
        res.should.have.status(200);

        chai.request(app)
        .post('/users/signup')
        .send(user2)
        .end((err, res) => {
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.should.have.property('msg').eql('Username already exists');
          done();
        });
      }) 

});

it('it should not POST a user with identical emails to another in db', (done) => {
  let user = {
    "username": "userA",
    "email": "sameEmail@gmail.com",
    "password": "string",
    "firstname": "string",
    "lastname": "string"
  }
  let user2 = {
    "username": "userB",
    "email": "sameEmail@gmail.com",
    "password": "string",
    "firstname": "string",
    "lastname": "string"
  }
chai.request(app)
    .post('/users/signup')
    .send(user)
    .end((err, res) => {
      res.should.have.status(200);

      chai.request(app)
      .post('/users/signup')
      .send(user2)
      .end((err, res) => {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('msg').eql('Email already exists');
        done();
      });
    }) 
});

it('it should not POST a user if email is not the right format', (done) => {
  let user = {
    "username": "test",
    "email": "incorrectformat",
    "password": "test5",
    "firstname": "test",
    "lastname": "test"
  }
chai.request(app)
    .post('/users/signup')
    .send(user)
    .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property('msg').eql("\"email\" must be a valid email");
      done();
    });
});

});

/*
  * Test the /POST route for logging in
  */
 describe('/POST users for users/login', () => {
  it('it should successfully POST user for logging in', (done) => {
    let registerUser = {
      "username": "reg",
      "email": "reg@gmail.com",
      "password": "reg",
      "firstname": "reg",
      "lastname": "reg"
    }
    let loginUser = {
      "email": "reg@gmail.com",
      "password": "reg"     
    }
  chai.request(app)
      .post('/users/signup')
      .send(registerUser)
      .end((err, res) => {
        res.should.have.status(200);
  
        chai.request(app)
        .post('/users/login')
        .send(loginUser)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('token');
          res.body.should.have.property('user');
          res.body.user.should.have.property('id');
          res.body.user.should.have.property('username');
          res.body.user.should.have.property('email');
          res.body.user.should.have.property('firstname');
          res.body.user.should.have.property('lastname');
          res.body.user.should.have.property('projects');
          res.body.user.should.have.property('circle');
          res.body.user.should.have.property('picture').eql("");
          res.body.user.should.have.property('bio');
          res.body.user.bio.should.have.all.keys('socials', 'category', "text");
          res.body.user.bio.text.should.eql("");

          done();
        });
      }) 
  });

  it('it should not POST user for logging in if email does not exist', (done) => {
    let loginUser = {
      "email": "noreg@gmail.com",
      "password": "string"     
    }
  chai.request(app)
      .post('/users/login')
      .send(loginUser)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property('msg').eql("Email or Password is incorrect");
        done();
      }) 
  });  

  it('it should not POST user for logging in if password if incorrect', (done) => {
    let registerUser = {
      "username": "passwordLoginIncorrect",
      "email": "passwordinc@gmail.com",
      "password": "string",
      "firstname": "string",
      "lastname": "string"
    }
    let loginUser = {
      "email": "passwordinc@gmail.com",
      "password": "incorrectpassword"     
    }
  chai.request(app)
      .post('/users/signup')
      .send(registerUser)
      .end((err, res) => {
        res.should.have.status(200);
  
        chai.request(app)
        .post('/users/login')
        .send(loginUser)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.have.property('msg').eql("Email or Password is incorrect");

          done();
        });
      }) 
  });
});

/*
  * Test the /GET route for finding a user
  */
 describe('/GET users for users/{id}', () => {
  it('it should successfully GET user if user is in database', (done) => {
    let registerUser = {
      "username": "getUser",
      "email": "getUser@gmail.com",
      "password": "string",
      "firstname": "string",
      "lastname": "string"
    }
    let id = "getUser";
  chai.request(app)
      .post('/users/signup')
      .send(registerUser)
      .end((err, res) => {
        res.should.have.status(200);
  
        chai.request(app)
        .get('/users/' + id)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.have.property('username');
            res.body.should.have.property('email');
            res.body.should.have.property('firstname');
            res.body.should.have.property('lastname');
            res.body.should.have.property('projects');
            res.body.should.have.property('circle');
            res.body.should.have.property('bio');
            res.body.bio.should.have.all.keys("socials", "category", "text");
            res.body.should.have.property('picture');
          done();
        });
      }) 
  });  

  it('it should not GET user if user is not in database', (done) => {
    let id = "notInDb";
    chai.request(app)
    .get('/users/' + id)
    .end((err, res) => {
        res.should.have.status(404);
        res.text.should.be.eql('User not found.');
      done();
    });
  });
});
/*
  * Test the /GET route
  */
 describe('/GET users', () => {
  it('it should GET all the Users', (done) => {
    chai.request(app)
        .get('/users')
        .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.a('array');
              res.body.length.should.be.eql(0);
          done();
        });
  });
});

});
