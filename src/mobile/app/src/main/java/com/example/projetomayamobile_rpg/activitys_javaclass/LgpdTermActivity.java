package com.example.projetomayamobile_rpg.activitys_javaclass;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Button;
import android.widget.CheckBox;

import androidx.appcompat.app.AppCompatActivity;

import com.example.projetomayamobile_rpg.R;

public class LgpdTermActivity extends AppCompatActivity {
    Button btnAcceptTerms;
    Button btnBackLogin;
    CheckBox checkAcceptTerms;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Se já aceitou os termos antes, pula direto pro Dashboard
        SharedPreferences prefs = getSharedPreferences("maya_prefs", MODE_PRIVATE);
        if (prefs.getBoolean("lgpd_aceito", false)) {
            startActivity(new Intent(this, DashboardActivity.class));
            finish();
            return;
        }

        setContentView(R.layout.lgpd_term_activity);

        btnAcceptTerms   = findViewById(R.id.btnAcceptTerms);
        btnBackLogin     = findViewById(R.id.btnBackLogin);
        checkAcceptTerms = findViewById(R.id.checkBox);

        btnAcceptTerms.setEnabled(false);

        checkAcceptTerms.setOnCheckedChangeListener((buttonView, isChecked) -> {
            btnAcceptTerms.setEnabled(isChecked);
        });

        btnAcceptTerms.setOnClickListener(v -> {
            prefs.edit().putBoolean("lgpd_aceito", true).apply();
            startActivity(new Intent(LgpdTermActivity.this, DashboardActivity.class));
            finish();
        });

        btnBackLogin.setOnClickListener(v -> {
            startActivity(new Intent(LgpdTermActivity.this, LoginActivity.class));
            finish();
        });
    }
}