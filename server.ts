import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import { correlationMiddleware } from './server/middleware/correlationMiddleware';
import { securityHeadersMiddleware, corsMiddleware } from './server/middleware/securityHeaders';
import { globalErrorHandler, registerProcessFailureHandlers } from './server/middleware/errorHandler';
import { ProcessLifecycleService } from './server/services/processLifecycleService';
import { healthRouter } from './server/routes/health';
import { aiChatRouter } from './server/routes/aiChat';
import { garmentAiRouter } from './server/routes/garmentAi';
import { placesRouter } from './server/routes/places';
import { paymentsRouter } from './server/routes/payments';
import { notificationsRouter } from './server/routes/notifications';
import { franchiseRouter } from './server/routes/franchise';
import { inventoryRouter } from './server/routes/inventory';
import { commercialRouter } from './server/routes/commercial';
import { financeRouter } from './server/routes/finance';
import { procurementRouter } from './server/routes/procurement';
import { ordersRouter } from './server/routes/orders';
import { customerMeasurementsRouter } from './server/routes/customerMeasurements';
import { analyticsRouter } from './server/routes/analytics';
import { operationsRouter } from './server/routes/operations';

// Register process-level failure and OS termination signal handlers
registerProcessFailureHandlers();
ProcessLifecycleService.registerSignalHandlers();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));
app.use(ProcessLifecycleService.trackRequestMiddleware());
app.use(correlationMiddleware);
app.use(securityHeadersMiddleware);
app.use(corsMiddleware);

// Mount Health Probes
app.use('/', healthRouter);
app.use('/api', healthRouter);

// Mount Enterprise API Routers
app.use('/api', aiChatRouter);
app.use('/api', garmentAiRouter);
app.use('/api', placesRouter);
app.use('/api', paymentsRouter);
app.use('/api', notificationsRouter);
app.use('/api', franchiseRouter);
app.use('/api', inventoryRouter);
app.use('/api', commercialRouter);
app.use('/api', financeRouter);
app.use('/api', procurementRouter);
app.use('/api', ordersRouter);
app.use('/api', customerMeasurementsRouter);
app.use('/api', analyticsRouter);
app.use('/api', operationsRouter);

// Mount Terminal Global Error Handler Middleware
app.use(globalErrorHandler);

// Serve Vite Dev Middleware or Static Production Files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`FabriQ AI Enterprise Express Server listening on http://0.0.0.0:${PORT}`);
  });

  ProcessLifecycleService.setHttpServer(server);
}

startServer();
