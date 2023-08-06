import jwt from 'jsonwebtoken';
const JWT_SECRET = '<SECRET>';

export const generateToken = (user) => {
	const token = jwt.sign({id: user.id, email: user.email, role: user.role}, JWT_SECRET, {expiresIn: '1d'});
	return token;
};

export const authToken = (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		return res.sendStatus(401).send("No auth");
	};
	const token = authHeader.split(" ")[1];
	jwt.verify(token, JWT_SECRET, (err, credential) => {
		if (err) {
			return res.sendStatus(401).send("No auth");
		};
		req.user = credential.user;
		next();
	});
};