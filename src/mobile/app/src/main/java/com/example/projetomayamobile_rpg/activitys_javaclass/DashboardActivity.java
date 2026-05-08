package com.example.projetomayamobile_rpg.activitys_javaclass;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.projetomayamobile_rpg.R;
import com.example.projetomayamobile_rpg.adapters.ExercisePlanAdapter;
import com.example.projetomayamobile_rpg.model.ExecutionResponse;
import com.example.projetomayamobile_rpg.model.PageResponse;
import com.example.projetomayamobile_rpg.model.PatientResponse;
import com.example.projetomayamobile_rpg.model.PlanExerciseResponse;
import com.example.projetomayamobile_rpg.model.PlanResponse;
import com.example.projetomayamobile_rpg.network.ApiService;
import com.example.projetomayamobile_rpg.network.RetrofitClient;
import com.google.android.material.bottomnavigation.BottomNavigationView;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Locale;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class DashboardActivity extends AppCompatActivity {

    private static final String TAG = "Dashboard";

    TextView patientName, progress, completed, pending, date, tvEmptyExercises;
    ProgressBar progressBar;
    RecyclerView recyclerExercises;
    ExercisePlanAdapter exercisePlanAdapter;
    List<PlanExerciseResponse> exerciseList = new ArrayList<>();

    private Long patientId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.dashboard_activity);

        patientName       = findViewById(R.id.pacientNameDashboard);
        progressBar       = findViewById(R.id.progressBar);
        completed         = findViewById(R.id.completed);
        pending           = findViewById(R.id.pending);
        progress          = findViewById(R.id.progress);
        date              = findViewById(R.id.date);
        tvEmptyExercises  = findViewById(R.id.tvEmptyExercises);
        recyclerExercises = findViewById(R.id.recyclerExercises);

        recyclerExercises.setLayoutManager(new LinearLayoutManager(this));
        exercisePlanAdapter = new ExercisePlanAdapter(exerciseList, this::onDoExercise);
        recyclerExercises.setAdapter(exercisePlanAdapter);

        SharedPreferences prefs = getSharedPreferences("auth", MODE_PRIVATE);
        patientId = prefs.getLong("patient_id", -1);

        loadPatientName();
        loadPlans();

        BottomNavigationView bottomNav = findViewById(R.id.bottomNav);
        bottomNav.setSelectedItemId(R.id.menu_home);
        bottomNav.setOnItemSelectedListener(item -> {
            int id = item.getItemId();
            if (id == R.id.menu_home) return true;
            if (id == R.id.menu_exercises) {
                startActivity(new Intent(this, ExercisesActivity.class));
                return true;
            }
            if (id == R.id.menu_history) {
                startActivity(new Intent(this, HistoryActivity.class));
                return true;
            }
            if (id == R.id.menu_profile) {
                startActivity(new Intent(this, ProfileActivity.class));
                return true;
            }
            return false;
        });

        SimpleDateFormat sdf = new SimpleDateFormat("EEEE, dd 'de' MMMM", new Locale("pt", "BR"));
        date.setText(sdf.format(new Date()));
    }

    /**
     * Verifica se o exercício está agendado para hoje.
     *
     * Suporta dois formatos de numeração que podem vir do admin:
     *
     *   Padrão Java Calendar (1-based, domingo=1):
     *     1=Domingo, 2=Segunda, 3=Terça, 4=Quarta, 5=Quinta, 6=Sexta, 7=Sábado
     *
     *   Padrão JavaScript Date.getDay() (0-based, domingo=0):
     *     0=Domingo, 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sábado
     *
     * Se daysOfWeek for nulo/vazio, o exercício aparece todos os dias.
     */
    private boolean isScheduledForToday(PlanExerciseResponse pe) {
        String daysOfWeek = pe.getDaysOfWeek();

        if (daysOfWeek == null || daysOfWeek.trim().isEmpty()) {
            return true; // sem restrição → exibe sempre
        }

        // Java Calendar: 1=Domingo, 2=Segunda, 3=Terça, 4=Quarta, 5=Quinta, 6=Sexta, 7=Sábado
        int calendarDay = Calendar.getInstance().get(Calendar.DAY_OF_WEEK);

        Log.d(TAG, "Hoje → calendarDay=" + calendarDay + " | daysOfWeek='" + daysOfWeek + "'");

        for (String part : daysOfWeek.split(",")) {
            String trimmed = part.trim();
            if (trimmed.isEmpty()) continue;
            try {
                int storedDay = Integer.parseInt(trimmed);
                if (storedDay == calendarDay) {
                    Log.d(TAG, "Match! storedDay=" + storedDay);
                    return true;
                }
            } catch (NumberFormatException e) {
                Log.w(TAG, "Valor não numérico em daysOfWeek: '" + trimmed + "'");
            }
        }

        return false;
    }

    private void loadPatientName() {
        ApiService api = RetrofitClient.getInstance(this).create(ApiService.class);
        api.getPatientById(patientId).enqueue(new Callback<PatientResponse>() {
            @Override
            public void onResponse(Call<PatientResponse> call, Response<PatientResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    patientName.setText(response.body().getName());
                }
            }
            @Override
            public void onFailure(Call<PatientResponse> call, Throwable t) {
                Log.e(TAG, "Erro ao carregar nome do paciente", t);
            }
        });
    }

    private void loadPlans() {
        ApiService api = RetrofitClient.getInstance(this).create(ApiService.class);
        api.getPlansByPatient(patientId, 0, 50).enqueue(new Callback<PageResponse<PlanResponse>>() {
            @Override
            public void onResponse(Call<PageResponse<PlanResponse>> call,
                                   Response<PageResponse<PlanResponse>> response) {
                if (!response.isSuccessful() || response.body() == null) {
                    showEmptyState();
                    return;
                }

                // ─── CORREÇÃO PRINCIPAL ───────────────────────────────────────
                // Coleta exercícios de TODOS os planos ativos, igual ao
                // ExercisesActivity. O código anterior pegava só o primeiro
                // plano ativo encontrado — se houvesse outro plano ativo antes
                // na lista (ex: um plano antigo vazio), os exercícios corretos
                // nunca chegavam ao filtro de hoje.
                // ─────────────────────────────────────────────────────────────
                List<PlanExerciseResponse> allExercises = new ArrayList<>();
                for (PlanResponse plan : response.body().getContent()) {
                    if ("ATIVO".equals(plan.getStatus()) && plan.getPlanExercises() != null) {
                        allExercises.addAll(plan.getPlanExercises());
                    }
                }

                Log.d(TAG, "Total de exercícios em planos ativos: " + allExercises.size());
                updateDashboard(allExercises);
            }

            @Override
            public void onFailure(Call<PageResponse<PlanResponse>> call, Throwable t) {
                Toast.makeText(DashboardActivity.this,
                        "Erro ao carregar planos: " + t.getMessage(), Toast.LENGTH_LONG).show();
                showEmptyState();
            }
        });
    }

    private void updateDashboard(List<PlanExerciseResponse> allExercises) {
        if (allExercises == null || allExercises.isEmpty()) {
            showEmptyState();
            return;
        }

        // Filtra exercícios agendados para hoje
        List<PlanExerciseResponse> todayExercises = new ArrayList<>();
        for (PlanExerciseResponse pe : allExercises) {
            if (pe.getExercise() != null && isScheduledForToday(pe)) {
                todayExercises.add(pe);
            }
        }

        Log.d(TAG, "Exercícios para hoje: " + todayExercises.size());

        // Conta execuções concluídas hoje
        int total = todayExercises.size();
        int completedToday = 0;
        String todayDate = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(new Date());

        for (PlanExerciseResponse pe : todayExercises) {
            if (pe.getExecutions() == null) continue;
            for (ExecutionResponse exec : pe.getExecutions()) {
                if (exec.isCompleted()
                        && exec.getExecutedAt() != null
                        && exec.getExecutedAt().startsWith(todayDate)) {
                    completedToday++;
                    break;
                }
            }
        }

        int pendingCount = total - completedToday;

        progress.setText(completedToday + " de " + total + " exercícios realizados");
        completed.setText(String.valueOf(completedToday));
        pending.setText(String.valueOf(pendingCount));
        progressBar.setMax(total > 0 ? total : 1);
        progressBar.setProgress(completedToday);

        exerciseList.clear();
        exerciseList.addAll(todayExercises);
        exercisePlanAdapter.notifyDataSetChanged();

        if (todayExercises.isEmpty()) {
            tvEmptyExercises.setVisibility(View.VISIBLE);
            recyclerExercises.setVisibility(View.GONE);
        } else {
            tvEmptyExercises.setVisibility(View.GONE);
            recyclerExercises.setVisibility(View.VISIBLE);
        }
    }

    private void showEmptyState() {
        progress.setText("0 de 0 exercícios realizados");
        completed.setText("0");
        pending.setText("0");
        progressBar.setMax(1);
        progressBar.setProgress(0);
        exerciseList.clear();
        exercisePlanAdapter.notifyDataSetChanged();
        tvEmptyExercises.setVisibility(View.VISIBLE);
        recyclerExercises.setVisibility(View.GONE);
    }

    private void onDoExercise(PlanExerciseResponse pe) {
        Intent intent = new Intent(this, ExercisesDescriptionActivity.class);
        intent.putExtra("planExerciseId",      pe.getId());
        intent.putExtra("exerciseName",        pe.getExercise().getName());
        intent.putExtra("exerciseDescription", pe.getExercise().getExerciseDescription());
        intent.putExtra("instructions",        pe.getExercise().getInstructions());
        intent.putExtra("frequency",           pe.getFrequency());
        intent.putExtra("specificNotes",       pe.getSpecificNotes() != null ? pe.getSpecificNotes() : "");

        String youtubeUrl = "";
        if (pe.getExercise().getMediaList() != null && !pe.getExercise().getMediaList().isEmpty()) {
            youtubeUrl = pe.getExercise().getMediaList().get(0).getImageUrl();
        }
        intent.putExtra("youtubeUrl", youtubeUrl);
        startActivity(intent);
    }
}