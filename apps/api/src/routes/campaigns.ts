import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { AuthRequest } from '../middleware/auth';

const router = Router();

const campaignSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional()
});

const addLeadSchema = z.object({
  businessId: z.string()
});

router.post('/', async (req: AuthRequest, res: Response) => {
  const { name, description } = campaignSchema.parse(req.body);

  const campaign = await prisma.campaign.create({
    data: {
      userId: req.user.id,
      name,
      description
    }
  });

  return res.json({
    success: true,
    data: campaign
  });
});

router.get('/', async (req: AuthRequest, res: Response) => {
  const campaigns = await prisma.campaign.findMany({
    where: { userId: req.user.id },
    include: {
      leads: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return res.json({
    success: true,
    data: campaigns
  });
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const campaign = await prisma.campaign.findFirst({
    where: {
      id,
      userId: req.user.id
    },
    include: {
      leads: {
        include: {
          business: {
            include: {
              locations: true,
              contacts: true,
              websites: true
            }
          }
        }
      }
    }
  });

  if (!campaign) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Campaign not found' }
    });
  }

  return res.json({
    success: true,
    data: campaign
  });
});

router.patch('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, description } = campaignSchema.parse(req.body);

  const campaign = await prisma.campaign.updateMany({
    where: {
      id,
      userId: req.user.id
    },
    data: { name, description }
  });

  if (!campaign.count) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Campaign not found' }
    });
  }

  return res.json({
    success: true,
    data: campaign
  });
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  await prisma.campaign.deleteMany({
    where: {
      id,
      userId: req.user.id
    }
  });

  return res.json({
    success: true,
    data: null
  });
});

router.post('/:id/leads', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { businessId } = addLeadSchema.parse(req.body);

  const campaign = await prisma.campaign.findFirst({
    where: {
      id,
      userId: req.user.id
    }
  });

  if (!campaign) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Campaign not found' }
    });
  }

  const lead = await prisma.campaignLead.create({
    data: {
      campaignId: id,
      businessId
    }
  });

  return res.json({
    success: true,
    data: lead
  });
});

router.delete('/:id/leads/:leadId', async (req: AuthRequest, res: Response) => {
  const { id, leadId } = req.params;

  await prisma.campaignLead.deleteMany({
    where: {
      id: leadId,
      campaignId: id,
      campaign: {
        userId: req.user.id
      }
    }
  });

  return res.json({
    success: true,
    data: null
  });
});

router.patch('/:id/leads/:leadId', async (req: AuthRequest, res: Response) => {
  const { id, leadId } = req.params;
  const { status, notes } = req.body;

  const lead = await prisma.campaignLead.updateMany({
    where: {
      id: leadId,
      campaignId: id,
      campaign: {
        userId: req.user.id
      }
    },
    data: { status, notes }
  });

  if (!lead.count) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Lead not found' }
    });
  }

  return res.json({
    success: true,
    data: lead
  });
});

export default router;