package com.example.projetomayamobile_rpg.utils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Locale;

public class DateUtils {

    private static final DateTimeFormatter ISO_DT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    private static final DateTimeFormatter ISO_DT_NANOS =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSSSSSSS");

    /** Converte string ISO "2024-05-08T10:30:00" em LocalDateTime. Retorna null se falhar. */
    public static LocalDateTime parseDateTime(String raw) {
        if (raw == null || raw.isEmpty()) return null;
        try {
            return LocalDateTime.parse(raw, ISO_DT);
        } catch (DateTimeParseException e1) {
            try {
                return LocalDateTime.parse(raw, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            } catch (DateTimeParseException e2) {
                return null;
            }
        }
    }

    /** Formata uma data para exibição em PT-BR: "Segunda-feira, 08 de maio" */
    public static String formatDisplayDate(LocalDate date) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern(
                "EEEE, dd 'de' MMMM", new Locale("pt", "BR"));
        String s = date.format(fmt);
        // Capitaliza primeira letra
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }

    /** Formata horário como "HH:mm" */
    public static String formatTime(LocalDateTime dt) {
        return dt.format(DateTimeFormatter.ofPattern("HH:mm"));
    }

    /**
     * Mapeia a escala de dor (0–10) para uma descrição em PT-BR.
     * Mesma escala usada no cardHistorical da tela de histórico.
     */
    public static String mapPainScale(int scale) {
        if (scale == 0)        return "Sem dor";
        if (scale <= 2)        return "Dor mínima";
        if (scale <= 4)        return "Dor leve ou amena";
        if (scale <= 6)        return "Dor moderada";
        if (scale <= 8)        return "Dor intensa";
        return                        "Dor severa";
    }
}