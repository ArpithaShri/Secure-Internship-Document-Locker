/**
 * Access Control List (ACL) Matrix
 * 
 * Subjects (Roles): student, recruiter, admin
 * Objects (Resources): resume, offerLetter, userManagement
 * 
 * Policy Matrix:
 * | Role      | Resume             | Offer Letter       | User Management |
 * |-----------|--------------------|--------------------|-----------------|
 * | Student   | upload, view (own) | upload, view (own) | view (self)     |
 * | Recruiter | view (approved)    | view (approved)    | no access       |
 * | Admin     | full access        | full access        | full access     |
 */

const ACL = {
    roles: {
        student: {
            resume: ['upload', 'view_own'],
            offerLetter: ['upload', 'view_own'],
            user: ['view_self']
        },
        recruiter: {
            resume: ['view_approved'],
            offerLetter: ['view_approved'],
            user: []
        },
        admin: {
            resume: ['upload', 'view_all', 'delete'],
            offerLetter: ['upload', 'view_all', 'delete'],
            user: ['view_all', 'manage']
        }
    }
};

module.exports = ACL;
