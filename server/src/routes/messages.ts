import { Router } from 'express';
import { authMiddleware } from '../services/auth';
import type { Request, Response } from 'express';

const router = Router();

// Temporary in-memory storage - will be replaced with database
const messages: Array<{
  _id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}> = [];

// GET /messages → list all messages (auth required)
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    return res.json(messages);
  } catch (err) {
    return res.status(500).json({ error: 'internal_error' });
  }
});

// POST /messages → create new message (public endpoint)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'missing_required_fields' });
    }

    const newMessage = {
      _id: (messages.length + 1).toString(),
      name,
      email,
      message,
      createdAt: new Date().toISOString(),
    };

    messages.push(newMessage);
    return res.status(201).json(newMessage);
  } catch (err) {
    return res.status(400).json({ error: 'invalid_request' });
  }
});

// DELETE /messages/:id → delete message (auth required)
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const index = messages.findIndex((msg) => msg._id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'message_not_found' });
    }

    messages.splice(index, 1);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'internal_error' });
  }
});

export default router;
