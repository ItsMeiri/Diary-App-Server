const express = require('express');
const app = express();
require('dotenv').config();
const http = require('http').Server(app);
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const users = require('./routes/users');
const entries = require('./routes/entries');
const auth = require('./routes/auth');

mongoose.connect(
	process.env.MONGODB_URI ||
		'mongodb://127.0.0.1/diary-server',
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
	},
	(err) => {
		!err
			? console.log('connected db')
			: console.log('not connected to db');
	}
);

app.use(morgan('dev'));
// app.use(
// 	cors({
// 		origin: '*',
// 		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// 		allowedHeaders: ['Content-Type', 'Authorization'],
// 		preflightContinue: false,
// 	})
// );
app.use(cookieParser());
app.use(express.json());

app.use('/api/users', users);
app.use('/api/entries', entries);
app.use('/auth', auth);
// app.use((req, res, next) => {
// 	res.setHeader('Access-Control-Allow-Origin', '*');
// 	res.setHeader(
// 		'Access-Control-Allow-Methods',
// 		'GET, POST, PUT, DELETE, OPTIONS'
// 	);
// 	res.setHeader(
// 		'Access-Control-Allow-Headers',
// 		'Content-Type, Authorization'
// 	);
// 	next();
// });

app.listen(4000, () =>
	console.log('server running on localhost://4000')
);
