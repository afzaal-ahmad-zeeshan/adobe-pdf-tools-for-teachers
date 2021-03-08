let express = require('express');
let server = express();
let handlebars = require("express-handlebars");
let path = require('path');
let bodyParser = require('body-parser');
let fileUpload = require('express-fileupload');
let morgan = require("morgan");

// configure the handlebars
server.engine('handlebars', handlebars({
    helpers: {
        isHome: function (value) {
            return value === 'home';
        },
        isReports: function (value) {
            return value === 'reports';
        },
        isAdmin: function (value) {
            return value === 'admin';
        },
    },
}));

// config the view engine
server.set('view engine', 'handlebars');
server.set('views', path.join(__dirname, './views'));
server.locals.layout = 'layout.handlebars';

// set the file uploads
server.use(fileUpload({
    createParentPath: true
}));
server.use(express.json());
server.use(express.urlencoded({extended: true}));

// server.use(bodyParser.json());
// server.use(bodyParser.urlencoded({extended: true}));

// allow files to be directly downloaded
server.use(express.static('public'));
server.use(morgan('dev'));

// Routes
server.use('/', require('./router/home'));
server.use('/reports', require('./router/reports'));
server.use('/admin', require('./router/admin'));

server.all('*', (req, res) => {
    res.status(404).render('lost');
});

// Start the server
server.listen(1234, () => {
    console.log("Server is listening on http://localhost:1234/");
});
