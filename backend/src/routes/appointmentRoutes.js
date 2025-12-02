import express from 'express';
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
  checkSlotAvailability
} from '../controllers/appointmentController.js';

const router = express.Router();

router.post('/', createAppointment);
router.get('/', getAppointments);
router.get('/check-availability', checkSlotAvailability);
router.get('/:id', getAppointmentById);
router.patch('/:id', updateAppointment);
router.delete('/:id', cancelAppointment);

export default router;
