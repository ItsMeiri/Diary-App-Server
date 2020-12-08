const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();
const { Entry, validateEntry } = require("../models/entry");
const { User } = require("../models/user");

// endpoint for adding new entry
router.post("/", authMiddleware, async (req, res) => {
	const { error } = validateEntry(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	let entry = new Entry({ ...req.body, user_id: req.user._id });

	await entry.save();
	let user = await User.findOne({ _id: req.user._id });
	// updating the entries array in the logged in user model
	user.entries.push(entry._id);
	user.save();
	console.log(user.entries);

	return res.status(200).send({ title: entry.title, _id: entry._id, user_id: user.id });
});

// route to get specific entry by _id
router.get("/:id", authMiddleware, async (req, res) => {
	// check if param is a vdlid ObjectId string
	if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).send("Not a valid entry id pattern");
	const entry = await Entry.findOne({ _id: req.params.id }).populate("user_id", "name email birthday picture_uri");
	if (!entry) return res.status(401).send("Entry not found");
	return res.status(200).send({ title: entry.title, _id: entry._id, content: entry.content, feeling: entry.feeling, created_at: entry.created_at, user_id: entry.user_id });
});

// route to update an entry by _id only if logged in user is the author of the entry
router.put("/:id", authMiddleware, async (req, res) => {
	// check if param is a valid ObjectId string
	if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).send("Not a valid entry id pattern");
	const { error } = validateEntry(req.body);
	if (error) return res.status(400).send(error.details[0].message);
	// find an entry with the param id AND author is the logged in user and update it. { new:true } => returning the MODIFIED entry
	const entry = await Entry.findOneAndUpdate({ _id: req.params.id, user_id: req.user._id }, req.body, { new: true });
	if (!entry) return res.status(403).send("Entry not found or user does not have permission to alter the entry");
	return res.status(200).send({ title: entry.title, _id: entry._id, content: entry.content, feeling: entry.feeling, created_at: entry.created_at, user_id: entry.user_id });
});

// route to delete specific entry by _id
router.delete("/:id", authMiddleware, async (req, res) => {
	// check if param is a vdlid ObjectId string
	if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).send("Not a valid entry id pattern");
	// if (req.params.id != req.user._id) return res.status(400).send("Forbidden");
	const entry = await Entry.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
	if (!entry) return res.status(401).send("Entry not found");
	const user = await User.findOne({ _id: req.user._id });
	// find the index of the entry in the entries array of the logged user
	const userEntryIdx = user.entries.findIndex(element => element._id.toString() == entry._id.toString());
	//  remove the entry from the array
	user.entries.splice(userEntryIdx, 1);
	await user.save();
	return res.status(200).send(entry);
});

module.exports = router;
