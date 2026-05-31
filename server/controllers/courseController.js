const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

exports.getCourses = async(req, res) => {
    try {
        const courses = await Course.find({});
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving catalog datasets' });
    }
};

exports.enrollInCourse = async(req, res) => {
    try {
        const { courseId } = req.body;
        const existing = await Enrollment.findOne({ userId: req.user.id, courseId });
        if (existing) return res.status(400).json({ message: 'Already enrolled in this course' });

        const enrollment = await Enrollment.create({ userId: req.user.id, courseId });
        res.status(201).json(enrollment);
    } catch (err) {
        res.status(500).json({ message: 'Failed to complete course enrollment' });
    }
};

exports.getEnrolledCourses = async(req, res) => {
    try {
        const enrollments = await Enrollment.find({ userId: req.user.id }).populate('courseId');
        res.json(enrollments);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching enrolled tracks' });
    }
};

exports.updateProgress = async(req, res) => {
    try {
        const { enrollmentId, progress } = req.body;
        const enrollment = await Enrollment.findOneAndUpdate({ _id: enrollmentId, userId: req.user.id }, { progress }, { new: true });
        res.json(enrollment);
    } catch (err) {
        res.status(500).json({ message: 'Progress update failure' });
    }
};

exports.getRecommendations = async(req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User reference missing' });

        const userTags = [...user.interests, ...user.skills];
        const enrollments = await Enrollment.find({ userId: req.user.id });
        const enrolledCourseIds = enrollments.map(e => e.courseId.toString());

        const allCourses = await Course.find({ _id: { $nin: enrolledCourseIds } });

        // Recommendation logic: compute vector overlap matches
        const recommendations = allCourses.map(course => {
            const courseTags = [course.category, ...course.tags];
            const matchCount = courseTags.filter(tag => userTags.includes(tag)).length;
            return { course, score: matchCount };
        });

        // Sort by match score descending
        recommendations.sort((a, b) => b.score - a.score);
        res.json(recommendations.slice(0, 4).map(r => r.course));
    } catch (err) {
        res.status(500).json({ message: 'Recommendation compilation processing failure' });
    }
};