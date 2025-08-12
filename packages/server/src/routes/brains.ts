import express from 'express';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import Brain from '../models/Brain';
import Item from '../models/Item';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Create brain
router.post('/', authMiddleware, [
  body('name').notEmpty().withMessage('Name is required')
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;

    const brain = new Brain({
      name,
      description,
      userId: req.userId
    });

    await brain.save();
    res.status(201).json(brain);
  } catch (error) {
    console.error('Create brain error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's brains
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const brains = await Brain.find({
      $or: [
        { userId: req.userId },
        { collaborators: req.userId }
      ]
    }).sort({ createdAt: -1 });

    res.json(brains);
  } catch (error) {
    console.error('Get brains error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Share brain
router.post('/:id/share', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const brain = await Brain.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!brain) {
      return res.status(404).json({ message: 'Brain not found' });
    }

    brain.isPublic = true;
    brain.shareToken = crypto.randomBytes(32).toString('hex');
    await brain.save();

    res.json({ shareUrl: `/shared/${brain.shareToken}` });
  } catch (error) {
    console.error('Share brain error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get shared brain
router.get('/shared/:token', async (req, res) => {
  try {
    const brain = await Brain.findOne({ 
      shareToken: req.params.token,
      isPublic: true 
    }).populate('userId', 'username');

    if (!brain) {
      return res.status(404).json({ message: 'Shared brain not found' });
    }

    const items = await Item.find({ brainId: brain._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ brain, items });
  } catch (error) {
    console.error('Get shared brain error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;