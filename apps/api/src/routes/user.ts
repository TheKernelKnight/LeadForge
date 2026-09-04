import { Router } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/me', async (req: AuthRequest, res: any) => {
  res.json({
    success: true,
    data: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name
    }
  });
});

router.get('/stats', async (req: AuthRequest, res: any) => {
  const [totalLeads, savedLeads, campaigns] = await Promise.all([
    prisma.business.count(),
    prisma.savedLead.count({ where: { userId: req.user.id } }),
    prisma.campaign.count({ where: { userId: req.user.id } })
  ]);

  const highOpportunity = await prisma.business.count({
    where: {
      leadScores: {
        some: {
          score: { gte: 75 }
        }
      }
    }
  });

  res.json({
    success: true,
    data: {
      totalLeads,
      savedLeads,
      highOpportunity,
      activeCampaigns: campaigns
    }
  });
});

export default router;
