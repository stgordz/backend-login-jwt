import passport from 'passport';
import local from 'passport-local';
import GitHubStrategy from 'passport-github2';
import { userModel } from '../dao/mongo/models/user.model.js';
import { createHash, isValidPassword } from '../utils/hash.utils.js';
import { adminModel } from '../dao/mongo/models/admin.model.js';
import jwt from 'passport-jwt';
import cookieExtractor from '../utils/cookieExtractor.utils.js';

const LocalStrategy = local.Strategy;

const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;

const initializePassport = () => {
	passport.use(
		'jwt',
		new JWTStrategy(
			{
				jwtFromRequest: ExtractJWT.fromExtractors([cookieExtractor]),
				secretOrKey: "<SECRET>"
			},
			async (jwt_payload, done) => {
				try {
					return done(null, jwt_payload);
				} catch (err) {
					return done('Error:', err);
				}
			}
		)
	);

	passport.use(
		'register',
		new LocalStrategy(
			{ passReqToCallback: true, usernameField: 'email' },
			async (req, username, password, done) => {
				const { first_name, last_name, email } = req.body;
				try {
					if (email == 'adminCoder@coder.com') {
						return done(null, false, {
							status: 200,
							message: 'Cant create an admin account',
						});
					}

					const user = await userModel.findOne({ email: username });

					if (user) {
						return done(null, false, {
							status: 200,
							message: 'User already exist',
						});
					}

					const newUser = {
						first_name,
						last_name,
						email,
						password: createHash(password),
						role: 'user',
					};

					const result = await userModel.create(newUser);
					return done(null, result, { message: 'User created' });
				} catch (err) {
					return done('Error:', err);
				}
			}
		)
	);

	passport.use(
		'login',
		new LocalStrategy(
			{ usernameField: 'email' },
			async (username, password, done) => {
				try {
					if (
						username == 'adminCoder@coder.com' &&
						password == 'adminCod3r123'
					) {
						const user = await adminModel.findOne({ email: username });
						if (!user) {
							const user = await adminModel.create({
								email: 'adminCoder@coder.com',
								password: createHash(password),
								role: 'admin',
							});
							return done(null, user);
						}
						return done(null, user);
					}

					const user = await userModel.findOne({ email: username });
					if (!user) {
						return done(null, false, { message: 'User doesnt exist' });
					}

					if (!isValidPassword(user, password)) {
						return done(null, false, { message: 'Invalid credentials' });
					}

					return done(null, user);
				} catch (err) {
					return done('Error:', err);
				}
			}
		)
	);

	passport.use(
		'github',
		new GitHubStrategy(
			{
				clientID: "<CLIENTID>",
				clientSecret: "<CLIENTSECRET>",
				callbackURL: '<CALLBACKURL>',
			},
			async (accesToken, refreshToken, profile, done) => {
				try {
					const user = await userModel.findOne({ email: profile._json.email });
					if (!user) {
						const newUser = {
							first_name: profile._json.name.split(' ')[0],
							last_name: profile._json.name.split(' ')[2],
							email: profile._json.email,
							password: '',
						};

						const result = await userModel.create(newUser);
						return done(null, result);
					} else {
						done(null, user);
					};
				} catch (err) {
					return done('Error:', err);
				};
			}
		)
	);

	passport.serializeUser((user, done) => {
		done(null, user._id);
	});

	passport.deserializeUser(async (_id, done) => {
		const user = await userModel.findById(_id);
		done(null, user);
	});
};

export default initializePassport;
