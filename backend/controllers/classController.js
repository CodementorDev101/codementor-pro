const Class = require('../models/Class');
const ClassMembership = require('../models/ClassMembership');
const User = require('../models/User');

// Generate a random 8-character alphanumeric invite code
const generateInviteCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

// ─── INSTRUCTOR: Create a new class ─────────────────────────────────────────
const createClass = async (req, res) => {
    try {
        const { name, description } = req.body;
        const instructor_id = req.user.id;

        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: 'Class name is required.' });
        }

        // Generate a unique invite code
        let invite_code;
        let isUnique = false;
        while (!isUnique) {
            invite_code = generateInviteCode();
            const existing = await Class.findOne({ where: { invite_code } });
            if (!existing) isUnique = true;
        }

        const newClass = await Class.create({
            name: name.trim(),
            description: description ? description.trim() : null,
            instructor_id,
            invite_code
        });

        return res.status(201).json({
            success: true,
            message: 'Class created successfully.',
            class: newClass
        });
    } catch (error) {
        console.error('createClass error:', error);
        return res.status(500).json({ success: false, message: 'Failed to create class.' });
    }
};

// ─── INSTRUCTOR: Get all classes I created ───────────────────────────────────
const getMyClassesAsInstructor = async (req, res) => {
    try {
        const instructor_id = req.user.id;

        const classes = await Class.findAll({
            where: { instructor_id },
            order: [['created_at', 'DESC']]
        });

        // For each class, count active members
        const result = await Promise.all(classes.map(async (c) => {
            const memberCount = await ClassMembership.count({
                where: { class_id: c.id, status: 'active' }
            });
            return { ...c.toJSON(), member_count: memberCount };
        }));

        return res.status(200).json({ success: true, classes: result });
    } catch (error) {
        console.error('getMyClassesAsInstructor error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch classes.' });
    }
};

// ─── INSTRUCTOR: Get a single class with its members ─────────────────────────
const getClassDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const instructor_id = req.user.id;

        const classItem = await Class.findOne({ where: { id, instructor_id } });
        if (!classItem) {
            return res.status(404).json({ success: false, message: 'Class not found.' });
        }

        // Get all memberships for this class
        const memberships = await ClassMembership.findAll({
            where: { class_id: id },
            order: [['created_at', 'ASC']]
        });

        // Attach student info to each membership
        const membersWithInfo = await Promise.all(memberships.map(async (m) => {
            const student = await User.findOne({
                where: { id: m.student_id },
                attributes: ['id', 'first_name', 'last_name', 'email']
            });
            return {
                membership_id: m.id,
                student_id: m.student_id,
                status: m.status,
                invited_by: m.invited_by,
                joined_at: m.joined_at,
                student: student ? student.toJSON() : null
            };
        }));

        return res.status(200).json({
            success: true,
            class: classItem,
            members: membersWithInfo
        });
    } catch (error) {
        console.error('getClassDetails error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch class details.' });
    }
};

// ─── INSTRUCTOR: Delete a class ──────────────────────────────────────────────
const deleteClass = async (req, res) => {
    try {
        const { id } = req.params;
        const instructor_id = req.user.id;

        const classItem = await Class.findOne({ where: { id, instructor_id } });
        if (!classItem) {
            return res.status(404).json({ success: false, message: 'Class not found.' });
        }

        // Remove all memberships first
        await ClassMembership.destroy({ where: { class_id: id } });
        await classItem.destroy();

        return res.status(200).json({ success: true, message: 'Class deleted successfully.' });
    } catch (error) {
        console.error('deleteClass error:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete class.' });
    }
};

// ─── INSTRUCTOR: Manually invite a student by email ──────────────────────────
const inviteStudent = async (req, res) => {
    try {
        const { id } = req.params; // class id
        const { email } = req.body;
        const instructor_id = req.user.id;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Student email is required.' });
        }

        // Verify the class belongs to this instructor
        const classItem = await Class.findOne({ where: { id, instructor_id } });
        if (!classItem) {
            return res.status(404).json({ success: false, message: 'Class not found.' });
        }

        // Find the student
        const student = await User.findOne({ where: { email, role: 'student' } });
        if (!student) {
            return res.status(404).json({ success: false, message: 'No student found with that email.' });
        }

        // Check if already a member or has a pending invite
        const existing = await ClassMembership.findOne({
            where: { class_id: id, student_id: student.id }
        });

        if (existing) {
            if (existing.status === 'active') {
                return res.status(400).json({ success: false, message: 'This student is already a member of the class.' });
            }
            if (existing.status === 'pending') {
                return res.status(400).json({ success: false, message: 'This student already has a pending invite.' });
            }
            // If previously declined, re-invite by resetting to pending
            existing.status = 'pending';
            existing.invited_by = instructor_id;
            await existing.save();
            return res.status(200).json({ success: true, message: `Invite re-sent to ${student.first_name} ${student.last_name}.` });
        }

        // Create new pending membership
        await ClassMembership.create({
            class_id: id,
            student_id: student.id,
            status: 'pending',
            invited_by: instructor_id,
            joined_at: null
        });

        return res.status(201).json({
            success: true,
            message: `Invite sent to ${student.first_name} ${student.last_name}.`
        });
    } catch (error) {
        console.error('inviteStudent error:', error);
        return res.status(500).json({ success: false, message: 'Failed to send invite.' });
    }
};

