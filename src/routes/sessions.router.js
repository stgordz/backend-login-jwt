import { Router } from 'express';
const sessions = Router();

// Passport
import passport from 'passport';

// Endpoint para loguearse:
sessions.post("/login", passport.authenticate('login'), async (req, res) => {
	try {
		req.session.user = {
			first_name: req.user.first_name,
			last_name: req.user.last_name,
			email: req.user.email,
			role: req.user.role,
		};
		return res.status(200).send({status: 'success', response: 'User loged'});
	} catch (err) {
		return res.status(500).json({ error: err.message });
	};
});

// Endpoint para loguearse con jwt:
sessions.post('/loginjwt', passport.authenticate('jwt'), async (req, res) => {
	try {
		req.session.user = {
			first_name: req.user.first_name,
			last_name: req.user.last_name,
			email: req.user.email,
			role: req.user.role,
		};
		const access_token = generateToken(user);
		return res.status(200).send({ status: 'success', token: access_token });
	} catch (err) {
		return res.status(500).json({ error: err.message });
	}
});

// Endpoint para registrarse:
sessions.post(
	'/register',
	passport.authenticate('register'),
	async (req, res) => {
		try {
			req.session.user = {
				first_name: req.user.first_name,
				last_name: req.user.last_name,
				email: req.user.email,
				role: req.user.role,
			};
			return res
				.status(200)
				.send({ status: 'success', response: 'User created' });
		} catch (err) {
			return res.status(500).json({ status: 'error', response: err.message });
		}
	}
);

// Endpoint para desloguearse:
sessions.post('/logout', (req, res) => {
	try {
		req.session.destroy((err) => {
			if (!err) {
				return res.status(200).render('login', {
					style: 'styles.css',
					documentTitle: 'Login',
				});
			}

			return res.status(500).send({ status: `Logout error`, payload: err });
		});
	} catch (err) {
		return res.status(500).json({ error: err.message });
	}
});

// Endpoints para logearse con GitHub:
sessions.get('/github', passport.authenticate('github'), async (req, res) => {});

sessions.get('/githubCallback', passport.authenticate('github'), async (req, res) => {
		req.session.user = req.user;
		res.redirect('/');
	}
);

export default sessions;
