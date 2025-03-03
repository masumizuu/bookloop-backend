const initModels = require('../models');

exports.authenticateUser = async (req, res, next) => {
    try {
        // Assuming JWT token is passed in headers (Authorization: Bearer <token>)
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

        // Verify token (Assuming you're using JWT)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const models = await initModels();
        const { User } = models;

        const user = await User.findByPk(decoded.user_id);
        if (!user) return res.status(401).json({ error: 'Invalid token' });

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

exports.requireAdmin = async (req, res, next) => {
    if (req.user.user_type !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied. Admins only.' });
    }
    next();
};
