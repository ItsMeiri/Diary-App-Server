const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Joi = require('joi');
const { User } = require('../models/user');

//user sign in route + sending back a JWT token on sign in success
router.post('/', async (req, res) => {
	const { error } = validateLogin(req.body);
	if (error) return res.status(401).send('bad request');

	let user = await User.findOne({ email: req.body.email });
	if (!user)
		return res
			.status(403)
			.send('Email or password incorrect');
	const password = await bcrypt.compare(
		req.body.password,
		user.password
	);
	if (!password)
		return res
			.status(403)
			.send('Email or password incorrect');
	res.status(203).send({ token: user.generateToken() });
	// res.cookie("token", user.generateToken(), { httpOnly: true });
});

function validateLogin(user) {
	const schema = Joi.object({
		email: Joi.string().required().min(6).max(255).email(),
		password: Joi.string().required().min(6).max(1024),
	});
	return schema.validate(user, {
		abortEarly: false,
	});
}

module.exports = router;
