const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { User, validateUser } = require("../models/user");
const { Entry } = require("../models/entry");
const authMiddleware = require("../middlewares/authMiddleware");

// route for creating a new user \ sign up
router.post("/", async (req, res) => {
	const { error } = validateUser(req.body);
	if (error) return res.status(400).send(error.details[0].message);
	// check if a user with  the same email already exists
	let user = await User.findOne({ email: req.body.email });
	if (user) return res.status(401).send("User already exists");
	user = new User(req.body);
	//generate password hash with bcrypt
	const salt = await bcrypt.genSalt(10);
	user.password = await bcrypt.hash(user.password, salt);
	await user.save();
	return res.status(200).send({ email: user.email, _id: user._id });
});

router.get("/me", authMiddleware, async (req, res) => {
	const user = await User.findOne({ _id: req.user._id });
	if (!user) return res.status(400).send("user not found");
	res.status(200).send({
		_id: user._id,
		name: user.name,
		email: user.email,
		birthday: user.birthday,
		picture_uri: user.picture_uri,
	});
});

// get user by _id
router.get("/:id", authMiddleware, async (req, res) => {
	// check if param is valid ObjectId string
	if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).send("Not a valid user id pattern");
	// get the user and populate the entries array details by the ref
	const user = await await User.findOne({ _id: req.params.id }).populate("entries favorites");
	if (!user) return res.status(401).send("User not found");
	return res.status(200).send({
		email: user.email,
		_id: user._id,
		name: user.name,
		birthday: user.birthday,
		picture_uri: user.picture_uri,
		created_at: user.created_at,
		entries: user.entries,
		favorites: user.favorites,
	});
});

// get users by name search
router.get("/search/:search", authMiddleware, async (req, res) => {
	let search = req.params.search;
	let reg = new RegExp(search, "i");
	let users = await User.find({ name: { $regex: reg } });
	if (!users) return res.status(401).send("No users found");
	users = users.map(user => {
		return {
			email: user.email,
			_id: user._id,
			name: user.name,
			picture_uri: user.picture_uri,
			birthday: user.birthday,
		};
	});
	return res.status(200).send(users);
});

// delete user by _id
router.delete("/:id", authMiddleware, async (req, res) => {
	// check if param is valid ObjectId string
	if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).send("Not a valid user id pattern");
	if (req.params.id != req.user._id) return res.status(400).send("Forbidden");
	const user = await User.findOneAndDelete({ _id: req.params.id });
	if (!user) return res.status(401).send("User not found");
	await Entry.deleteMany({ user_id: req.params.id });
	return res.status(201).send({
		_id: user._id,
		name: user.name,
		email: user.email,
	});
});

//FAVORITES ACTIONS

router.get("/favorites/list", authMiddleware, async (req, res) => {
	let user = await User.findOne({ _id: req.user._id }).populate({ path: "favorites", populate: { path: "user_id", model: User, select: "name email picture_uri birthday" } });
	if (!user) return res.status(401).send("user not found");
	return res.status(200).send(user.favorites);
});

router.post("/favorites/:id", authMiddleware, async (req, res) => {
	const entry_id = req.params.id;
	const user_id = req.user._id;
	let user = await User.findOne({ _id: user_id });
	let entryIndex = user.favorites.indexOf(entry_id);
	if (entryIndex >= 0) return res.status(400).send("already in favorites");
	user.favorites.push(entry_id);
	user.save();
	return res.status(200).send("added to favorites");
});

router.delete("/favorites/:id", authMiddleware, async (req, res) => {
	const entry_id = req.params.id;
	const user_id = req.user._id;
	let user = await User.findOne({ _id: user_id });
	let entryIndex = user.favorites.indexOf(entry_id);
	if (entryIndex < 0) return res.status(400).send("not in favorites");
	user.favorites.splice(entryIndex, 1);
	user.save();
	return res.status(200).send("deleted from favorites");
});

module.exports = router;
