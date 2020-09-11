const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

//Specify swagger configuration
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: "Circlespace API",
            description: "Placeholder description please change it to something nice.",
            servers: ["http://localhost:3000"],
        }
    },
    apis: ["./routes/*.js"],  //Look for swagger comments in these files
}
//Create a swaggerDoc with custom options
const swaggerDocs = swaggerJsDoc(swaggerOptions);


//Connect to the database
require("./models/db");

//Set up the routes
let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');

//Create the express app
const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Handle the routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
//Create the route for the API route documentation
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));


module.exports = app;
