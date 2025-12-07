import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AIService } from '../services/ai.service';
import { EmailService } from '../services/email.service';
import { parseRFP, parseProposal } from '../utils/db-helpers';

const prisma = new PrismaClient();

const CreateRFPSchema = z.object({
  input: z.string().min(10),
});

const SendRFPSchema = z.object({
  vendorIds: z.array(z.string().uuid()).min(1),
});

export class RFPController {
  // Create RFP from natural language
  static async create(req: Request, res: Response) {
    try {
      const { input } = CreateRFPSchema.parse(req.body);

      // Use AI to parse natural language into structured RFP
      const structuredRFP = await AIService.parseRFPFromNaturalLanguage(input);

      // Save to database
      const rfp = await prisma.rFP.create({
        data: {
          title: structuredRFP.title,
          rawInput: input,
          status: 'DRAFT',
          items: structuredRFP.items as any,
          budget: structuredRFP.budget as any,
          timeline: structuredRFP.timeline as any,
          terms: structuredRFP.terms as any,
          requirements: structuredRFP.requirements as any,
        },
      });

      res.status(201).json(rfp);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create RFP', details: error.message });
    }
  }

  // Get all RFPs
  static async getAll(req: Request, res: Response) {
    try {
      const rfps = await prisma.rFP.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { proposals: true, vendors: true },
          },
        },
      });

      res.json(rfps);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch RFPs', details: error.message });
    }
  }

  // Get single RFP with proposals
  static async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const rfp = await prisma.rFP.findUnique({
        where: { id },
        include: {
          vendors: {
            include: {
              vendor: true,
            },
          },
          proposals: {
            include: {
              vendor: {
                select: { id: true, name: true, email: true },
              },
            },
            orderBy: { score: 'desc' },
          },
        },
      });

      if (!rfp) {
        return res.status(404).json({ error: 'RFP not found' });
      }

      res.json(rfp);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch RFP', details: error.message });
    }
  }

  // Update RFP
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, status, items, budget, timeline, terms, requirements } = req.body;

      const rfp = await prisma.rFP.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(status && { status }),
          ...(items && { items }),
          ...(budget && { budget }),
          ...(timeline && { timeline }),
          ...(terms && { terms }),
          ...(requirements && { requirements }),
        },
      });

      res.json(rfp);
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'RFP not found' });
      }
      res.status(500).json({ error: 'Failed to update RFP', details: error.message });
    }
  }

  // Delete RFP
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.rFP.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'RFP not found' });
      }
      res.status(500).json({ error: 'Failed to delete RFP', details: error.message });
    }
  }

  // Send RFP to vendors via email
  static async send(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { vendorIds } = SendRFPSchema.parse(req.body);

      // Get RFP
      const rfp = await prisma.rFP.findUnique({
        where: { id },
      });

      if (!rfp) {
        return res.status(404).json({ error: 'RFP not found' });
      }

      // Get vendors
      const vendors = await prisma.vendor.findMany({
        where: { id: { in: vendorIds } },
      });

      if (vendors.length === 0) {
        return res.status(404).json({ error: 'No vendors found' });
      }

      // Send emails and create RFPVendor records
      const results = await Promise.allSettled(
        vendors.map(async (vendor: any) => {
          try {
            await EmailService.sendRFP(vendor.email, vendor.name, rfp);

            // Create or update RFPVendor record
            await prisma.rFPVendor.upsert({
              where: {
                rfpId_vendorId: {
                  rfpId: id,
                  vendorId: vendor.id,
                },
              },
              create: {
                rfpId: id,
                vendorId: vendor.id,
                sentAt: new Date(),
              },
              update: {
                sentAt: new Date(),
              },
            });

            return { success: true, vendor: vendor.name };
          } catch (error) {
            return { success: false, vendor: vendor.name, error };
          }
        })
      );

      // Update RFP status
      await prisma.rFP.update({
        where: { id },
        data: { status: 'SENT' },
      });

      const successful = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      res.json({
        message: `RFP sent to ${successful} vendors`,
        successful,
        failed,
        results,
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to send RFP', details: error.message });
    }
  }

  // Compare proposals for an RFP
  static async compare(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Get RFP with proposals
      const rfp = await prisma.rFP.findUnique({
        where: { id },
        include: {
          proposals: {
            include: {
              vendor: true,
            },
            where: {
              status: { in: ['PARSED', 'EVALUATED'] },
            },
          },
        },
      });

      if (!rfp) {
        return res.status(404).json({ error: 'RFP not found' });
      }

      if (rfp.proposals.length === 0) {
        return res.status(400).json({ error: 'No proposals to compare' });
      }

      // Use AI to compare proposals
      const comparison = await AIService.compareProposals(rfp, rfp.proposals);

      // Update proposal scores
      await Promise.all(
        comparison.rankings.map(async (ranking: any) => {
          const proposal = rfp.proposals.find((p:any) => p.vendorId === ranking.vendorId);
          if (proposal) {
            await prisma.proposal.update({
              where: { id: proposal.id },
              data: {
                score: ranking.score,
                evaluation: ranking,
                status: 'EVALUATED',
              },
            });
          }
        })
      );

      // Update RFP status
      await prisma.rFP.update({
        where: { id },
        data: { status: 'EVALUATING' },
      });

      res.json(comparison);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to compare proposals', details: error.message });
    }
  }
}
