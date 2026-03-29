package com.example.projetomayamobile_rpg;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;

import androidx.appcompat.app.AppCompatActivity;

public class ForgotPasswordCompletedActivity extends AppCompatActivity {

    Button btnReturnLogin;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.forgot_password_completed_activity);


        btnReturnLogin = findViewById(R.id.btnReturnLogin);

        btnReturnLogin.setOnClickListener(v -> {
            startActivity(new Intent(ForgotPasswordCompletedActivity.this, LoginActivity.class));
            finish();
        });

    }
}