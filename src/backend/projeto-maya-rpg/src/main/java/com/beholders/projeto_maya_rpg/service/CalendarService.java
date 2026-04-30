package com.beholders.projeto_maya_rpg.service;

import com.beholders.projeto_maya_rpg.exception.ResourceNotFoundException;
import com.beholders.projeto_maya_rpg.model.Calendar;
import com.beholders.projeto_maya_rpg.repository.CalendarRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CalendarService {
    private CalendarRepository calendarRepository;

    public CalendarService(CalendarRepository calendarRepository) {
        this.calendarRepository = calendarRepository;
    }

    @Transactional
    public Calendar create(Calendar calendar) {
        return calendarRepository.save(calendar);
    }

    public Page<Calendar> getAll(Pageable pageable) {
        return calendarRepository.findAll(pageable);
    }

    public Calendar getById(Long id) {
        return calendarRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Calendário não encontrado"));
    }

    @Transactional
    public Calendar update(Long id, Calendar calendar) {
        Calendar existingCalendar = calendarRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Calendário não encontrado"));

        existingCalendar.setTitle(calendar.getTitle());
        existingCalendar.setDescription(calendar.getDescription());
        existingCalendar.setDateTime(calendar.getDateTime());
        existingCalendar.setPatient(calendar.getPatient());

        return calendarRepository.save(existingCalendar);
    }

    @Transactional
    public void delete(Long id) {
        Calendar calendar = calendarRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Calendário não encontrado"));

        calendarRepository.delete(calendar);
    }
}
