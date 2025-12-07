import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const VendorSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  contactPerson: z.string().min(1),
  phone: z.string().optional(),
  category: z.any().optional(),
  notes: z.string().optional(),
});

export class VendorController {
  // Create a new vendor
  static async create(req: Request, res: Response) {
    try {
      console.log('Received vendor data:', req.body);
      const data = VendorSchema.parse(req.body);

      // Convert category array to string if needed
      const categoryStr = Array.isArray(data.category) ? data.category.join(', ') : data.category;

      const vendor = await prisma.vendor.create({
        data: {
          ...data,
          category: categoryStr,
        },
      });

      res.status(201).json(vendor);
    } catch (error: any) {
      console.error('Vendor creation error:', error);
      if (error.name === 'ZodError' || error.constructor.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'Vendor with this email already exists' });
      }
      res.status(500).json({ error: 'Failed to create vendor', details: error.message });
    }
  }

  // Get all vendors
  static async getAll(req: Request, res: Response) {
    try {
      const vendors = await prisma.vendor.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { proposals: true },
          },
        },
      });

      res.json(vendors);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch vendors', details: error.message });
    }
  }

  // Get single vendor
  static async getOne(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const vendor = await prisma.vendor.findUnique({
        where: { id },
        include: {
          proposals: {
            include: {
              rfp: {
                select: { id: true, title: true, status: true },
              },
            },
          },
        },
      });

      if (!vendor) {
        return res.status(404).json({ error: 'Vendor not found' });
      }

      res.json(vendor);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch vendor', details: error.message });
    }
  }

  // Update vendor
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = VendorSchema.partial().parse(req.body);

      const vendor = await prisma.vendor.update({
        where: { id },
        data,
      });

      res.json(vendor);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Vendor not found' });
      }
      res.status(500).json({ error: 'Failed to update vendor', details: error.message });
    }
  }

  // Delete vendor
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.vendor.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Vendor not found' });
      }
      res.status(500).json({ error: 'Failed to delete vendor', details: error.message });
    }
  }
}
