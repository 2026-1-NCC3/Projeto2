package com.example.projetomayamobile_rpg.activitys_javaclass;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.projetomayamobile_rpg.R;
import com.example.projetomayamobile_rpg.model.ForgotPasswordRequest;
import com.example.projetomayamobile_rpg.network.ApiService;
import com.example.projetomayamobile_rpg.network.RetrofitClient;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ForgotPasswordActivity extends AppCompatActivity {

    Button btnSendCode;
    EditText editEmail;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.forgot_password_activity);

        btnSendCode      = findViewById(R.id.btnSendCode);
        editEmail  = findViewById(R.id.editEmail);

        btnSendCode.setOnClickListener(v -> sendCode());
    }

    private void sendCode() {
        /* TODO: descomentar e ajustar quando tiver e-mail
         String email = editEmailForgot.getText().toString().trim();
         if (email.isEmpty()) {
             Toast.makeText(this, "Informe seu e-mail.", Toast.LENGTH_SHORT).show();
             return;
         }

         btnSendCode.setEnabled(false);
         ApiService api = RetrofitClient.getInstance(this).create(ApiService.class);
         api.forgotPassword(new ForgotPasswordRequest(email)).enqueue(new Callback<Void>() {

             @Override
             public void onResponse(Call<Void> call, Response<Void> response) {
                 btnSendCode.setEnabled(true);
                 if (response.isSuccessful()) {
                     // Passa o e-mail para a próxima tela via Intent
                     Intent intent = new Intent(ForgotPasswordActivity.this,
                                                ForgotPasswordSequelActivity.class);
                     intent.putExtra("email", email);
                     startActivity(intent);
                     finish();
                 } else {
                     Toast.makeText(ForgotPasswordActivity.this,
                             "Não foi possível enviar o código. Verifique o e-mail.",
                             Toast.LENGTH_LONG).show();
                 }
             }

             @Override
             public void onFailure(Call<Void> call, Throwable t) {
                 btnSendCode.setEnabled(true);
                 Toast.makeText(ForgotPasswordActivity.this,
                         "Erro de conexão: " + t.getMessage(), Toast.LENGTH_LONG).show();
             }
         });
        */

        startActivity(new Intent(this, ForgotPasswordSequelActivity.class));
        finish();
    }
}