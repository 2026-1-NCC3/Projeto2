package com.example.projetomayamobile_rpg.activitys_javaclass;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.projetomayamobile_rpg.R;
import com.example.projetomayamobile_rpg.model.ResetPasswordRequest;
import com.example.projetomayamobile_rpg.model.VerifyCodeRequest;
import com.example.projetomayamobile_rpg.network.ApiService;
import com.example.projetomayamobile_rpg.network.RetrofitClient;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;


public class ForgotPasswordSequelActivity extends AppCompatActivity {

    Button btnChangePassword;
    EditText editCode;
    EditText editNewPassword;

    private String email;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.forgot_password_sequel_activity);

        email = getIntent().getStringExtra("email");

        btnChangePassword = findViewById(R.id.btnChangePassword);
        editCode = findViewById(R.id.editCode);
        editNewPassword      = findViewById(R.id.editNewPassword);

        btnChangePassword.setOnClickListener(v -> changePassword());
    }

    private void changePassword() {
        /* TODO: descomentar e ajustar quando o layout tiver os campos
         String code        = editCode.getText().toString().trim();
         String newPassword = editNewPassword.getText().toString().trim();

         if (code.isEmpty()) {
             Toast.makeText(this, "Informe o código recebido.", Toast.LENGTH_SHORT).show();
             return;
         }
         if (newPassword.isEmpty()) {
             Toast.makeText(this, "Informe a nova senha.", Toast.LENGTH_SHORT).show();
             return;
         }

         btnChangePassword.setEnabled(false);
         ApiService api = RetrofitClient.getInstance(this).create(ApiService.class);

         ── Reset direto ──
         api.resetPassword(new ResetPasswordRequest(email, code, newPassword))
                 .enqueue(new Callback<Void>() {
             @Override
             public void onResponse(Call<Void> call, Response<Void> response) {
                 btnChangePassword.setEnabled(true);
                 if (response.isSuccessful()) {
                     startActivity(new Intent(ForgotPasswordSequelActivity.this,
                                              ForgotPasswordCompletedActivity.class));
                     finish();
                 } else {
                     Toast.makeText(ForgotPasswordSequelActivity.this,
                             "Código inválido ou expirado.", Toast.LENGTH_LONG).show();
                 }
             }
             @Override
             public void onFailure(Call<Void> call, Throwable t) {
                 btnChangePassword.setEnabled(true);
                 Toast.makeText(ForgotPasswordSequelActivity.this,
                         "Erro de conexão: " + t.getMessage(), Toast.LENGTH_LONG).show();
             }
        }); */

        startActivity(new Intent(this, ForgotPasswordCompletedActivity.class));
        finish();
    }
}