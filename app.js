const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

//Connect to the database
require("./models/db");

//Set up the routes
let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Handle the routes
app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
