const flash = require('connect-flash');
const session = require('express-session');
let cookieParser = require('cookie-parser');
const express = require('express');
const cors = require('cors');

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
//Specify swagger configuration
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: "Circlespace API",
            description: "Showcase to the world.",
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
let filesRouter = require('./routes/files');
let postRoute = require('./routes/posts');
let projectsRoute = require('./routes/projects');

//Create the express app
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

//Express session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))

app.use(flash());

//Global variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})

//Handle the routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/files', filesRouter);
app.use('/posts', postRoute);
app.use('/projects', projectsRoute);

//Create the route for the API route documentation
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

//app.listen(3000);
module.exports = app;
