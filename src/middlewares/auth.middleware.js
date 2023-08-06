const authorization = (role) => {
	return async (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({ status: 'Error', message: 'No auth' });
		};

		const user = req.user;

		if (user.role !== role) {
			return res.status(403).json({status: 'Error', message: 'Forbidden'});
		};

		next();
	};
};

export default authorization;