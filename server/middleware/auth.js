// auth middleware - get token from Authorization header "Bearer <token>"
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'No token' });
    const token = auth.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Invalid token' });

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = payload.id;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token invalid' });
    }
};
