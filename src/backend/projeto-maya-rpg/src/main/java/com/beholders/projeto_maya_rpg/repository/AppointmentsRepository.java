package com.beholders.projeto_maya_rpg.repository;

import com.beholders.projeto_maya_rpg.model.Appointments;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentsRepository extends JpaRepository<Appointments, Long> {
    List<Appointments> findByPatientId(Long patientId);
    List<Appointments> findByAdminId(Long adminId);
    List<Appointments> findByAppointmentDatetimeBetween(LocalDateTime start, LocalDateTime end);
}
