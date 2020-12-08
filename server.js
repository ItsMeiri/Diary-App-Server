const express = require("express");
const app = express();
require("dotenv").config();
const http = require("http").Server(app);
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const users = require("./routes/users");
const entries = require("./routes/entries");
const auth = require("./routes/auth");

mongoose.connect(
	"mongodb://localhost/diary-api",
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
	},
	err => {
		!err ? console.log("connected db") : console.log("not connected to db");
	}
);

app.use(morgan("dev"));
app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.use("/api/users", users);
app.use("/api/entries", entries);
app.use("/auth", auth);

app.listen(4000);
