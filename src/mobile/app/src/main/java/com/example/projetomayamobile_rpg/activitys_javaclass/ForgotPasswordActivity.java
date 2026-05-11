package com.example.projetomayamobile_rpg.activitys_javaclass;

import android.content.Intent;
import android.os.Bundle;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.projetomayamobile_rpg.R;
import com.example.projetomayamobile_rpg.model.ForgotPasswordRequest;
import com.example.projetomayamobile_rpg.network.ApiService;
import com.google.android.material.button.MaterialButton;

import java.util.concurrent.TimeUnit;

import okhttp3.OkHttpClient;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.converter.scalars.ScalarsConverterFactory;

public class ForgotPasswordActivity extends AppCompatActivity {

    private static final String EMAIL_SUBJECT = "Recuperação de senha";
    private static final String BASE_URL = "http://192.168.0.22:8080/";

    MaterialButton btnSendCode;
    MaterialButton btnBackLogin;
    EditText editEmail;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.forgot_password_activity);

        btnSendCode  = findViewById(R.id.btnSendCode);
        btnBackLogin = findViewById(R.id.btnBackLogin);
        editEmail    = findViewById(R.id.editEmail);

        btnBackLogin.setOnClickListener(v -> {
            startActivity(new Intent(this, LoginActivity.class));
            finish();
        });

        btnSendCode.setOnClickListener(v -> sendCode());
    }

    private void sendCode() {
        String email = editEmail.getText().toString().trim();

        if (email.isEmpty()) {
            editEmail.setError("Informe seu e-mail.");
            editEmail.requestFocus();
            return;
        }

        setLoading(true);

        OkHttpClient clienteComTimeout = new OkHttpClient.Builder()
                .connectTimeout(25, TimeUnit.SECONDS)
                .readTimeout(25, TimeUnit.SECONDS)
                .writeTimeout(25, TimeUnit.SECONDS)
                .build();

        Retrofit retrofitComTimeout = new Retrofit.Builder()
                .baseUrl(BASE_URL)
                .client(clienteComTimeout)
                .addConverterFactory(ScalarsConverterFactory.create())
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        ApiService api = retrofitComTimeout.create(ApiService.class);
        api.forgotPassword(new ForgotPasswordRequest(email, EMAIL_SUBJECT))
                .enqueue(new Callback<Void>() {

                    @Override
                    public void onResponse(Call<Void> call, Response<Void> response) {
                        setLoading(false);
                        if (response.isSuccessful()) {
                            Intent intent = new Intent(ForgotPasswordActivity.this,
                                    ForgotPasswordSequelActivity.class);
                            intent.putExtra("email", email);
                            startActivity(intent);
                            finish();
                        } else {
                            Toast.makeText(ForgotPasswordActivity.this,
                                    "Não foi possível enviar o código. Verifique se o e-mail está correto.",
                                    Toast.LENGTH_LONG).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<Void> call, Throwable t) {
                        setLoading(false);
                        Toast.makeText(ForgotPasswordActivity.this,
                                "Erro de conexão: " + t.getMessage(),
                                Toast.LENGTH_LONG).show();
                    }
                });
    }

    private void setLoading(boolean loading) {
        btnSendCode.setEnabled(!loading);
        btnSendCode.setText(loading ? "Enviando código..." : getString(R.string.enviar_codigo));
    }
}