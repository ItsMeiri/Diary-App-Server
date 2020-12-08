const mongoose = require("mongoose");
const Joi = require("Joi");
const User = require("./user");

const entrySchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		minlength: 6,
		maxlength: 32,
	},
	content: {
		type: String,
		required: true,
		minlength: 6,
		maxlength: 1024,
	},
	feeling: {
		type: String,
		required: true,
		enum: ["happy", "sad", "neutral"],
	},
	created_at: {
		type: Date,
		default: Date.now,
	},
	user_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
});

const Entry = mongoose.model("Entry", entrySchema);

const validateEntry = entry => {
	const schema = Joi.object({
		title: Joi.string().required().min(6).max(32),
		content: Joi.string().required().min(6).max(1024),
		feeling: Joi.string().required().valid("happy", "sad", "neutral"),
	});
	return schema.validate(entry, { abortEarly: false });
};

exports.Entry = Entry;
exports.validateEntry = validateEntry;
