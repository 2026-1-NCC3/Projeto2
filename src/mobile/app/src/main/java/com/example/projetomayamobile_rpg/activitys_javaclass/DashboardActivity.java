package com.example.projetomayamobile_rpg.activitys_javaclass;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
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

import java.text.Normalizer;
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
        String hoje = sdf.format(new Date());
        date.setText(hoje);
    }

    private String getTodayDayOfWeek() {
        return String.valueOf(Calendar.getInstance().get(Calendar.DAY_OF_WEEK));
    }

    private String getTodayDayNameNormalized() {
        int day = Calendar.getInstance().get(Calendar.DAY_OF_WEEK);
        switch (day) {
            case Calendar.MONDAY:    return "SEGUNDA";
            case Calendar.TUESDAY:   return "TERCA";
            case Calendar.WEDNESDAY: return "QUARTA";
            case Calendar.THURSDAY:  return "QUINTA";
            case Calendar.FRIDAY:    return "SEXTA";
            case Calendar.SATURDAY:  return "SABADO";
            case Calendar.SUNDAY:    return "DOMINGO";
            default:                 return "";
        }
    }

    private String stripAccents(String s) {
        if (s == null) return null;
        String normalized = Normalizer.normalize(s, Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{M}", "");
    }

    private boolean isScheduledForToday(PlanExerciseResponse pe) {
        String todayDow = getTodayDayOfWeek();

        String days = pe.getDaysOfWeek();
        if (days != null && !days.trim().isEmpty()) {
            for (String d : days.split(",")) {
                if (d.trim().equals(todayDow)) {
                    return true;
                }
            }
            return false;
        }

        String freq = pe.getFrequency();
        if (freq != null) {
            String normalizedFreq = stripAccents(freq).toUpperCase();
            String todayName = getTodayDayNameNormalized();
            return normalizedFreq.contains(todayName);
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
            public void onFailure(Call<PatientResponse> call, Throwable t) {}
        });
    }

    private void loadPlans() {
        ApiService api = RetrofitClient.getInstance(this).create(ApiService.class);
        api.getPlansByPatient(patientId, 0, 50).enqueue(new Callback<PageResponse<PlanResponse>>() {
            @Override
            public void onResponse(Call<PageResponse<PlanResponse>> call,
                                   Response<PageResponse<PlanResponse>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    PlanResponse activePlan = null;
                    for (PlanResponse plan : response.body().getContent()) {
                        if ("ATIVO".equals(plan.getStatus())) {
                            activePlan = plan;
                            break;
                        }
                    }
                    if (activePlan != null) {
                        updateDashboard(activePlan);
                    } else {
                        showEmptyState();
                    }
                }
            }

            @Override
            public void onFailure(Call<PageResponse<PlanResponse>> call, Throwable t) {
                Toast.makeText(DashboardActivity.this,
                        "Erro ao carregar planos: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }

    private void updateDashboard(PlanResponse plan) {
        List<PlanExerciseResponse> allExercises = plan.getPlanExercises();

        List<PlanExerciseResponse> todayExercises = new ArrayList<>();
        for (PlanExerciseResponse pe : allExercises) {
            if (isScheduledForToday(pe)) {
                todayExercises.add(pe);
            }
        }

        int total = todayExercises.size();
        int completedToday = 0;

        String todayDate = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
                .format(new Date());

        for (PlanExerciseResponse pe : todayExercises) {
            if (pe.getExecutions() != null) {
                for (ExecutionResponse exec : pe.getExecutions()) {
                    if (exec.isCompleted() && exec.getExecutedAt() != null
                            && exec.getExecutedAt().startsWith(todayDate)) {
                        completedToday++;
                        break;
                    }
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
        intent.putExtra("planExerciseId", pe.getId());
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
