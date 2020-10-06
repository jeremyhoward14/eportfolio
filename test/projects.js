let mongoose = require("mongoose");
let User = require('../models/users');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../app');
let should = chai.should();


chai.use(chaiHttp);
//Our parent block
describe('Projects', () => {
    beforeEach((done) => { //Before each test we empty the database
        User.deleteOne({}, (err) => {
           done();
        });
    });
/*
  * Test the /POST route for updating a project
  */
 describe('/POST update project for /projects/edit/{title}', () => {
  it('it should successfully update a specified title', (done) => {
    let registerUser = {
      "username": "reg123",
      "email": "reg123@gmail.com",
      "password": "reg123",
      "firstname": "reg123",
      "lastname": "reg123"
    }
    let project = {
        "title": "project",
        "text": "first project!!!",
        "tags": [
          {
            "tag": "test"
          },
          {
            "tag": "two tags"
          }
        ]
      }
    let updatedProject = {
        "title": "updatedProject",
        "text": "updating the first project",
        "tags": [
          {
            "tag": "one tag"
          },
        ]
      }
  chai.request(app)
      .post('/users/signup')
      .send(registerUser)
      .end((err, res) => {
        res.should.have.status(200);
        let jwt = res.body.token;

        chai.request(app)
        .post('/projects/create')
        .set('x-auth-token', jwt)
        .send(project)
        .end((err, res) => {
          res.should.have.status(201);

          let title = "project";

          chai.request(app)
          .post('/projects/edit/'+ title)
          .set('x-auth-token', jwt)
          .send(updatedProject)
          .end((err, res) => {
              res.should.have.status(200);
              res.body.should.have.property('title').eql('updatedProject');
              done();
          })
        });
      }) 
  });
  it('it should not update project as user does not have that project', (done) => {
    let registerUser = {
      "username": "reg2",
      "email": "reg2@gmail.com",
      "password": "reg2",
      "firstname": "reg2",
      "lastname": "reg2"
    }
    let project = {
        "title": "money makes the world go round",
        "text": "first project!!!",
        "tags": [
          {
            "tag": "test"
          },
          {
            "tag": "two tags"
          }
        ]
      }
    let updatedProject = {
    "title": "updatedProject",
    "text": "updating the first project",
    "tags": [
        {
        "tag": "one tag"
        },
    ]
    }
  chai.request(app)
      .post('/users/signup')
      .send(registerUser)
      .end((err, res) => {
        res.should.have.status(200);
        let jwt = res.body.token;

        chai.request(app)
        .post('/projects/create')
        .set('x-auth-token', jwt)
        .send(project)
        .end((err, res) => {
          res.should.have.status(201);

          let title = "unavailableProject";

          chai.request(app)
          .post('/projects/edit/'+ title)
          .set('x-auth-token', jwt)
          .send(updatedProject)
          .end((err, res) => {
              res.should.have.status(400);
              res.body.should.have.property('msg').eql('Could not find specified project-id for user');
              done();
          })
        });
      }) 
  });
});

});
