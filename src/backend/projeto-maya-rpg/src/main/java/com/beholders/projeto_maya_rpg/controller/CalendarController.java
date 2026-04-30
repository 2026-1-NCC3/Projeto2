package com.beholders.projeto_maya_rpg.controller;

import com.beholders.projeto_maya_rpg.model.Calendar;
import com.beholders.projeto_maya_rpg.service.CalendarService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/calendar")
public class CalendarController {

    private CalendarService calendarService;

    public CalendarController(CalendarService calendarService) {
        this.calendarService = calendarService;
    }

    @PostMapping
    public ResponseEntity<Calendar> create(@RequestBody Calendar calendar) {
        return ResponseEntity.ok(calendarService.create(calendar));
    }

    @GetMapping
    public ResponseEntity<Page<Calendar>> getAll(Pageable pageable) {
        return ResponseEntity.ok(calendarService.getAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Calendar> getById(@PathVariable Long id) {
        return ResponseEntity.ok(calendarService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Calendar> update(@PathVariable Long id, @RequestBody Calendar calendar) {
        return ResponseEntity.ok(calendarService.update(id, calendar));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        calendarService.delete(id);
        return ResponseEntity.noContent().build();
    }
}