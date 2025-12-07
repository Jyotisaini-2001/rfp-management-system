import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rfpRoutes from './routes/rfp.routes';
import vendorRoutes from './routes/vendor.routes';
import proposalRoutes from './routes/proposal.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Email test endpoint
app.get('/api/email/test', async (req, res) => {
  try {
    const { EmailService } = await import('./services/email.service');
    const isConfigured = !!(
      process.env.SMTP_HOST &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD &&
      process.env.FROM_EMAIL
    );

    if (!isConfigured) {
      return res.status(400).json({
        configured: false,
        error: 'Email not configured',
        message: 'Missing SMTP configuration in .env file',
        required: ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD', 'FROM_EMAIL'],
      });
    }

    const verified = await EmailService.verifyConnection();
    res.json({
      configured: true,
      verified,
      smtp: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || '587',
        user: process.env.SMTP_USER,
        from: process.env.FROM_EMAIL,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      configured: false,
      error: error.message,
    });
  }
});

// API Routes
app.use('/api/rfps', rfpRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/proposals', proposalRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 API docs available at http://localhost:${PORT}/health`);
  console.log(`🌍 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

export default app;
