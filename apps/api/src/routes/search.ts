import { Router, Response } from 'express';
import { z } from 'zod';
import { MockBusinessProvider } from '../services/MockBusinessProvider';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';

const router = Router();
const provider = new MockBusinessProvider();

const searchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  employeeRange: z.string().optional(),
  hasWebsite: z.boolean().optional(),
  hasPhone: z.boolean().optional(),
  hasEmail: z.boolean().optional(),
  bookingProvider: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(25),
  sortBy: z.enum(['score', 'name', 'location', 'createdAt']).default('score'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

router.post('/', async (req: AuthRequest, res: Response) => {
  const params = searchSchema.parse(req.body);
  
  const results = await provider.searchBusinesses(params);
  
  await prisma.search.create({
    data: {
      userId: req.user.id,
      query: params,
      results: results.total
    }
  });

  const search = await prisma.search.findFirst({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' }
  });

  if (search) {
    await Promise.all(
      results.items.map((item, index) => 
        prisma.searchResult.create({
          data: {
            searchId: search.id,
            businessId: item.id,
            position: index + 1
          }
        })
      )
    );
  }

  res.json({
    success: true,
    data: {
      items: results.items,
      pagination: {
        page: results.page,
        limit: results.limit,
        total: results.total,
        totalPages: Math.ceil(results.total / results.limit)
      }
    }
  });
});

router.get('/history', async (req: AuthRequest, res: Response) => {
  const searches = await prisma.search.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  res.json({
    success: true,
    data: searches
  });
});

export default router;
