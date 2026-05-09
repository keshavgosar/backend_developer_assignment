import express from 'express';
import Task from '../models/task.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create Task
router.post('/', protect, async (req, res) => {
    try {
        const task = await Task.create({ ...req.body, owner: req.user.id });
        res.status(201).json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Users Tasks
router.get('/', protect, async (req, res) => {
    try {
        const tasks = await Task.find({ owner: req.user.id });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin Route: Get ALL Tasks across all users
router.get('/all', protect, adminOnly, async (req, res) => {
    try {
        const tasks = await Task.find().populate('owner', 'username');
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Task
router.put('/:id', protect, async (req, res) => {
    try {
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, owner: req.user.id },
            { title: req.body.title, description: req.body.description },
            { new: true }
        );
        
        if (!task) 
            return res.status(404).json({ message: 'Task not found or unauthorized' });

        res.json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Task
router.delete('/:id', protect, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
        if (!task) return res.status(404).json({ message: 'Task not found or unauthorized' });
        res.json({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;