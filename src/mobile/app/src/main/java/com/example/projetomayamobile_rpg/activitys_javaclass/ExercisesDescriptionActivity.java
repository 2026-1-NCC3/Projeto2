package com.example.projetomayamobile_rpg.activitys_javaclass;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.projetomayamobile_rpg.R;
import com.example.projetomayamobile_rpg.network.ApiService;
import com.example.projetomayamobile_rpg.network.RetrofitClient;
import com.google.android.material.button.MaterialButton;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.util.HashMap;
import java.util.Map;

public class ExercisesDescriptionActivity extends AppCompatActivity {

    TextView btnBackExercises, exerciseDescription, exerciseFrequency;
    TextView step1Text, step2Text, step3Text, step4Text, step5Text;
    MaterialButton btnRegister;

    private Long planExerciseId;
    private Long patientId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.exercise_description_activity);

        // Views
        btnBackExercises   = findViewById(R.id.btnBackExercises);
        exerciseDescription = findViewById(R.id.exerciseDescription);
        exerciseFrequency  = findViewById(R.id.exerciseFrequency);
        step1Text          = findViewById(R.id.step1Text);
        step2Text          = findViewById(R.id.step2Text);
        step3Text          = findViewById(R.id.step3Text);
        step4Text          = findViewById(R.id.step4Text);
        step5Text          = findViewById(R.id.step5Text);
        btnRegister        = findViewById(R.id.btnRegister);

        // Dados passados pelo adapter
        planExerciseId = getIntent().getLongExtra("planExerciseId", -1);
        String name         = getIntent().getStringExtra("exerciseName");
        String description  = getIntent().getStringExtra("exerciseDescription");
        String instructions = getIntent().getStringExtra("exerciseInstructions");
        String frequency    = getIntent().getStringExtra("exerciseFrequency");

        // Preenche os campos
        btnBackExercises.setText(name);
        exerciseDescription.setText(description);
        exerciseFrequency.setText(frequency);

        // Distribui as instruções nos passos
        // A API retorna tudo em um campo — dividimos por linha
        if (instructions != null) {
            String[] steps = instructions.split("\n");
            TextView[] stepViews = {step1Text, step2Text, step3Text, step4Text, step5Text};
            for (int i = 0; i < stepViews.length; i++) {
                if (i < steps.length) {
                    stepViews[i].setText(steps[i].trim());
                } else {
                    stepViews[i].setText("-");
                }
            }
        }

        // Botão voltar
        btnBackExercises.setOnClickListener(v -> finish());

        // Botão confirmar execução
        SharedPreferences prefs = getSharedPreferences("auth", MODE_PRIVATE);
        patientId = prefs.getLong("patient_id", -1);

        btnRegister.setOnClickListener(v -> registerExecution());
    }

    private void registerExecution() {
        if (planExerciseId == -1) return;

        btnRegister.setEnabled(false);
        btnRegister.setText("Registrando...");

        // Monta o body da execução conforme a API
        Map<String, Object> body = new HashMap<>();
        body.put("completed", true);
        body.put("painScale", 0);
        body.put("notes", "");
        body.put("planExercise", Map.of("id", planExerciseId));

        ApiService api = RetrofitClient.getInstance(this).create(ApiService.class);
        api.registerExecution(body).enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(ExercisesDescriptionActivity.this,
                            "Exercício concluído! ✅", Toast.LENGTH_SHORT).show();
                    finish(); // volta para a lista
                } else {
                    btnRegister.setEnabled(true);
                    btnRegister.setText("Confirmar Execução");
                    Toast.makeText(ExercisesDescriptionActivity.this,
                            "Erro ao registrar.", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                btnRegister.setEnabled(true);
                btnRegister.setText("Confirmar Execução");
                Toast.makeText(ExercisesDescriptionActivity.this,
                        "Erro de conexão: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }
}