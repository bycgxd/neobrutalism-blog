import { Router, Request, Response } from 'express';
import GardenNote from '../models/GardenNote';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Get all notes
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const isAdmin = req.query.admin === 'true';
    const page = parseInt(req.query.page as string) || 0;
    const limit = parseInt(req.query.limit as string) || 10;
    const order = (req.query.order as string) === 'asc' ? 'ASC' : 'DESC';
    const whereClause = isAdmin ? {} : { isHidden: false };

    if (page > 0) {
      const total = await GardenNote.count({ where: whereClause });
      const notes = await GardenNote.findAll({
        where: whereClause,
        order: [['date', order]],
        limit,
        offset: (page - 1) * limit,
      });
      res.json({ notes, total, page, totalPages: Math.ceil(total / limit) });
      return;
    }

    const notes = await GardenNote.findAll({
      where: whereClause,
      order: [['date', order]],
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single note
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const note = await GardenNote.findByPk(Number(req.params.id));
    if (!note) {
      res.status(404).json({ message: 'Note not found' });
      return;
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create note (protected)
router.post('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const note = await GardenNote.create(req.body);
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Update note (protected)
router.put('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const note = await GardenNote.findByPk(Number(req.params.id));
    if (!note) {
      res.status(404).json({ message: 'Note not found' });
      return;
    }
    await note.update(req.body);
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete note (protected)
router.delete('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const note = await GardenNote.findByPk(Number(req.params.id));
    if (!note) {
      res.status(404).json({ message: 'Note not found' });
      return;
    }
    await note.destroy();
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle hidden status (protected)
router.patch('/:id/toggle-visibility', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const note = await GardenNote.findByPk(Number(req.params.id));
    if (!note) {
      res.status(404).json({ message: 'Note not found' });
      return;
    }
    await note.update({ isHidden: !note.isHidden });
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;