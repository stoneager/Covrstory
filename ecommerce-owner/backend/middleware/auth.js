// Dummy middleware - replace with actual JWT verification
const dummyAuth = (req, res, next) => {
	// For now, assume user is always authenticated as owner
	req.user = {
		id: '60f1b2b2b2b2b2b2b2b2b2b2',
		role: 'owner',
		email: 'owner@example.com'
	};
	next();
};

const ownerOnly = (req, res, next) => {
	if (req.user && req.user.role === 'owner') {
		next();
	} else {
		res.status(403).json({ message: 'Access denied. Owner only.' });
	}
};

module.exports = { dummyAuth, ownerOnly };
