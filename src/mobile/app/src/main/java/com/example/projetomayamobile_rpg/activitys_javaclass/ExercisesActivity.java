package com.example.projetomayamobile_rpg.activitys_javaclass;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.projetomayamobile_rpg.R;
import com.example.projetomayamobile_rpg.adapters.ExercisePlanAdapter;
import com.example.projetomayamobile_rpg.model.ExerciseMediaResponse;
import com.example.projetomayamobile_rpg.model.PageResponse;
import com.example.projetomayamobile_rpg.model.PlanExerciseResponse;
import com.example.projetomayamobile_rpg.model.PlanResponse;
import com.example.projetomayamobile_rpg.network.ApiService;
import com.example.projetomayamobile_rpg.network.RetrofitClient;
import com.google.android.material.bottomnavigation.BottomNavigationView;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ExercisesActivity extends AppCompatActivity {

    RecyclerView recyclerExercisesPlan;
    ExercisePlanAdapter adapter;
    List<PlanExerciseResponse> exerciseList = new ArrayList<>();
    private Long patientId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.exercises_activity);

        recyclerExercisesPlan = findViewById(R.id.recyclerExercisesPlan);
        recyclerExercisesPlan.setLayoutManager(new LinearLayoutManager(this));

        SharedPreferences prefs = getSharedPreferences("auth", MODE_PRIVATE);
        patientId = prefs.getLong("patient_id", -1);

        adapter = new ExercisePlanAdapter(exerciseList, this::openExerciseDetail);
        recyclerExercisesPlan.setAdapter(adapter);

        loadExercisesByPatient();


        BottomNavigationView bottomNav = findViewById(R.id.bottomNav);
        bottomNav.setSelectedItemId(R.id.menu_exercises);
        bottomNav.setOnItemSelectedListener(item -> {
            int id = item.getItemId();
            if (id == R.id.menu_home) {
                startActivity(new Intent(this, DashboardActivity.class));
                return true;
            }
            if (id == R.id.menu_exercises) return true;
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
    }

    private void loadExercisesByPatient() {
        ApiService api = RetrofitClient.getInstance(this).create(ApiService.class);

        api.getPlansByPatient(patientId, 0, 50).enqueue(new Callback<PageResponse<PlanResponse>>() {
            @Override
            public void onResponse(Call<PageResponse<PlanResponse>> call,
                                   Response<PageResponse<PlanResponse>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    exerciseList.clear();
                    for (PlanResponse plan : response.body().getContent()) {
                        if ("ATIVO".equals(plan.getStatus()) && plan.getPlanExercises() != null) {
                            exerciseList.addAll(plan.getPlanExercises());
                        }
                    }
                    adapter.notifyDataSetChanged();
                } else {
                    Toast.makeText(ExercisesActivity.this,
                            "Erro ao carregar exercícios.", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<PageResponse<PlanResponse>> call, Throwable t) {
                Toast.makeText(ExercisesActivity.this,
                        "Erro de conexão: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }


    private void openExerciseDetail(PlanExerciseResponse pe) {
        Intent intent = new Intent(this, ExercisesDescriptionActivity.class);
        intent.putExtra("planExerciseId", pe.getId());
        intent.putExtra("exerciseName", pe.getExercise().getName());
        intent.putExtra("exerciseDescription", pe.getExercise().getExerciseDescription());
        intent.putExtra("exerciseInstructions", pe.getExercise().getInstructions());
        intent.putExtra("frequency", pe.getFrequency());
        intent.putExtra("specificNotes", pe.getSpecificNotes());

        List<ExerciseMediaResponse> mediaList = pe.getExercise().getMediaList();
        if (mediaList != null && !mediaList.isEmpty()) {
            intent.putExtra("youtubeUrl", mediaList.get(0).getImageUrl());
        }
        startActivity(intent);
    }
}