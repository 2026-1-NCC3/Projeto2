package com.example.projetomayamobile_rpg.activitys_javaclass;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;

import androidx.appcompat.app.AppCompatActivity;

import com.example.projetomayamobile_rpg.R;

public class ChangePasswordProfileCompletedActivity extends AppCompatActivity {

    Button btnReturnLoginChangePassword;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.change_password_profile_completed_activity);

        btnReturnLoginChangePassword = findViewById(R.id.btnReturnLoginChangePassword);

        btnReturnLoginChangePassword.setOnClickListener(v -> {
            Intent intent = new Intent(this, LoginActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
        });
    }
}