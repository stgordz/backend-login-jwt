// Custom router
import CustomRouter from './custom.router.js';
import jwt from 'jsonwebtoken';

export default class CustomSessionsRouter extends CustomRouter {
	init() {
		this.post('/login', ['PUBLIC'], async (req, res) => {
			const user = {
				email: req.body.email,
				role: req.body.role,
			};

			const token = jwt.sign(user, '<SECRET>');

			res.sendSuccess({ token });
		});

		this.get('/current', ['USER', 'ADMIN'], async (req, res) => {
			res.sendSuccess({ user: req.user });
		});
	}
}
