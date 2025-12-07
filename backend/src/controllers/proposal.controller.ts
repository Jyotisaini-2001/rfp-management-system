import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AIService } from '../services/ai.service';

const prisma = new PrismaClient();

const InboundProposalSchema = z.object({
  rfpId: z.string().uuid(),
  vendorId: z.string().uuid(),
  email: z.string().min(10),
  subject: z.string().optional(),
});

export class ProposalController {
  // Receive inbound vendor proposal via email
  static async receiveInbound(req: Request, res: Response) {
    try {
      const { rfpId, vendorId, email, subject } = InboundProposalSchema.parse(req.body);

      // Get RFP context
      const rfp = await prisma.rFP.findUnique({
        where: { id: rfpId },
      });

      if (!rfp) {
        return res.status(404).json({ error: 'RFP not found' });
      }

      // Get vendor
      const vendor = await prisma.vendor.findUnique({
        where: { id: vendorId },
      });

      if (!vendor) {
        return res.status(404).json({ error: 'Vendor not found' });
      }

      // Use AI to parse email into structured data
      const parsedData = await AIService.parseProposalFromEmail(rfp, email);

      // Create proposal
      const proposal = await prisma.proposal.create({
        data: {
          rfpId,
          vendorId,
          rawEmail: email,
          emailSubject: subject,
          parsedData,
          status: 'PARSED',
        },
        include: {
          vendor: {
            select: { id: true, name: true, email: true },
          },
          rfp: {
            select: { id: true, title: true },
          },
        },
      });

      res.status(201).json(proposal);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to receive proposal', details: error.message });
    }
  }

  // Get all proposals for an RFP
  static async getByRFP(req: Request, res: Response) {
    try {
      const { rfpId } = req.params;

      const proposals = await prisma.proposal.findMany({
        where: { rfpId },
        include: {
          vendor: {
            select: { id: true, name: true, email: true, contactPerson: true },
          },
        },
        orderBy: { score: 'desc' },
      });

      res.json(proposals);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch proposals', details: error.message });
    }
  }

  // Re-parse a proposal
  static async reparse(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Get proposal with RFP context
      const proposal = await prisma.proposal.findUnique({
        where: { id },
        include: {
          rfp: true,
        },
      });

      if (!proposal) {
        return res.status(404).json({ error: 'Proposal not found' });
      }

      // Re-parse with AI
      const parsedData = await AIService.parseProposalFromEmail(
        proposal.rfp,
        proposal.rawEmail
      );

      // Update proposal
      const updated = await prisma.proposal.update({
        where: { id },
        data: {
          parsedData,
          status: 'PARSED',
        },
        include: {
          vendor: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      res.json(updated);
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Proposal not found' });
      }
      res.status(500).json({ error: 'Failed to re-parse proposal', details: error.message });
    }
  }

  // Update proposal status
  static async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['RECEIVED', 'PARSED', 'EVALUATED', 'SELECTED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const proposal = await prisma.proposal.update({
        where: { id },
        data: { status },
        include: {
          vendor: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      res.json(proposal);
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Proposal not found' });
      }
      res.status(500).json({ error: 'Failed to update proposal', details: error.message });
    }
  }

  // Get single proposal
  static async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const proposal = await prisma.proposal.findUnique({
        where: { id },
        include: {
          vendor: true,
          rfp: true,
        },
      });

      if (!proposal) {
        return res.status(404).json({ error: 'Proposal not found' });
      }

      res.json(proposal);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch proposal', details: error.message });
    }
  }

  // Delete proposal
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.proposal.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Proposal not found' });
      }
      res.status(500).json({ error: 'Failed to delete proposal', details: error.message });
    }
  }
}
