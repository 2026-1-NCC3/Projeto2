package com.example.projetomayamobile_rpg;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Button;

import androidx.appcompat.app.AppCompatActivity;

public class LgpdProfileActivity extends AppCompatActivity {
    Button btnBackTermProfile;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.lgpd_profile_activity);

        btnBackTermProfile = findViewById(R.id.btnBackTermProfile);

        btnBackTermProfile.setOnClickListener(v -> {

            startActivity(new Intent(LgpdProfileActivity.this, ProfileActivity.class));
            finish();
        });
    }
}