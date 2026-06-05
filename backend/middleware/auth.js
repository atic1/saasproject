
const checkRole = (roles) => {
    return (req, res, next) => {
        const userRole = req.headers['x-user-role'];
        if (!userRole || !roles.includes(userRole)) {
            return res.status(403).json({ success: false, message: "Access Denied: Insufficient Permissions" });
        }
        next();
    };
};

module.exports = {
    checkRole
};
