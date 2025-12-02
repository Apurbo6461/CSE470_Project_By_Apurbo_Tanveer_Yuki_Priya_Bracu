import express from 'express';
import {
  getDoctors,
  getDoctorById,
  createDoctor
} from '../controllers/doctorController.js';

const router = express.Router();

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.post('/', createDoctor);

export default router;
