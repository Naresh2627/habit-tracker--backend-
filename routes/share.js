import express from 'express';
import auth from '../middleware/auth.js';
import ShareController from '../controllers/shareController.js';

const router = express.Router();

// @route   GET /api/share/stats
// @desc    Get shareable stats for user
// @access  Private
router.get('/stats', auth, ShareController.getShareableStats);

// @route   POST /api/share/create
// @desc    Create a shareable link
// @access  Private
router.post('/create', auth, ShareController.createShare);

// @route   GET /api/share/:shareId
// @desc    Get shared progress data
// @access  Public
router.get('/:shareId', ShareController.getSharedProgress);

// @route   GET /api/share/user/links
// @desc    Get user's shared links
// @access  Private
router.get('/user/links', auth, ShareController.getUserLinks);

// @route   DELETE /api/share/:shareId
// @desc    Delete a shared link
// @access  Private
router.delete('/:shareId', auth, ShareController.deleteShare);

export default router;
