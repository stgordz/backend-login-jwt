import { Router } from 'express';
import { generateToken } from '../utils/jwt.utils.js';

const router = Router();

router.post('/login', (req, res) => {
	const { email, role } = req.body;
	const user = { email, role };
	const token = generateToken(user);
	return res
		.cookie('authToken', token, { maxAge: 360000, httpOnly: true })
		.json({ message: 'Logged in' });
});

export default router;
