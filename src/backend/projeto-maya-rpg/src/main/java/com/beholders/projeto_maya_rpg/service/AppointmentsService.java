package com.beholders.projeto_maya_rpg.service;

import com.beholders.projeto_maya_rpg.exception.ResourceNotFoundException;
import com.beholders.projeto_maya_rpg.model.Appointments;
import com.beholders.projeto_maya_rpg.repository.AppointmentsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;


@Service
public class AppointmentsService {
    private final AppointmentsRepository appointmentsRepository;

    public AppointmentsService (AppointmentsRepository appointmentsRepository) {
        this.appointmentsRepository = appointmentsRepository;
    }

    public List<Appointments> getAll() {
        return appointmentsRepository.findAll();
    }

    public List<Appointments> getByPatientId(Long patientId) {
        return appointmentsRepository.findByPatientId(patientId);
    }

    public List<Appointments> getByAdminId(Long adminId) {
        return appointmentsRepository.findByAdminId(adminId);
    }

    public Appointments getById(Long id) {
        return appointmentsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id) );
    }

    public List<Appointments> getByDateRange(LocalDateTime start, LocalDateTime end) {
        return appointmentsRepository.findByAppointmentDatetimeBetween(start, end);
    }

    @Transactional
    public Appointments save(Appointments appointment) {
        return appointmentsRepository.save(appointment);
    }

    @Transactional
    public void delete(Long id) {
        Appointments appointment = appointmentsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        appointmentsRepository.delete(appointment);
    }

    @Transactional
    public Appointments update(Long id, Appointments updatedAppointment) {
        Appointments appointment = appointmentsRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        appointment.setAppointmentDatetime(updatedAppointment.getAppointmentDatetime());
        appointment.setNotes(updatedAppointment.getNotes());
        appointment.setPatient(updatedAppointment.getPatient());
        appointment.setAdmin(updatedAppointment.getAdmin());

        return appointmentsRepository.save(appointment);
    }
}
