const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { Entry } = require('./entry');
const dotenv = require('dotenv');

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		minlength: 6,
		maxlength: 255,
		unique: true,
	},
	password: {
		type: String,
		required: true,
		minlength: 6,
		maxlength: 1024,
	},
	name: {
		type: String,
		required: true,
		minlength: 3,
		maxlength: 255,
	},
	picture_uri: {
		type: String,
		minlength: 6,
		maxlength: 1024,
		default:
			'https://ccivr.com/wp-content/uploads/2019/07/empty-profile.png',
	},
	birthday: {
		type: Date,
		max: Date.now,
		required: true,
	},
	created_at: {
		type: Date,
		default: Date.now,
	},
	entries: [
		{ type: mongoose.Schema.Types.ObjectId, ref: 'Entry' },
	],
	favorites: [
		{ type: mongoose.Schema.Types.ObjectId, ref: 'Entry' },
	],
});

userSchema.methods.generateToken = function () {
	const token = jwt.sign(
		{ _id: this._id, email: this.email },
		process.env.SECRET_KEY
	);
	return token;
};

const User = mongoose.model('User', userSchema);

const validateUser = (user) => {
	const schema = Joi.object({
		email: Joi.string().required().min(6).max(255).email(),
		password: Joi.string().required().min(6).max(1024),
		name: Joi.string().required().min(3).max(255),
		picture_uri: Joi.string().min(6).max(1024).uri(),
		birthday: Joi.date().max('now').required(),
	});
	return schema.validate(user, {
		abortEarly: false,
	});
};

exports.User = User;
exports.validateUser = validateUser;
