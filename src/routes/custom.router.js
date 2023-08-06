import { Router } from 'express';
import jwt from 'jsonwebtoken';

export default class CustomRouter {
	constructor() {
		this.router = Router();
		this.init();
	}

	getRouter() {
		return this.router;
	}

	init() {}

	get(path, policies, ...callbacks) {
		this.router.get(
			path,
			this.handlePolicies(policies),
			this.generateCustomResponse,
			this.applyCallbacks(callbacks)
		);
	}

	post(path, policies, ...callbacks) {
		this.router.post(
			path,
			this.handlePolicies(policies),
			this.generateCustomResponse,
			this.applyCallbacks(callbacks)
		);
	}

	put(path, policies, ...callbacks) {
		this.router.put(
			path,
			this.handlePolicies(policies),
			this.generateCustomResponse,
			this.applyCallbacks(callbacks)
		);
	}

	delete(path, policies, ...callbacks) {
		this.router.delete(
			path,
			this.handlePolicies(policies),
			this.generateCustomResponse,
			this.applyCallbacks(callbacks)
		);
	}

	generateCustomResponse = (req, res, next) => {
		res.sendSuccess = (payload) => res.send({ status: 'success', payload });
		res.sendServerError = (err) => res.send({ status: 'success', error: err });
		res.sendUserError = (err) => res.send({ status: 'success', error: err });
		next();
	};

	handlePolicies = (policies) => {
		return (req, res, next) => {
			if (policies[0] === 'PUBLIC') {
				return next();
			}

			const authHeaders = req.headers.authorization;
			if (!authHeaders) {
				return res.status(401).send({ status: 'error', error: 'Unauthorized' });
			}

			const token = authHeaders.split(' ')[1];
			const user = jwt.verify(token, "<SECRET>");

			if (!policies.includes(user.role.toUpperCase())) {
				return res.status(403).send({ status: 'error', error: 'Forbidden' });
			}

			req.user = user;
			next();
		};
	};

	applyCallbacks(callbacks) {
		return callbacks.map((callback) => async (...params) => {
			try {
				callback.apply(this, params);
			} catch (err) {
				params[1].status(500).send(`Error: ${err}`);
			}
		});
	}
}
