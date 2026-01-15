import { Router } from 'express';
import { appointmentController } from '../controllers/appointment.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';
import { bookAppointmentSchema } from '../validators/appointment.validator';

const router = Router();

router.get('/available', appointmentController.getAvailableSlots.bind(appointmentController));

router.post(
    '/book',
    authenticate,
    validate(bookAppointmentSchema),
    appointmentController.bookAppointment.bind(appointmentController)
);

router.get(
    '/my-appointments',
    authenticate,
    appointmentController.getUserAppointments.bind(appointmentController)
);

router.delete(
    '/:id/cancel',
    authenticate,
    appointmentController.cancelAppointment.bind(appointmentController)
);

export default router;
