const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
let cookieParser = require('cookie-parser');
const express = require('express');

//Passoprt config
require('./config/passport')(passport);

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
let authRouter = require('./routes/auth');

//Create the express app
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//Express session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

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
app.use('/auth', authRouter);
//Create the route for the API route documentation
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.listen(3000);
module.exports = app;
