package com.example.projetomayamobile_rpg.activitys_javaclass;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.TextView;
import android.widget.Toast;
import androidx.constraintlayout.widget.ConstraintLayout;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import com.example.projetomayamobile_rpg.R;
import com.example.projetomayamobile_rpg.model.PatientResponse;
import com.example.projetomayamobile_rpg.network.ApiService;
import com.example.projetomayamobile_rpg.network.RetrofitClient;
import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.materialswitch.MaterialSwitch;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ProfileActivity extends AppCompatActivity {

    BottomNavigationView bottomNav;
    MaterialSwitch switchNotifications;
    ConstraintLayout itemChangePassword, itemPrivacy;
    MaterialButton btnLogout;
    TextView tvProfileName, tvProfileEmail, tvProfilePhone;

    private Long patientId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.profile_activity);

        // Views de dados
        tvProfileName  = findViewById(R.id.tvProfileName);
        tvProfileEmail = findViewById(R.id.tvProfileEmail);
        tvProfilePhone = findViewById(R.id.tvProfilePhone);

        switchNotifications = findViewById(R.id.switchNotifications);
        itemChangePassword  = findViewById(R.id.itemChangePassword);
        itemPrivacy         = findViewById(R.id.itemPrivacy);
        btnLogout           = findViewById(R.id.btnLogout);

        // Pega o ID salvo no login
        SharedPreferences prefs = getSharedPreferences("auth", MODE_PRIVATE);
        patientId = prefs.getLong("patient_id", -1);

        // Busca dados na API
        loadProfile();

        switchNotifications.setOnCheckedChangeListener((buttonView, isChecked) -> {
            String msg = isChecked ? "Notificações ativadas" : "Notificações desativadas";
            Toast.makeText(this, msg, Toast.LENGTH_SHORT).show();
        });

        itemChangePassword.setOnClickListener(v ->
                startActivity(new Intent(this, ChangePasswordProfileActivity.class))
        );

        itemPrivacy.setOnClickListener(v ->
                startActivity(new Intent(this, LgpdProfileActivity.class))
        );

        btnLogout.setOnClickListener(v -> showLogoutDialog());

        bottomNav = findViewById(R.id.bottomNav);
        bottomNav.setSelectedItemId(R.id.menu_profile);
        bottomNav.setOnItemSelectedListener(item -> {
            int id = item.getItemId();
            if (id == R.id.menu_home) {
                startActivity(new Intent(this, DashboardActivity.class));
                finish();
                return true;
            }
            if (id == R.id.menu_exercises) {
                startActivity(new Intent(this, ExercisesActivity.class));
                finish();
                return true;
            }
            if (id == R.id.menu_history) {
                startActivity(new Intent(this, HistoryActivity.class));
                return true;
            }
            if (id == R.id.menu_profile) return true;

            return false;
        });
    }

    private void loadProfile() {
        if (patientId == -1) return;

        ApiService api = RetrofitClient.getInstance(this).create(ApiService.class);
        api.getPatientById(patientId).enqueue(new Callback<PatientResponse>() {
            @Override
            public void onResponse(Call<PatientResponse> call, Response<PatientResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    PatientResponse p = response.body();
                    tvProfileName.setText(p.getName());
                    tvProfileEmail.setText(p.getEmail());
                    tvProfilePhone.setText(p.getPhoneNumber());
                } else {
                    Toast.makeText(ProfileActivity.this,
                            "Erro ao carregar perfil.", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<PatientResponse> call, Throwable t) {
                Toast.makeText(ProfileActivity.this,
                        "Erro de conexão: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }

    private void showLogoutDialog() {
        new AlertDialog.Builder(this)
                .setTitle("Sair do App")
                .setMessage("Tem certeza que deseja sair?")
                .setPositiveButton("Sair", (dialog, which) -> {
                    // Limpa token e ID ao sair
                    getSharedPreferences("auth", MODE_PRIVATE)
                            .edit()
                            .clear()
                            .apply();

                    RetrofitClient.resetInstance();

                    Intent intent = new Intent(this, LoginActivity.class);
                    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                    startActivity(intent);
                })
                .setNegativeButton("Cancelar", null)
                .show();
    }
}