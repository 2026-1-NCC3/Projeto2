package com.example.projetomayamobile_rpg.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Item genérico da lista de histórico.
 * Pode ser um cabeçalho de data (DATE_HEADER) ou uma execução de exercício (EXECUTION).
 */
public class ExecutionHistoryItem {

    public enum Type { DATE_HEADER, EXECUTION }

    private final Type type;

    // --- Campos para DATE_HEADER ---
    private LocalDate date;

    // --- Campos para EXECUTION ---
    private String exerciseName;
    private LocalDateTime executedAt;
    private int painScale;
    private boolean completed;

    private ExecutionHistoryItem(Type type) {
        this.type = type;
    }

    public static ExecutionHistoryItem asHeader(LocalDate date) {
        ExecutionHistoryItem item = new ExecutionHistoryItem(Type.DATE_HEADER);
        item.date = date;
        return item;
    }

    public static ExecutionHistoryItem asExecution(
            String exerciseName, LocalDateTime executedAt, int painScale, boolean completed) {
        ExecutionHistoryItem item = new ExecutionHistoryItem(Type.EXECUTION);
        item.exerciseName = exerciseName;
        item.executedAt   = executedAt;
        item.painScale    = painScale;
        item.completed    = completed;
        return item;
    }

    public Type getType() { return type; }
    public LocalDate getDate() { return date; }
    public String getExerciseName() { return exerciseName; }
    public LocalDateTime getExecutedAt() { return executedAt; }
    public int getPainScale() { return painScale; }
    public boolean isCompleted() { return completed; }
}