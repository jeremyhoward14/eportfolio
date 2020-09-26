let mongoose = require("mongoose");
let User = require('../models/users');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../app');
let should = chai.should();


chai.use(chaiHttp);
//Our parent block
describe('Users', () => {
    beforeEach((done) => { //Before each test we empty the database
        User.deleteOne({}, (err) => {
           done();
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

  /*
  * Test the /POST route for registering
  */
 describe('/POST users/signup', () => {
  it('it should POST a user to the database', (done) => {
      let user = {
        "username": "string",
        "email": "string@gmail.com",
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
          done();
        });
  });

  it('it should not POST a user with identical usernames to another in db', (done) => {
    let user = {
      "username": "string",
      "email": "string@gmail.com",
      "password": "string",
      "firstname": "string",
      "lastname": "string"
    }
    let user2 = {
      "username": "string",
      "email": "string@gmail.com",
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
            res.body.should.have.property('msg').eql('Username already exists');
          done();
        });
      }) 

});

it('it should not POST a user with identical emails to another in db', (done) => {
  let user = {
    "username": "string",
    "email": "string@gmail.com",
    "password": "string",
    "firstname": "string",
    "lastname": "string"
  }
  let user2 = {
    "username": "string2",
    "email": "string@gmail.com",
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
    "username": "string",
    "email": "string",
    "password": "string",
    "firstname": "string",
    "lastname": "string"
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
      "username": "string",
      "email": "string@gmail.com",
      "password": "string",
      "firstname": "string",
      "lastname": "string"
    }
    let loginUser = {
      "email": "string@gmail.com",
      "password": "string"     
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
            res.body.should.have.property('id');

          done();
        });
      }) 
  });

  it('it should not POST user for logging in if email does not exist', (done) => {
    let loginUser = {
      "email": "string@gmail.com",
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
      "username": "string",
      "email": "string@gmail.com",
      "password": "string",
      "firstname": "string",
      "lastname": "string"
    }
    let loginUser = {
      "email": "string@gmail.com",
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

});
