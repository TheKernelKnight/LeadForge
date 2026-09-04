import { Router, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';
import { MockBusinessProvider } from '../services/MockBusinessProvider';
import { OpportunityScoringService } from '../services/OpportunityScoring';

const router = Router();
const provider = new MockBusinessProvider();
const scoringService = new OpportunityScoringService();

router.get('/saved', async (req: AuthRequest, res: Response) => {
  const savedLeads = await prisma.savedLead.findMany({
    where: { userId: req.user.id },
    include: {
      business: {
        include: {
          locations: true,
          contacts: true,
          websites: true,
          socials: true,
          signals: true,
          leadScores: true
        }
      },
      tags: {
        include: { tag: true }
      },
      notes: true
    },
    orderBy: { updatedAt: 'desc' }
  });

  return res.json({
    success: true,
    data: savedLeads
  });
});

router.post('/:id/save', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const existing = await prisma.savedLead.findUnique({
    where: {
      userId_businessId: {
        userId: req.user.id,
        businessId: id
      }
    }
  });

  if (existing) {
    return res.status(400).json({
      success: false,
      error: { code: 'ALREADY_SAVED', message: 'Lead already saved' }
    });
  }

  const savedLead = await prisma.savedLead.create({
    data: {
      userId: req.user.id,
      businessId: id,
      status: 'NEW'
    },
    include: {
      business: true
    }
  });

  return res.json({
    success: true,
    data: savedLead
  });
});

router.delete('/:id/save', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  await prisma.savedLead.delete({
    where: {
      userId_businessId: {
        userId: req.user.id,
        businessId: id
      }
    }
  });

  return res.json({
    success: true,
    data: null
  });
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const business = await provider.getBusiness(id);
  if (!business) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Business not found' }
    });
  }

  const score = scoringService.calculateScore(business);

  const saved = await prisma.savedLead.findUnique({
    where: {
      userId_businessId: {
        userId: req.user.id,
        businessId: id
      }
    }
  });

  return res.json({
    success: true,
    data: {
      ...business,
      opportunityScore: score,
      saved: !!saved
    }
  });
});

router.post('/:id/enrich', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const job = await prisma.enrichmentJob.create({
    data: {
      businessId: id,
      type: 'contact',
      status: 'PENDING'
    }
  });

  setTimeout(async () => {
    try {
      const enriched = await provider.enrichBusiness(id);
      if (enriched) {
        await prisma.enrichmentJob.update({
          where: { id: job.id },
          data: {
            status: 'COMPLETED',
            result: enriched
          }
        });
      }
    } catch (error) {
      await prisma.enrichmentJob.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  }, 2000);

  return res.json({
    success: true,
    data: { jobId: job.id, status: 'PENDING' }
  });
});

router.get('/:id/enrich/status', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const job = await prisma.enrichmentJob.findFirst({
    where: {
      businessId: id,
      type: 'contact'
    },
    orderBy: { createdAt: 'desc' }
  });

  if (!job) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'No enrichment job found' }
    });
  }

  return res.json({
    success: true,
    data: job
  });
});

export default router;
