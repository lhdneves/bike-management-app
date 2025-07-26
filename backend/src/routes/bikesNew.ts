import { Router } from 'express';
import { auth } from '../middleware/authNew';
import {
  getBikes,
  getBikeById,
  createBike,
  updateBike,
  deleteBike,
  getBikeStats
} from '../controllers/bikeController';
import {
  getBikeComponents,
  createComponent
} from '../controllers/componentController';

const router = Router();

// All bike routes require authentication
router.use(auth);

// Bike routes
router.get('/', getBikes);
router.post('/', createBike);
router.get('/stats', getBikeStats);

// Component routes (nested under bikes) - must come before /:id routes
router.get('/:bikeId/components', getBikeComponents);
router.post('/:bikeId/components', createComponent);

// Individual bike routes - must come after component routes
router.get('/:id', getBikeById);
router.put('/:id', updateBike);
router.delete('/:id', deleteBike);

export default router;