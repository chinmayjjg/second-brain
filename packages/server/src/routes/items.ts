import express,{Request,Response} from 'express';
import { body, validationResult } from 'express-validator';
import axios from 'axios';
import * as cheerio from 'cheerio';
import Item from '../models/Item';
import Brain from '../models/Brain';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Extract metadata from URL
const extractMetadata = async (url: string) => {
  try {
    const response = await axios.get(url, { timeout: 5000 });
    const $ = cheerio.load(response.data);
    
    return {
      title: $('title').text() || $('meta[property="og:title"]').attr('content') || '',
      description: $('meta[name="description"]').attr('content') || 
                  $('meta[property="og:description"]').attr('content') || '',
      thumbnail: $('meta[property="og:image"]').attr('content') || '',
      author: $('meta[name="author"]').attr('content') || ''
    };
  } catch (error) {
    return null;
  }
};

// Create item
router.post('/', authMiddleware, [
  body('title').notEmpty().withMessage('Title is required'),
  body('type').isIn(['link', 'article', 'video', 'note']).withMessage('Invalid type'),
  body('brainId').notEmpty().withMessage('Brain ID is required')
], async (req: AuthRequest, res:Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, url, content, description, type, tags, brainId } = req.body;

    // Verify brain ownership
    const brain = await Brain.findOne({ 
      _id: brainId, 
      $or: [
        { userId: req.userId },
        { collaborators: req.userId }
      ]
    });

    if (!brain) {
      return res.status(404).json({ message: 'Brain not found or access denied' });
    }

    // Extract metadata if URL provided
    let metadata = null;
    if (url) {
      metadata = await extractMetadata(url);
    }

    const item = new Item({
      title: title || metadata?.title || 'Untitled',
      url,
      content,
      description: description || metadata?.description || '',
      type,
      tags: tags || [],
      userId: req.userId,
      brainId,
      metadata
    });

    await item.save();
    await item.populate('userId', 'username');

    res.status(201).json(item);
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get items
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { brainId, search, tags, type, page = 1, limit = 20 } = req.query;

    let query: any = { userId: req.userId };

    if (brainId) query.brainId = brainId;
    if (type) query.type = type;
    if (tags) query.tags = { $in: (tags as string).split(',') };
    if (search) {
      query.$text = { $search: search as string };
    }

    const items = await Item.find(query)
      .populate('userId', 'username')
      .populate('brainId', 'name')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Item.countDocuments(query);

    res.json({
      items,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update item
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const item = await Item.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete item
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const item = await Item.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;