var express = require('express'),
	stylus = require('stylus'),
	logger = require('morgan'),
	mongoose = require('mongoose'),
	bodyParser = require('body-parser');

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development'

var app = express();

function compile(str, path) {
	return stylus(str).set('filename', path);
}

app.set('views', __dirname + '/server/views');
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(stylus.middleware(
	{
		src: __dirname + '/public',
		compile: compile
	}
));

app.use(express.static(__dirname + '/public'));

if(env === 'development') {
	mongoose.connect('mongodb://localhost:27017/HerokuDeploy');
} else {
	mongoose.connect('mongodb://adminuser:adminuser@ds031601.mongolab.com:31601/vyas');
}

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'db connection error..'));
db.once('open', function callback() {
	console.log(db.name + ' db opened');
});

var messageSchema = mongoose.Schema( { message: String });
var Message = mongoose.model('Message', messageSchema);
var mongoMessage;

var categoriesSchema = mongoose.Schema( { id: String, name: String, description: String });
var Category = mongoose.model('Category', categoriesSchema);
var mongoCategory;

Category.findOne().exec(function(err, categoryDoc) {
	mongoCategory = categoryDoc;
});

Message.findOne().exec(function(err, messageDoc) {
	mongoMessage = messageDoc.message;
});

app.get('/partials/:partialPath', function(req, res) {
	res.render('partials/' + req.params.partialPath);
});

app.get('*', function(req, res) {
	res.render('index', { 
		mongoMessage: mongoMessage,
		mongoCategory: mongoCategory
	});
});

var port = process.env.PORT || 3030;
app.listen(port);

console.log('Listening on port ' + port + ' ...');