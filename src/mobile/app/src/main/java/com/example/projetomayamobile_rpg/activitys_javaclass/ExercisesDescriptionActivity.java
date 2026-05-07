package com.example.projetomayamobile_rpg.activitys_javaclass;

import android.content.Intent;
import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.projetomayamobile_rpg.R;
import com.example.projetomayamobile_rpg.adapters.ExercisePlanAdapter;
import com.example.projetomayamobile_rpg.model.ExecutionRequest;
import com.example.projetomayamobile_rpg.network.ApiService;
import com.example.projetomayamobile_rpg.network.RetrofitClient;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.button.MaterialButtonToggleGroup;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ExercisesDescriptionActivity extends AppCompatActivity {

    private WebView wvYoutube;
    private TextView tvFrequencyDetail, exerciseDescription, tvInstructions;
    private MaterialButtonToggleGroup scalePain;
    private MaterialButton btnBackExercises, btnRegisterExecution;

    private Long planExerciseId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.exercise_description_registry_activity);

        // Bind views
        wvYoutube            = findViewById(R.id.wvYoutube);
        tvFrequencyDetail    = findViewById(R.id.tvFrequencyDetail);
        exerciseDescription  = findViewById(R.id.exerciseDescription);
        tvInstructions       = findViewById(R.id.tvInstructions);
        scalePain            = findViewById(R.id.scalePain);
        btnBackExercises     = findViewById(R.id.btnBackExercises);
        btnRegisterExecution = findViewById(R.id.btnRegisterExecution);

        // Recebe dados do Intent
        Intent intent = getIntent();
        planExerciseId             = intent.getLongExtra("planExerciseId", -1);
        String exerciseName        = intent.getStringExtra("exerciseName");
        String description         = intent.getStringExtra("exerciseDescription");
        String instructions        = intent.getStringExtra("exerciseInstructions");
        String frequency           = intent.getStringExtra("frequency");
        String youtubeUrl          = intent.getStringExtra("youtubeUrl");

        // Popula a UI
        btnBackExercises.setText(exerciseName != null ? exerciseName : "Exercício");
        tvFrequencyDetail.setText(frequency != null ? frequency : "—");
        exerciseDescription.setText(description != null ? description : "—");
        tvInstructions.setText(instructions != null ? instructions : "—");

        // Carrega o vídeo YouTube
        configureWebView(youtubeUrl);

        // Botão voltar
        btnBackExercises.setOnClickListener(v -> finish());

        // Seleção de dor padrão: sem dor
        scalePain.check(R.id.btn1Pain);

        // Registrar execução
        btnRegisterExecution.setOnClickListener(v -> registerExecution());
    }

    private void configureWebView(String youtubeUrl) {
        String videoId = ExercisePlanAdapter.extractYoutubeId(youtubeUrl);

        WebSettings settings = wvYoutube.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setMediaPlaybackRequiresUserGesture(false);

        wvYoutube.setWebChromeClient(new WebChromeClient());

        if (videoId != null) {
            String html =
                    "<html>"
                            + "<body style='margin:0;padding:0;background:#000;'>"
                            + "<iframe "
                            +   "width='100%' height='100%' "
                            +   "src='https://www.youtube.com/embed/" + videoId
                            +     "?rel=0&modestbranding=1&playsinline=1' "
                            +   "frameborder='0' "
                            +   "allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture' "
                            +   "allowfullscreen>"
                            + "</iframe>"
                            + "</body>"
                            + "</html>";

            // loadDataWithBaseURL é mais confiável que loadData
            wvYoutube.loadDataWithBaseURL(
                    "https://www.youtube.com",  // baseUrl
                    html,                        // data
                    "text/html",                 // mimeType
                    "UTF-8",                     // encoding
                    null                         // historyUrl
            );
        } else {
            String placeholder =
                    "<html>"
                            + "<body style='background:#f1f5f8;display:flex;align-items:center;"
                            + "justify-content:center;height:100%;margin:0;'>"
                            + "<p style='color:#999;font-family:sans-serif;font-size:16px;'>"
                            + "Sem vídeo disponível"
                            + "</p>"
                            + "</body>"
                            + "</html>";

            wvYoutube.loadDataWithBaseURL(null, placeholder, "text/html", "UTF-8", null);
        }
    }

    private void registerExecution() {
        if (planExerciseId == null || planExerciseId == -1) {
            Toast.makeText(this, "Erro: exercício não identificado.", Toast.LENGTH_SHORT).show();
            return;
        }

        // Mapeia o botão selecionado para painScale (0–3)
        int checkedId = scalePain.getCheckedButtonId();
        int painScale;
        if      (checkedId == R.id.btn1Pain) painScale = 0;
        else if (checkedId == R.id.btn2Pain) painScale = 1;
        else if (checkedId == R.id.btn3Pain) painScale = 2;
        else if (checkedId == R.id.btn4Pain) painScale = 3;
        else {
            Toast.makeText(this, "Selecione seu nível de dor.", Toast.LENGTH_SHORT).show();
            return;
        }

        btnRegisterExecution.setEnabled(false);
        btnRegisterExecution.setText("Registrando…");

        ApiService api = RetrofitClient.getInstance(this).create(ApiService.class);
        ExecutionRequest body = new ExecutionRequest(planExerciseId, painScale);

        api.registerExecution(body).enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                if (response.isSuccessful()) {
                    startActivity(new Intent(
                            ExercisesDescriptionActivity.this,
                            RegisterExecutionCompletedActivity.class));
                    finish();
                } else {
                    resetButton();
                    Toast.makeText(ExercisesDescriptionActivity.this,
                            "Erro ao registrar execução (código " + response.code() + ").",
                            Toast.LENGTH_LONG).show();
                }
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                resetButton();
                Toast.makeText(ExercisesDescriptionActivity.this,
                        "Erro de conexão: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }

    private void resetButton() {
        btnRegisterExecution.setEnabled(true);
        btnRegisterExecution.setText("Registrar Execução");
    }

    @Override
    protected void onDestroy() {
        if (wvYoutube != null) {
            wvYoutube.destroy();
        }
        super.onDestroy();
    }
}