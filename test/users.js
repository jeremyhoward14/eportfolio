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

});
