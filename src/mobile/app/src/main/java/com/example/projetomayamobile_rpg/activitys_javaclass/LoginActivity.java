package com.example.projetomayamobile_rpg.activitys_javaclass;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

import com.example.projetomayamobile_rpg.R;
import com.example.projetomayamobile_rpg.model.LoginRequest;
import com.example.projetomayamobile_rpg.network.ApiService;
import com.example.projetomayamobile_rpg.network.RetrofitClient;
import com.google.android.material.textfield.TextInputLayout;
import android.content.SharedPreferences;
import com.example.projetomayamobile_rpg.model.PageResponse;
import com.example.projetomayamobile_rpg.model.PatientResponse;

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

        btnForgotPassword.setOnClickListener(v -> {
            startActivity(new Intent(LoginActivity.this, ForgotPasswordActivity.class));
        });
    }

    private void attemptLogin() {
        String email    = editEmail.getText().toString().trim();
        String password = editPassword.getText().toString().trim();

        if (email.isEmpty() || password.isEmpty()) {
            Toast.makeText(this, "Preencha e-mail e senha.", Toast.LENGTH_SHORT).show();
            return;
        }

        btnLogin.setEnabled(false);
        btnLogin.setText("Entrando...");

        ApiService api = RetrofitClient.getInstance(LoginActivity.this).create(ApiService.class);
        Call<String> call = api.login(new LoginRequest(email, password));

        call.enqueue(new Callback<String>() {
            @Override
            public void onResponse(Call<String> call, Response<String> response) {
                btnLogin.setEnabled(true);
                btnLogin.setText("Entrar");

                if (response.isSuccessful() && response.body() != null) {
                    String token = response.body();

                    // 1. Salva o token primeiro
                    getSharedPreferences("auth", MODE_PRIVATE)
                            .edit()
                            .putString("token", token)
                            .apply();

                    RetrofitClient.resetInstance();

                    // 2. Busca o ID do paciente pelo e-mail
                    ApiService apiComToken = RetrofitClient.getInstance(LoginActivity.this).create(ApiService.class);
                    apiComToken.getPatients(0, 100).enqueue(new Callback<PageResponse<PatientResponse>>() {
                        @Override
                        public void onResponse(Call<PageResponse<PatientResponse>> call,
                                               Response<PageResponse<PatientResponse>> response) {
                            if (response.isSuccessful() && response.body() != null) {
                                for (PatientResponse patient : response.body().getContent()) {
                                    if (patient.getEmail().equals(email)) {
                                        // 3. Salva o ID encontrado
                                        getSharedPreferences("auth", MODE_PRIVATE)
                                                .edit()
                                                .putLong("patient_id", patient.getId())
                                                .apply();
                                        break;
                                    }
                                }
                            }
                            // 4. Vai para a próxima tela independente
                            startActivity(new Intent(LoginActivity.this, LgpdTermActivity.class));
                            finish();
                        }

                        @Override
                        public void onFailure(Call<PageResponse<PatientResponse>> call, Throwable t) {
                            // Vai mesmo assim, o ID pode ser buscado depois
                            startActivity(new Intent(LoginActivity.this, LgpdTermActivity.class));
                            finish();
                        }
                    });
                }
            }

            @Override
            public void onFailure(Call<String> call, Throwable t) {
                btnLogin.setEnabled(true);
                btnLogin.setText("Entrar");
                Toast.makeText(LoginActivity.this,
                        "Erro de conexão: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }
}