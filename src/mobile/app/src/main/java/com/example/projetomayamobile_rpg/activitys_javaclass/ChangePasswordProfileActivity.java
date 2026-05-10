package com.example.projetomayamobile_rpg.activitys_javaclass;

import android.content.Intent;
import android.os.Bundle;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.projetomayamobile_rpg.R;
import com.example.projetomayamobile_rpg.model.ChangePasswordRequest;
import com.example.projetomayamobile_rpg.network.ApiService;
import com.example.projetomayamobile_rpg.network.RetrofitClient;
import com.google.android.material.button.MaterialButton;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ChangePasswordProfileActivity extends AppCompatActivity {

    EditText editCurrentPassword, editNewPassword, editConfirmNewPassword;
    MaterialButton btnChangePassword;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.change_password_profile_activity);

        editCurrentPassword    = findViewById(R.id.editPasswordProfile);
        editNewPassword        = findViewById(R.id.editNewPasswordProfile);
        editConfirmNewPassword = findViewById(R.id.editConfirmNewPasswordProfile);
        btnChangePassword      = findViewById(R.id.btnChangePasswordProfile);

        btnChangePassword.setOnClickListener(v -> attemptChangePassword());
    }

    private void attemptChangePassword() {
        String currentPassword = editCurrentPassword.getText().toString().trim();
        String newPassword     = editNewPassword.getText().toString().trim();
        String confirmPassword = editConfirmNewPassword.getText().toString().trim();

        if (currentPassword.isEmpty()) {
            editCurrentPassword.setError("Informe sua senha atual.");
            editCurrentPassword.requestFocus();
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
            editConfirmNewPassword.setError("As senhas não coincidem.");
            editConfirmNewPassword.requestFocus();
            return;
        }
        if (newPassword.equals(currentPassword)) {
            editNewPassword.setError("A nova senha deve ser diferente da atual.");
            editNewPassword.requestFocus();
            return;
        }

        setLoading(true);

        ApiService api = RetrofitClient.getInstance(this).create(ApiService.class);
        api.changePassword(new ChangePasswordRequest(currentPassword, newPassword))
                .enqueue(new Callback<Void>() {

                    @Override
                    public void onResponse(Call<Void> call, Response<Void> response) {
                        setLoading(false);
                        if (response.isSuccessful()) {
                            startActivity(new Intent(ChangePasswordProfileActivity.this,
                                    ChangePasswordProfileCompletedActivity.class));
                            finish();
                        } else if (response.code() == 401 || response.code() == 403) {
                            editCurrentPassword.setError("Senha atual incorreta.");
                            editCurrentPassword.requestFocus();
                        } else {
                            Toast.makeText(ChangePasswordProfileActivity.this,
                                    "Erro ao alterar senha (código " + response.code() + ").",
                                    Toast.LENGTH_LONG).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<Void> call, Throwable t) {
                        setLoading(false);
                        Toast.makeText(ChangePasswordProfileActivity.this,
                                "Erro de conexão: " + t.getMessage(),
                                Toast.LENGTH_LONG).show();
                    }
                });
    }

    private void setLoading(boolean loading) {
        btnChangePassword.setEnabled(!loading);
        btnChangePassword.setText(loading ? "Alterando…" : getString(R.string.alterar_a_senha));
    }
}