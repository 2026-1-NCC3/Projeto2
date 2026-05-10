package com.example.projetomayamobile_rpg.activitys_javaclass;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.projetomayamobile_rpg.R;
import com.example.projetomayamobile_rpg.model.LoginRequest;
import com.example.projetomayamobile_rpg.model.LoginResponse;
import com.example.projetomayamobile_rpg.model.PatientResponse;
import com.example.projetomayamobile_rpg.network.ApiService;
import com.example.projetomayamobile_rpg.network.RetrofitClient;
import com.example.projetomayamobile_rpg.workers.NotificationScheduler;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LoginActivity extends AppCompatActivity {

    Button btnForgotPassword;
    EditText editEmail;
    EditText editPassword;
    com.google.android.material.button.MaterialButton btnLogin;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        SharedPreferences prefs = getSharedPreferences("auth", MODE_PRIVATE);
        String token     = prefs.getString("token", "");
        long   patientId = prefs.getLong("patient_id", -1L);

        if (!token.isEmpty() && patientId != -1L) {
            validateTokenWithServer(patientId);
            return;
        }

        showLoginScreen();
    }

    private void validateTokenWithServer(long patientId) {
        ApiService api = RetrofitClient.getInstance(this).create(ApiService.class);
        api.getPatientById(patientId).enqueue(new Callback<PatientResponse>() {

            @Override
            public void onResponse(Call<PatientResponse> call, Response<PatientResponse> response) {
                if (response.isSuccessful()) {
                    navigateToNext();
                } else {
                    clearSession();
                    showLoginScreen();
                }
            }

            @Override
            public void onFailure(Call<PatientResponse> call, Throwable t) {
                Toast.makeText(LoginActivity.this,
                        "Sem conexão com o servidor. Faça login novamente.",
                        Toast.LENGTH_LONG).show();
                clearSession();
                showLoginScreen();
            }
        });
    }

    private void showLoginScreen() {
        setContentView(R.layout.login_activity);

        editEmail         = findViewById(R.id.editEmail);
        editPassword      = findViewById(R.id.editPassword);
        btnLogin          = findViewById(R.id.btnLogin);
        btnForgotPassword = findViewById(R.id.btnForgotPassword);

        btnLogin.setOnClickListener(v -> attemptLogin());
        btnForgotPassword.setOnClickListener(v ->
                startActivity(new Intent(LoginActivity.this, ForgotPasswordActivity.class))
        );
    }

    private void attemptLogin() {
        String email    = editEmail.getText().toString().trim();
        String password = editPassword.getText().toString().trim();

        if (email.isEmpty() || password.isEmpty()) {
            Toast.makeText(this, "Preencha e-mail e senha.", Toast.LENGTH_SHORT).show();
            return;
        }

        setLoginLoading(true);

        ApiService api = RetrofitClient.getInstance(this).create(ApiService.class);
        api.login(new LoginRequest(email, password)).enqueue(new Callback<LoginResponse>() {

            @Override
            public void onResponse(Call<LoginResponse> call, Response<LoginResponse> response) {
                setLoginLoading(false);
                if (response.isSuccessful() && response.body() != null) {
                    onLoginSuccess(response.body());
                } else {
                    onLoginError(response.code());
                }
            }

            @Override
            public void onFailure(Call<LoginResponse> call, Throwable t) {
                setLoginLoading(false);
                Toast.makeText(LoginActivity.this,
                        "Sem conexão com o servidor. Algum erro ocorreu.",
                        Toast.LENGTH_LONG).show();
            }
        });
    }

    private void onLoginSuccess(LoginResponse loginResponse) {
        getSharedPreferences("auth", MODE_PRIVATE)
                .edit()
                .putString("token", loginResponse.token)
                .putLong("patient_id", loginResponse.id)
                .apply();

        RetrofitClient.resetInstance();

        NotificationScheduler.schedule(this);

        navigateToNext();
    }

    private void onLoginError(int httpCode) {
        String mensagem;
        switch (httpCode) {
            case 400: mensagem = "Dados inválidos. Verifique e-mail e senha."; break;
            case 401:
            case 403: mensagem = "E-mail ou senha incorretos."; break;
            case 404: mensagem = "Usuário não encontrado."; break;
            case 500:
            case 502:
            case 503: mensagem = "Servidor indisponível. Tente novamente em instantes."; break;
            default:  mensagem = "Erro inesperado (código " + httpCode + "). Tente novamente.";
        }
        Toast.makeText(this, mensagem, Toast.LENGTH_LONG).show();
    }

    private void navigateToNext() {
        startActivity(new Intent(LoginActivity.this, LgpdTermActivity.class));
        finish();
    }

    private void setLoginLoading(boolean loading) {
        btnLogin.setEnabled(!loading);
        btnLogin.setText(loading ? "Entrando..." : "Entrar");
    }

    private void clearSession() {
        getSharedPreferences("auth", MODE_PRIVATE)
                .edit()
                .remove("token")
                .remove("patient_id")
                .apply();
        RetrofitClient.resetInstance();

        NotificationScheduler.cancel(this);
    }
}