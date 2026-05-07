package com.example.projetomayamobile_rpg.activitys_javaclass;

import android.content.Intent;
import android.os.Bundle;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.projetomayamobile_rpg.R;
import com.example.projetomayamobile_rpg.model.VerifyCodeRequest;
import com.example.projetomayamobile_rpg.network.ApiService;
import com.example.projetomayamobile_rpg.network.RetrofitClient;
import com.google.android.material.button.MaterialButton;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;


public class ForgotPasswordSequelActivity extends AppCompatActivity {

    MaterialButton btnChangePassword;
    EditText editCode;
    EditText editNewPassword;
    EditText editConfirmNewPassword;

    private String email;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.forgot_password_sequel_activity);

        email = getIntent().getStringExtra("email");

        btnChangePassword    = findViewById(R.id.btnChangePassword);
        editCode             = findViewById(R.id.editCode);
        editNewPassword      = findViewById(R.id.editNewPassword);
        editConfirmNewPassword = findViewById(R.id.editConfirmNewPassword);

        btnChangePassword.setOnClickListener(v -> verifyAndReset());
    }

    private void verifyAndReset() {
        String code           = editCode.getText().toString().trim();
        String newPassword    = editNewPassword.getText().toString().trim();
        String confirmPassword = editConfirmNewPassword.getText().toString().trim();

        // Validações locais
        if (code.isEmpty()) {
            editCode.setError("Informe o código.");
            editCode.requestFocus();
            return;
        }
        if (newPassword.isEmpty()) {
            editNewPassword.setError("Informe a nova senha.");
            editNewPassword.requestFocus();
            return;
        }
        if (newPassword.length() < 6) {
            editNewPassword.setError("A senha deve ter ao menos 6 caracteres.");
            editNewPassword.requestFocus();
            return;
        }
        if (!newPassword.equals(confirmPassword)) {
            editConfirmNewPassword.setError("As senhas não podem ser diferentes.");
            editConfirmNewPassword.requestFocus();
            return;
        }

        setLoading(true);

        ApiService api = RetrofitClient.getInstance(this).create(ApiService.class);
        api.verifyCode(new VerifyCodeRequest(email, code, newPassword))
                .enqueue(new Callback<Void>() {

                    @Override
                    public void onResponse(Call<Void> call, Response<Void> response) {
                        setLoading(false);
                        if (response.isSuccessful()) {
                            startActivity(new Intent(ForgotPasswordSequelActivity.this,
                                    ForgotPasswordCompletedActivity.class));
                            finish();
                        } else if (response.code() == 400 || response.code() == 401) {
                            editCode.setError("Código inválido ou expirado.");
                            editCode.requestFocus();
                        } else {
                            Toast.makeText(ForgotPasswordSequelActivity.this,
                                    "Erro ao redefinir senha (código " + response.code() + ").",
                                    Toast.LENGTH_LONG).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<Void> call, Throwable t) {
                        setLoading(false);
                        Toast.makeText(ForgotPasswordSequelActivity.this,
                                "Erro de conexão: " + t.getMessage(),
                                Toast.LENGTH_LONG).show();
                    }
                });
    }

    private void setLoading(boolean loading) {
        btnChangePassword.setEnabled(!loading);
        btnChangePassword.setText(loading ? "Verificando..." : getString(R.string.alterar_a_senha));
    }
}