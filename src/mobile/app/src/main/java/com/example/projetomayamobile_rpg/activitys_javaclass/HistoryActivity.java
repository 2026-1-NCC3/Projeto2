package com.example.projetomayamobile_rpg.activitys_javaclass;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.projetomayamobile_rpg.R;
import com.example.projetomayamobile_rpg.adapters.HistoryExecutionAdapter;
import com.example.projetomayamobile_rpg.model.ExecutionHistoryItem;
import com.example.projetomayamobile_rpg.model.ExecutionResponse;
import com.example.projetomayamobile_rpg.model.PageResponse;
import com.example.projetomayamobile_rpg.model.PlanExerciseResponse;
import com.example.projetomayamobile_rpg.model.PlanResponse;
import com.example.projetomayamobile_rpg.network.ApiService;
import com.example.projetomayamobile_rpg.network.RetrofitClient;
import com.example.projetomayamobile_rpg.utils.DateUtils;
import com.google.android.material.bottomnavigation.BottomNavigationView;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class HistoryActivity extends AppCompatActivity {

    private TextView tvValueAdesao, tvValueDias, tvValueDor;
    private RecyclerView rvExecutionHistory;
    private BottomNavigationView bottomNav;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.history_activity);

        tvValueAdesao     = findViewById(R.id.valueAdesao);
        tvValueDias       = findViewById(R.id.valueDias);
        tvValueDor        = findViewById(R.id.valueDor);
        rvExecutionHistory = findViewById(R.id.rvExecutionHistory);
        bottomNav          = findViewById(R.id.bottomNav);

        rvExecutionHistory.setLayoutManager(new LinearLayoutManager(this));

        setupBottomNav();
        loadHistoryData();
    }

    // ── Carregamento de dados ──────────────────────────────────────────────────

    private void loadHistoryData() {
        SharedPreferences prefs = getSharedPreferences("auth", MODE_PRIVATE);
        long patientId = prefs.getLong("patient_id", -1L);

        if (patientId == -1L) {
            showEmptyState("Sessão inválida. Faça login novamente.");
            return;
        }

        ApiService api = RetrofitClient.getInstance(this).create(ApiService.class);

        // Busca até 100 planos do paciente (suficiente para histórico)
        api.getPlansByPatient(patientId, 0, 100).enqueue(new Callback<PageResponse<PlanResponse>>() {
            @Override
            public void onResponse(Call<PageResponse<PlanResponse>> call,
                                   Response<PageResponse<PlanResponse>> response) {
                if (!response.isSuccessful() || response.body() == null
                        || response.body().getContent() == null) {
                    showEmptyState("Não foi possível carregar o histórico.");
                    return;
                }
                processPlansData(response.body().getContent());
            }

            @Override
            public void onFailure(Call<PageResponse<PlanResponse>> call, Throwable t) {
                showEmptyState("Erro de conexão.");
            }
        });
    }

    // ── Processamento dos dados ────────────────────────────────────────────────

    private void processPlansData(List<PlanResponse> plans) {
        // Achata todas as execuções de todos os planos/exercícios
        List<ExecutionEntry> allExecutions = new ArrayList<>();

        for (PlanResponse plan : plans) {
            if (plan.getPlanExercises() == null) continue;

            for (PlanExerciseResponse pe : plan.getPlanExercises()) {
                if (pe.getExercise() == null || pe.getExecutions() == null) continue;

                String exerciseName = pe.getExercise().getName();

                for (ExecutionResponse exec : pe.getExecutions()) {
                    LocalDateTime dt = DateUtils.parseDateTime(exec.getExecutedAt());
                    if (dt == null) continue; // ignora datas inválidas

                    allExecutions.add(new ExecutionEntry(
                            exerciseName, dt, exec.getPainScale(), exec.isCompleted()));
                }
            }
        }

        // Ordena da mais recente para a mais antiga
        allExecutions.sort((a, b) -> b.executedAt.compareTo(a.executedAt));

        // ── Métricas ──────────────────────────────────────────────────────────

        LocalDate today   = LocalDate.now();
        LocalDate weekAgo = today.minusDays(7);

        // 1. Taxa de Adesão (última semana)
        long totalSemana     = countInPeriod(allExecutions, weekAgo, null);
        long completedSemana = countCompletedInPeriod(allExecutions, weekAgo);
        int adherence = totalSemana == 0 ? 0 : (int) (completedSemana * 100L / totalSemana);

        // 2. Dias Consecutivos
        int consecutive = calculateConsecutiveDays(allExecutions, today);

        // 3. Nível de Dor mais Frequente (última semana)
        String painLabel = calculateMostFrequentPain(allExecutions, weekAgo);

        // 4. Lista de histórico agrupada por data
        List<ExecutionHistoryItem> historyItems = buildHistoryList(allExecutions);

        // ── Atualiza UI na main thread ─────────────────────────────────────────
        runOnUiThread(() -> {
            tvValueAdesao.setText(adherence + "%");
            tvValueDias.setText(String.valueOf(consecutive));
            tvValueDor.setText(painLabel);

            if (historyItems.isEmpty()) {
                tvValueAdesao.setText("–");
                tvValueDias.setText("0");
                tvValueDor.setText("Sem dados");
            }

            HistoryExecutionAdapter adapter = new HistoryExecutionAdapter(historyItems);
            rvExecutionHistory.setAdapter(adapter);
        });
    }

    // ── Cálculos ──────────────────────────────────────────────────────────────

    /** Conta execuções a partir de 'from' (inclusive) */
    private long countInPeriod(List<ExecutionEntry> list, LocalDate from, LocalDate to) {
        return list.stream()
                .filter(e -> {
                    LocalDate d = e.executedAt.toLocalDate();
                    boolean afterFrom = !d.isBefore(from);
                    boolean beforeTo  = (to == null) || !d.isAfter(to);
                    return afterFrom && beforeTo;
                })
                .count();
    }

    /** Conta execuções concluídas a partir de 'from' (inclusive) */
    private long countCompletedInPeriod(List<ExecutionEntry> list, LocalDate from) {
        return list.stream()
                .filter(e -> !e.executedAt.toLocalDate().isBefore(from) && e.completed)
                .count();
    }

    /**
     * Calcula a sequência de dias consecutivos com pelo menos uma execução,
     * contando para trás a partir de hoje.
     */
    private int calculateConsecutiveDays(List<ExecutionEntry> executions, LocalDate today) {
        Set<LocalDate> activeDays = new HashSet<>();
        for (ExecutionEntry e : executions) {
            activeDays.add(e.executedAt.toLocalDate());
        }

        int streak = 0;
        LocalDate cursor = today;
        while (activeDays.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }

    /**
     * Retorna o nível de dor mais frequente nas execuções da última semana.
     * Usa a moda da escala painScale (0–10).
     */
    private String calculateMostFrequentPain(List<ExecutionEntry> executions, LocalDate weekAgo) {
        Map<Integer, Integer> freq = new HashMap<>();
        for (ExecutionEntry e : executions) {
            if (!e.executedAt.toLocalDate().isBefore(weekAgo)) {
                freq.merge(e.painScale, 1, Integer::sum);
            }
        }
        if (freq.isEmpty()) return "Sem dados";

        int modeScale = Collections.max(freq.entrySet(), Map.Entry.comparingByValue()).getKey();
        return DateUtils.mapPainScale(modeScale);
    }

    /**
     * Constrói a lista de itens do RecyclerView agrupada por data:
     *   [Header "Segunda, 08 de maio"]
     *   [Execução: Alongamento Cervical · 10:30 · Dor leve]
     *   ...
     */
    private List<ExecutionHistoryItem> buildHistoryList(List<ExecutionEntry> executions) {
        List<ExecutionHistoryItem> items = new ArrayList<>();
        LocalDate lastDate = null;

        for (ExecutionEntry e : executions) {
            LocalDate date = e.executedAt.toLocalDate();
            if (!date.equals(lastDate)) {
                items.add(ExecutionHistoryItem.asHeader(date));
                lastDate = date;
            }
            items.add(ExecutionHistoryItem.asExecution(
                    e.exerciseName, e.executedAt, e.painScale, e.completed));
        }
        return items;
    }

    // ── Estado vazio ───────────────────────────────────────────────────────────

    private void showEmptyState(String message) {
        runOnUiThread(() -> {
            tvValueAdesao.setText("–");
            tvValueDias.setText("0");
            tvValueDor.setText("Sem dados");
            Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
        });
    }

    // ── Navegação inferior ─────────────────────────────────────────────────────

    private void setupBottomNav() {
        bottomNav.setSelectedItemId(R.id.menu_history);
        bottomNav.setOnItemSelectedListener(item -> {
            int id = item.getItemId();
            if (id == R.id.menu_home) {
                startActivity(new Intent(this, DashboardActivity.class));
                return true;
            }
            if (id == R.id.menu_exercises) {
                startActivity(new Intent(this, ExercisesActivity.class));
                return true;
            }
            if (id == R.id.menu_history) return true;
            if (id == R.id.menu_profile) {
                startActivity(new Intent(this, ProfileActivity.class));
                return true;
            }
            return false;
        });
    }

    // ── Modelo interno de execução (para processamento) ────────────────────────

    private static class ExecutionEntry {
        final String exerciseName;
        final LocalDateTime executedAt;
        final int painScale;
        final boolean completed;

        ExecutionEntry(String exerciseName, LocalDateTime executedAt, int painScale, boolean completed) {
            this.exerciseName = exerciseName;
            this.executedAt   = executedAt;
            this.painScale    = painScale;
            this.completed    = completed;
        }
    }
}