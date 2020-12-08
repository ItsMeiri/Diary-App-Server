const jwt = require("jsonwebtoken");

//middleware to decode JWT tokens and pass on the user info to the next function
module.exports = (req, res, next) => {
	const token = req.header("x-auth-token");
	// const token = req.cookies.token;
	if (!token) return res.status(401).send("Missing token");
	try {
		const verifiedUser = jwt.verify(token, process.env.SECRET_KEY);
		req.user = verifiedUser;
		next();
	} catch {
		return res.status(403).send("Forbidden");
	}
};
