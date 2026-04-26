package com.example.projetomayamobile_rpg.activitys_javaclass;

import android.content.Intent;
import android.os.Bundle;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.projetomayamobile_rpg.R;
import com.example.projetomayamobile_rpg.network.ApiService;
import com.example.projetomayamobile_rpg.network.RetrofitClient;
import com.google.android.material.bottomnavigation.BottomNavigationView;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import android.content.SharedPreferences;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;


import com.example.projetomayamobile_rpg.adapters.ExerciseAdapter;
import com.example.projetomayamobile_rpg.model.ExecutionResponse;
import com.example.projetomayamobile_rpg.model.PageResponse;
import com.example.projetomayamobile_rpg.model.PatientResponse;
import com.example.projetomayamobile_rpg.model.PlanExerciseResponse;
import com.example.projetomayamobile_rpg.model.PlanResponse;


import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;


public class DashboardActivity extends AppCompatActivity {

    TextView patientName, progress, completed, pending, date;
    ProgressBar progressBar;
    RecyclerView recyclerExercises;
    ExerciseAdapter exerciseAdapter;
    List<PlanExerciseResponse> exerciseList = new ArrayList<>();

    private Long patientId; // salvo no login via SharedPreferences

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.dashboard_activity);

        patientName = findViewById(R.id.pacientNameDashboard);
        progressBar = findViewById(R.id.progressBar);
        completed   = findViewById(R.id.completed);
        pending     = findViewById(R.id.pending);
        progress    = findViewById(R.id.progress);
        date = findViewById(R.id.date);
        recyclerExercises = findViewById(R.id.recyclerExercises);

        recyclerExercises.setLayoutManager(new LinearLayoutManager(this));
        exerciseAdapter = new ExerciseAdapter(exerciseList);
        recyclerExercises.setAdapter(exerciseAdapter);

        // Recupera o ID salvo no login
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
        String hoje = sdf.format(new Date());
        date.setText(hoje); // mostrar a data
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
            public void onFailure(Call<PatientResponse> call, Throwable t) {}
        });
    }

    private void loadPlans() {
        ApiService api = RetrofitClient.getInstance(this).create(ApiService.class);

        // Se não tiver rota por paciente, use GET /plan paginado e filtre
        api.getPlans(0, 50).enqueue(new Callback<PageResponse<PlanResponse>>() {
            @Override
            public void onResponse(Call<PageResponse<PlanResponse>> call,
                                   Response<PageResponse<PlanResponse>> response) {
                if (response.isSuccessful() && response.body() != null) {

                    // Filtra o plano ATIVO do paciente logado
                    PlanResponse activePlan = null;
                    for (PlanResponse plan : response.body().getContent()) {
                        if ("ATIVO".equals(plan.getStatus()) &&
                                plan.getPatient().getId().equals(patientId)) {
                            activePlan = plan;
                            break;
                        }
                    }

                    if (activePlan != null) {
                        updateDashboard(activePlan);
                    }
                }
            }
            @Override
            public void onFailure(Call<PageResponse<PlanResponse>> call, Throwable t) {
                Toast.makeText(DashboardActivity.this,
                        "Erro: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }

    private void updateDashboard(PlanResponse plan) {
        List<PlanExerciseResponse> exercises = plan.getPlanExercises();
        int total = exercises.size();
        int completedToday = 0;

        String today = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
                .format(new Date());

        for (PlanExerciseResponse pe : exercises) {
            if (pe.getExecutions() != null) {
                for (ExecutionResponse exec : pe.getExecutions()) {
                    // Verifica se foi executado HOJE e está completo
                    if (exec.isCompleted() && exec.getExecutedAt() != null
                            && exec.getExecutedAt().startsWith(today)) {
                        completedToday++;
                        break; // conta 1 por exercício
                    }
                }
            }
        }

        int pendingCount = total - completedToday;

        progress.setText(completedToday + " de " + total + " exercícios realizados");
        completed.setText(String.valueOf(completedToday));
        pending.setText(String.valueOf(pendingCount));
        progressBar.setMax(total);
        progressBar.setProgress(completedToday);

        exerciseList.clear();
        exerciseList.addAll(exercises);
        exerciseAdapter.notifyDataSetChanged();
    }
}