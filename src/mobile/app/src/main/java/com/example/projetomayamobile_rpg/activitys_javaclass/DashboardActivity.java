package com.example.projetomayamobile_rpg.activitys_javaclass;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.projetomayamobile_rpg.R;
import com.example.projetomayamobile_rpg.model.DashboardResponse;
import com.example.projetomayamobile_rpg.network.ApiService;
import com.example.projetomayamobile_rpg.network.RetrofitClient;
import com.google.android.material.bottomnavigation.BottomNavigationView;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class DashboardActivity extends AppCompatActivity {

    BottomNavigationView bottomNav;
    TextView PatientName, Progress, Completed, Pending;
    ProgressBar ProgressBar;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.dashboard_activity);

        // Views
        PatientName = findViewById(R.id.pacientNameDashboard);
        ProgressBar    = findViewById(R.id.progressBar);
        Completed   = findViewById(R.id.completed);
        Pending     = findViewById(R.id.pending);
        Progress   = findViewById(R.id.progress);
        bottomNav     = findViewById(R.id.bottomNav);

        // Carrega dados do backend
        loadDashboard();

        // Navegação
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
    }

    private void loadDashboard() {
        ApiService api = RetrofitClient.getInstance(this).create(ApiService.class);

        api.getDashboard().enqueue(new Callback<DashboardResponse>() {
            @Override
            public void onResponse(Call<DashboardResponse> call, Response<DashboardResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    DashboardResponse data = response.body();

                    PatientName.setText("Olá,\n" + data.getPatientName());
                    Progress.setText(data.getCompletedExercises() + " de " +
                            data.getTotalExercises() + " exercícios realizados");
                    Completed.setText(String.valueOf(data.getCompletedExercises()));
                    Pending.setText(String.valueOf(data.getPendingExercises()));

                    if (ProgressBar != null) {
                        ProgressBar.setMax(data.getTotalExercises());
                        ProgressBar.setProgress(data.getCompletedExercises());
                    }
                } else {
                    Toast.makeText(DashboardActivity.this,
                            "Erro ao carregar dados.", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<DashboardResponse> call, Throwable t) {
                Toast.makeText(DashboardActivity.this,
                        "Erro de conexão: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }
}