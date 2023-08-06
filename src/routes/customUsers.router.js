import CustomRouter from './custom.router.js';

export default class CustomUsersRouter extends CustomRouter {
	init() {
		this.get('/', (req, res) => {
			const payload = {
				id: 10,
				name: "santiago",
				age: 24,
			}
			res.sendSuccess(payload);
		});
	};
};
