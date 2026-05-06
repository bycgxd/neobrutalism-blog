import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Op } from 'sequelize';
import Article from '../models/Article';
import { authenticate } from '../middlewares/auth';

const router = Router();

const jsonUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      const tmpDir = path.join(__dirname, '../../tmp');
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
      cb(null, tmpDir);
    },
    filename: (_req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    },
  }),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/json' || file.originalname.endsWith('.json')) {
      cb(null, true);
    } else {
      cb(new Error('Only JSON files are allowed'));
    }
  },
});

function formatForQuill(str: string): string {
  if (!str) return '';
  return str.split('\n').map(p => p ? `<p>${p}</p>` : '<p><br></p>').join('');
}

router.post('/bulk-import', authenticate, jsonUpload.array('files', 50), async (req: Request, res: Response): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ message: 'No files uploaded' });
      return;
    }

    const results: { filename: string; success: boolean; skipped?: boolean; title?: string; id?: number; error?: string }[] = [];

    for (const file of files) {
      try {
        let text = fs.readFileSync(file.path, 'utf-8');
        if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);

        let json = JSON.parse(text);
        if (Array.isArray(json)) json = json[0];

        const title = json.title || json.name || '未命名';

        const existing = await Article.findOne({ where: { title } });
        if (existing) {
          results.push({ filename: file.originalname, success: false, skipped: true, title, error: '已存在同名文章' });
          continue;
        }

        const article = await Article.create({
          title,
          summary: json.summary || json.desc || '',
          content: formatForQuill(json.content || json.text || ''),
          date: json.publish_date || json.date || new Date().toISOString().split('T')[0],
          category: json.tags || json.category || '行业动态',
          aiAnalysis: formatForQuill(json.ai_analysis || json.aiAnalysis || ''),
          sourceUrl: json.original_url || json.sourceUrl || json.source_url || json.url || '',
          isHidden: false,
        });

        results.push({ filename: file.originalname, success: true, title: article.title, id: article.id });
      } catch (err: any) {
        results.push({ filename: file.originalname, success: false, error: err.message || '解析失败' });
      } finally {
        try { fs.unlinkSync(file.path); } catch {}
      }
    }

    res.json({ results });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all articles (public, only visible ones unless authenticated)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const isAdmin = req.query.admin === 'true';
    const search = req.query.search as string;
    const category = req.query.category as string;
    const page = parseInt(req.query.page as string) || 0;
    const limit = parseInt(req.query.limit as string) || 10;
    const order = (req.query.order as string) === 'asc' ? 'ASC' : 'DESC';

    const whereClause: any = isAdmin ? {} : { isHidden: false };

    if (category) {
      whereClause.category = { [Op.like]: `%${category}%` };
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { summary: { [Op.like]: `%${search}%` } },
      ];
    }

    if (page > 0) {
      const total = await Article.count({ where: whereClause });
      const articles = await Article.findAll({
        where: whereClause,
        order: [['date', order]],
        limit,
        offset: (page - 1) * limit,
      });
      res.json({ articles, total, page, totalPages: Math.ceil(total / limit) });
      return;
    }

    const articles = await Article.findAll({
      where: whereClause,
      order: [['date', order]],
    });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single article
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const article = await Article.findByPk(Number(req.params.id));
    if (!article) {
      res.status(404).json({ message: 'Article not found' });
      return;
    }
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create article (protected)
router.post('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const article = await Article.create(req.body);
    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Update article (protected)
router.put('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const article = await Article.findByPk(Number(req.params.id));
    if (!article) {
      res.status(404).json({ message: 'Article not found' });
      return;
    }
    await article.update(req.body);
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete article (protected)
router.delete('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const article = await Article.findByPk(Number(req.params.id));
    if (!article) {
      res.status(404).json({ message: 'Article not found' });
      return;
    }
    await article.destroy();
    res.json({ message: 'Article deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle hidden status (protected)
router.patch('/:id/toggle-visibility', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const article = await Article.findByPk(Number(req.params.id));
    if (!article) {
      res.status(404).json({ message: 'Article not found' });
      return;
    }
    await article.update({ isHidden: !article.isHidden });
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
