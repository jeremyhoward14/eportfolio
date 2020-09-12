let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

const bcrypt = require('bcrypt');
const flash = require('express-flash');
const session = require('express-session');
const passport = require('passport');
const methodOverride = require('method-override');

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
let loginRouter = require('./routes/login');
let registerRouter = require('./routes/register');

//Create the express app
const app = express();

app.set('view-engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

//Handle the routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', loginRouter);
app.use('/register', registerRouter);
//Create the route for the API route documentation
app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));


module.exports = app;
