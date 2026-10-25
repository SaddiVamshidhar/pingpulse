import { Router } from 'express';
import {
  health,
  getAllMonitors,
  getMonitor,
  createMonitor,
  updateMonitor,
  toggleMonitor,
  deleteMonitor,
  getChecks,
  getStatusSummary,
} from '../controllers/monitorController.js';

const router = Router();

router.get('/health', health);
router.get('/status', getStatusSummary);

router.route('/monitors').get(getAllMonitors).post(createMonitor);
router.route('/monitors/:id').get(getMonitor).put(updateMonitor).delete(deleteMonitor);
router.patch('/monitors/:id/toggle', toggleMonitor);
router.get('/monitors/:id/checks', getChecks);

export default router;
