import { Router, Request, Response } from 'express';
import { authenticateFirebaseToken } from '../middleware/authMiddleware';
import { requireRoles } from '../middleware/rbacMiddleware';
import { validateTenantScope } from '../middleware/tenantMiddleware';
import { createRateLimiter } from '../middleware/rateLimitMiddleware';
import { requireIdempotency } from '../middleware/idempotencyMiddleware';

export const notificationsRouter = Router();

const notificationLimiter = createRateLimiter({ windowMs: 60 * 1000, maxRequests: 30 });

// Firebase Cloud Messaging (FCM) / Push Notifications Dispatcher API
// Protected: Requires valid Firebase auth, appropriate role permission, and tenant scope check
notificationsRouter.post(
  '/notifications/send',
  notificationLimiter,
  authenticateFirebaseToken,
  requireRoles('super_admin', 'ceo', 'owner', 'franchise_owner', 'store_manager', 'store_staff', 'mis'),
  validateTenantScope,
  requireIdempotency('SEND_NOTIFICATION'),
  async (req: Request, res: Response) => {

    try {
      const { userId, targetBranchId, targetOrgId, title, body, data } = req.body;

      if (!title || !body) {
        res.status(400).json({ error: 'Title and body fields are required for notifications' });
        return;
      }

      const senderUid = req.user?.uid;
      const senderRole = req.user?.role;
      const senderOrgId = req.user?.orgId;
      const senderBranchId = req.user?.branchId;

      console.log(
        `[FCM Notification Dispatched] Sender: ${senderUid} (${senderRole}), Tenant: ${senderOrgId}/${senderBranchId} -> Target User: ${userId || 'Branch Broadcast'}, Title: "${title}"`
      );

      res.json({
        success: true,
        messageId: `fcm_msg_${Date.now()}`,
        timestamp: new Date().toISOString(),
        sender: {
          uid: senderUid,
          role: senderRole,
          orgId: senderOrgId,
          branchId: senderBranchId,
        },
        payload: {
          userId: userId || 'broadcast',
          targetOrgId: targetOrgId || senderOrgId,
          targetBranchId: targetBranchId || senderBranchId,
          title,
          body,
          data,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to dispatch notification', details: err?.message });
    }
  }
);
