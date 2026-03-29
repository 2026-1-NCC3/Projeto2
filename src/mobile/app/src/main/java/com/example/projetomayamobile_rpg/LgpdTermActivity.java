package com.example.projetomayamobile_rpg;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Button;

import androidx.appcompat.app.AppCompatActivity;

public class LgpdTermActivity extends AppCompatActivity {
        Button btnAcceptTerms;

        @Override
        protected void onCreate(Bundle savedInstanceState) {
            super.onCreate(savedInstanceState);
            setContentView(R.layout.lgpd_term_activity);

            btnAcceptTerms = findViewById(R.id.btnAcceptTerms);

            btnAcceptTerms.setOnClickListener(v -> {

                SharedPreferences prefs = getSharedPreferences("maya_prefs", MODE_PRIVATE);
                prefs.edit().putBoolean("lgpd_aceito", true).apply();

                startActivity(new Intent(LgpdTermActivity.this, DashboardActivity.class));
                finish();
            });
        }
    }