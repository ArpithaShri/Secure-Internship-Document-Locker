const ACL = require('../security/acl');

/**
 * Authorization Middleware
 * @param {string} resource - The object being accessed (e.g., 'resume')
 * @param {string} action - The action requested (e.g., 'upload')
 */
const authorize = (resource, action) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const userRole = req.user.role;
        const rolePermissions = ACL.roles[userRole];

        if (!rolePermissions || !rolePermissions[resource]) {
            return res.status(403).json({ error: 'Access Denied: Role or Resource not found' });
        }

        const permissions = rolePermissions[resource];

        // Check for exact action match or general access
        if (permissions.includes(action) || permissions.includes('full_access')) {
            return next();
        }

        // Special dynamic checks like 'view_own' or 'view_approved' 
        // are handled inside the routes using ownership/request logic.
        // This middleware handles the coarse-grained role checks first.

        // If the action is specifically restricted (like a student trying to view all)
        return res.status(403).json({ error: `Access Denied: Role ${userRole} cannot perform ${action} on ${resource}` });
    };
};

module.exports = authorize;