// ─── STUDENT: Join a class via invite code ───────────────────────────────────
const joinViaCode = async (req, res) => {
    try {
        const { invite_code } = req.body;
        const student_id = req.user.id;

        if (!invite_code) {
            return res.status(400).json({ success: false, message: 'Invite code is required.' });
        }

        const classItem = await Class.findOne({ where: { invite_code: invite_code.toUpperCase().trim() } });
        if (!classItem) {
            return res.status(404).json({ success: false, message: 'Invalid invite code. Please check and try again.' });
        }

        // Check if already a member or pending
        const existing = await ClassMembership.findOne({
            where: { class_id: classItem.id, student_id }
        });

        if (existing) {
            if (existing.status === 'active') {
                return res.status(400).json({ success: false, message: 'You are already a member of this class.' });
            }
            if (existing.status === 'pending') {
                // They were manually invited — auto-accept since they used the code
                existing.status = 'active';
                existing.joined_at = new Date();
                await existing.save();
                return res.status(200).json({
                    success: true,
                    message: `Successfully joined "${classItem.name}"!`,
                    class: classItem
                });
            }
        }

        // Create active membership directly (no approval needed for code join)
        await ClassMembership.create({
            class_id: classItem.id,
            student_id,
            status: 'active',
            invited_by: null,
            joined_at: new Date()
        });

        return res.status(201).json({
            success: true,
            message: `Successfully joined "${classItem.name}"!`,
            class: classItem
        });
    } catch (error) {
        console.error('joinViaCode error:', error);
        return res.status(500).json({ success: false, message: 'Failed to join class.' });
    }
};

// ─── STUDENT: Respond to a manual invite (accept or decline) ─────────────────
const respondToInvite = async (req, res) => {
    try {
        const { id } = req.params; // class id
        const { action } = req.body; // 'accept' or 'decline'
        const student_id = req.user.id;

        if (!['accept', 'decline'].includes(action)) {
            return res.status(400).json({ success: false, message: 'Action must be "accept" or "decline".' });
        }

        const membership = await ClassMembership.findOne({
            where: { class_id: id, student_id, status: 'pending' }
        });

        if (!membership) {
            return res.status(404).json({ success: false, message: 'No pending invite found for this class.' });
        }

        if (action === 'accept') {
            membership.status = 'active';
            membership.joined_at = new Date();
            await membership.save();
            const classItem = await Class.findByPk(id);
            return res.status(200).json({
                success: true,
                message: `You have joined "${classItem.name}"!`
            });
        } else {
            membership.status = 'declined';
            await membership.save();
            return res.status(200).json({
                success: true,
                message: 'Invite declined.'
            });
        }
    } catch (error) {
        console.error('respondToInvite error:', error);
        return res.status(500).json({ success: false, message: 'Failed to respond to invite.' });
    }
};

// ─── STUDENT: Get my classes + pending invites ───────────────────────────────
const getMyClassesAsStudent = async (req, res) => {
    try {
        const student_id = req.user.id;

        const memberships = await ClassMembership.findAll({
            where: { student_id },
            order: [['created_at', 'DESC']]
        });

        const result = await Promise.all(memberships.map(async (m) => {
            const classItem = await Class.findByPk(m.class_id);
            if (!classItem) return null;

            const instructor = await User.findOne({
                where: { id: classItem.instructor_id },
                attributes: ['id', 'first_name', 'last_name', 'email']
            });

            const memberCount = await ClassMembership.count({
                where: { class_id: m.class_id, status: 'active' }
            });

            return {
                membership_id: m.id,
                status: m.status,
                joined_at: m.joined_at,
                invited_by: m.invited_by,
                class: {
                    ...classItem.toJSON(),
                    instructor: instructor ? instructor.toJSON() : null,
                    member_count: memberCount
                }
            };
        }));

        // Filter out nulls (deleted classes)
        const filtered = result.filter(Boolean);

        return res.status(200).json({ success: true, memberships: filtered });
    } catch (error) {
        console.error('getMyClassesAsStudent error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch your classes.' });
    }
};

// ─── STUDENT: Leave a class ──────────────────────────────────────────────────
const leaveClass = async (req, res) => {
    try {
        const { id } = req.params; // class id
        const student_id = req.user.id;

        const membership = await ClassMembership.findOne({
            where: { class_id: id, student_id, status: 'active' }
        });

        if (!membership) {
            return res.status(404).json({ success: false, message: 'You are not a member of this class.' });
        }

        await membership.destroy();

        return res.status(200).json({ success: true, message: 'You have left the class.' });
    } catch (error) {
        console.error('leaveClass error:', error);
        return res.status(500).json({ success: false, message: 'Failed to leave class.' });
    }
};

// ─── INSTRUCTOR: Remove a student from a class ───────────────────────────────
const removeMember = async (req, res) => {
    try {
        const { id, student_id } = req.params; // class id, student id
        const instructor_id = req.user.id;

        const classItem = await Class.findOne({ where: { id, instructor_id } });
        if (!classItem) {
            return res.status(404).json({ success: false, message: 'Class not found.' });
        }

        const membership = await ClassMembership.findOne({
            where: { class_id: id, student_id }
        });

        if (!membership) {
            return res.status(404).json({ success: false, message: 'Student is not in this class.' });
        }

        await membership.destroy();

        return res.status(200).json({ success: true, message: 'Student removed from class.' });
    } catch (error) {
        console.error('removeMember error:', error);
        return res.status(500).json({ success: false, message: 'Failed to remove student.' });
    }
};

module.exports = {
    createClass,
    getMyClassesAsInstructor,
    getClassDetails,
    deleteClass,
    inviteStudent,
    joinViaCode,
    respondToInvite,
    getMyClassesAsStudent,
    leaveClass,
    removeMember
};