package com.example.projetomayamobile_rpg;

import android.content.Intent;
import android.os.Bundle;
import android.widget.LinearLayout;
import android.widget.Toast;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.switchmaterial.SwitchMaterial;

public class ProfileActivity extends AppCompatActivity {
    BottomNavigationView bottomNav;
    SwitchMaterial switchNotifications;
    LinearLayout itemChangePassword, itemPrivacy;
    MaterialButton btnLogout;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.profile_activity);

        switchNotifications = findViewById(R.id.switchNotifications);
        itemChangePassword  = findViewById(R.id.itemChangePassword);
        itemPrivacy         = findViewById(R.id.itemPrivacy);
        btnLogout           = findViewById(R.id.btnLogout);

        switchNotifications.setOnCheckedChangeListener((buttonView, isChecked) -> {
            String msg = isChecked ? "Notificações ativadas" : "Notificações desativadas";
            Toast.makeText(this, msg, Toast.LENGTH_SHORT).show();
        });

//        tem que arrumar isso aqui, quando clica em esqueci a senha manda pra mesma da tela de Login ainda
        itemChangePassword.setOnClickListener(v -> {
            startActivity(new Intent(this, ForgotPasswordActivity.class));
        });

        itemPrivacy.setOnClickListener(v -> {
            startActivity(new Intent(this, LgpdProfileActivity.class));
        });

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
            if (id == R.id.menu_message) {
                startActivity(new Intent(this, MessageActivity.class));
                return true;
            }
            if (id == R.id.menu_profile) {
                return true;
            }
            return false;
        });
    }

    private void showLogoutDialog() {
        new AlertDialog.Builder(this)
                .setTitle("Sair do App")
                .setMessage("Tem certeza que deseja sair?")
                .setPositiveButton("Sair", (dialog, which) -> {
                    Intent intent = new Intent(this, LoginActivity.class);
                    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                    startActivity(intent);
                })
                .setNegativeButton("Cancelar", null)
                .show();
    }
}
