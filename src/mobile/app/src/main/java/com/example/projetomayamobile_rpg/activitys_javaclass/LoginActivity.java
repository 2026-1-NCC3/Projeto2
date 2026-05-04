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
import com.example.projetomayamobile_rpg.model.PageResponse;
import com.example.projetomayamobile_rpg.model.PatientResponse;
import com.example.projetomayamobile_rpg.network.ApiService;
import com.example.projetomayamobile_rpg.network.RetrofitClient;

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

        ApiService api = RetrofitClient.getInstance(LoginActivity.this).create(ApiService.class);
        api.login(new LoginRequest(email, password)).enqueue(new Callback<String>() {

            @Override
            public void onResponse(Call<String> call, Response<String> response) {
                setLoginLoading(false);

                if (response.isSuccessful() && response.body() != null) {
                    onLoginSuccess(email, response.body());
                } else {
                    onLoginError(response.code());
                }
            }

            @Override
            public void onFailure(Call<String> call, Throwable t) {
                setLoginLoading(false);
                Toast.makeText(LoginActivity.this,
                        "Sem conexão com o servidor. Verifique sua internet.",
                        Toast.LENGTH_LONG).show();
            }
        });
    }

    private void onLoginSuccess(String email, String token) {
        // Salva o token e reinicia o Retrofit para injetar o Bearer
        getSharedPreferences("auth", MODE_PRIVATE)
                .edit()
                .putString("token", token)
                .apply();

        RetrofitClient.resetInstance();

        // Tenta buscar o ID do paciente pelo e-mail
        ApiService apiAutenticado = RetrofitClient.getInstance(LoginActivity.this).create(ApiService.class);
        apiAutenticado.getPatients(0, 100).enqueue(new Callback<PageResponse<PatientResponse>>() {

            @Override
            public void onResponse(Call<PageResponse<PatientResponse>> call,
                                   Response<PageResponse<PatientResponse>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    for (PatientResponse patient : response.body().getContent()) {
                        if (patient.getEmail() != null && patient.getEmail().equalsIgnoreCase(email)) {
                            getSharedPreferences("auth", MODE_PRIVATE)
                                    .edit()
                                    .putLong("patient_id", patient.getId())
                                    .apply();
                            break;
                        }
                    }
                }
                navigateToNext();
            }

            @Override
            public void onFailure(Call<PageResponse<PatientResponse>> call, Throwable t) {
                // Continua mesmo sem o ID
                navigateToNext();
            }
        });
    }

    private void onLoginError(int httpCode) {
        String mensagem;
        switch (httpCode) {
            case 400:
                mensagem = "Dados inválidos. Verifique e-mail e senha.";
                break;
            case 401:
            case 403:
                mensagem = "E-mail ou senha incorretos.";
                break;
            case 404:
                mensagem = "Usuário não encontrado.";
                break;
            case 500:
            case 502:
            case 503:
                mensagem = "Servidor indisponível. Tente novamente em instantes.";
                break;
            default:
                mensagem = "Erro inesperado (código " + httpCode + "). Tente novamente.";
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
}