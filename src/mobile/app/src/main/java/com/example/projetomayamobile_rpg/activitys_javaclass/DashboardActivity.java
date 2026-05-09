package com.example.projetomayamobile_rpg.activitys_javaclass;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.projetomayamobile_rpg.R;
import com.example.projetomayamobile_rpg.adapters.ExercisePlanAdapter;
import com.example.projetomayamobile_rpg.model.AppointmentResponse;
import com.example.projetomayamobile_rpg.model.ExecutionResponse;
import com.example.projetomayamobile_rpg.model.PageResponse;
import com.example.projetomayamobile_rpg.model.PatientResponse;
import com.example.projetomayamobile_rpg.model.PlanExerciseResponse;
import com.example.projetomayamobile_rpg.model.PlanResponse;
import com.example.projetomayamobile_rpg.network.ApiService;
import com.example.projetomayamobile_rpg.network.RetrofitClient;
import com.google.android.material.bottomnavigation.BottomNavigationView;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Locale;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class DashboardActivity extends AppCompatActivity {

    private static final String TAG = "Dashboard";

    // ── Views — exercícios ─────────────────────────────────────────────────────
    TextView patientName, progress, completed, pending, date, tvEmptyExercises;
    ProgressBar progressBar;
    RecyclerView recyclerExercises;
    ExercisePlanAdapter exercisePlanAdapter;
    List<PlanExerciseResponse> exerciseList = new ArrayList<>();

    // ── Views — card de próxima sessão ─────────────────────────────────────────
    View cardNextAppointment;
    TextView tvAppointmentDate, tvAppointmentTime, tvAppointmentCountdown, tvAppointmentNotes;
    LinearLayout layoutAppointmentNotes;

    // ── Countdown ──────────────────────────────────────────────────────────────
    private final Handler countdownHandler = new Handler(Looper.getMainLooper());
    private Runnable countdownRunnable;
    private Date nextAppointmentDate;

    private Long patientId;

    private static final SimpleDateFormat ISO_FORMAT =
            new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault());

    // ── Lifecycle ──────────────────────────────────────────────────────────────
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.dashboard_activity);

        // Exercícios
        patientName       = findViewById(R.id.pacientNameDashboard);
        progressBar       = findViewById(R.id.progressBar);
        completed         = findViewById(R.id.completed);
        pending           = findViewById(R.id.pending);
        progress          = findViewById(R.id.progress);
        date              = findViewById(R.id.date);
        tvEmptyExercises  = findViewById(R.id.tvEmptyExercises);
        recyclerExercises = findViewById(R.id.recyclerExercises);

        // Card de sessão
        cardNextAppointment    = findViewById(R.id.cardNextAppointment);
        tvAppointmentDate      = findViewById(R.id.tvAppointmentDate);
        tvAppointmentTime      = findViewById(R.id.tvAppointmentTime);
        tvAppointmentCountdown = findViewById(R.id.tvAppointmentCountdown);
        tvAppointmentNotes     = findViewById(R.id.tvAppointmentNotes);
        layoutAppointmentNotes = findViewById(R.id.layoutAppointmentNotes);

        recyclerExercises.setLayoutManager(new LinearLayoutManager(this));
        exercisePlanAdapter = new ExercisePlanAdapter(exerciseList, this::onDoExercise);
        recyclerExercises.setAdapter(exercisePlanAdapter);

        SharedPreferences prefs = getSharedPreferences("auth", MODE_PRIVATE);
        patientId = prefs.getLong("patient_id", -1);

        SimpleDateFormat sdf = new SimpleDateFormat("EEEE, dd 'de' MMMM", new Locale("pt", "BR"));
        date.setText(sdf.format(new Date()));

        loadPatientName();
        loadPlans();
        loadNextAppointment();

        BottomNavigationView bottomNav = findViewById(R.id.bottomNav);
        bottomNav.setSelectedItemId(R.id.menu_home);
        bottomNav.setOnItemSelectedListener(item -> {
            int id = item.getItemId();
            if (id == R.id.menu_home) return true;
            if (id == R.id.menu_exercises) {
                startActivity(new Intent(this, ExercisesActivity.class));
                return true;
            }
            if (id == R.id.menu_messages) {
                startActivity(new Intent(this, MessagesActivity.class));
                return true;
            }
            if (id == R.id.menu_history) {
                startActivity(new Intent(this, HistoryActivity.class));
                return true;
            }
            if (id == R.id.menu_profile) {
                startActivity(new Intent(this, ProfileActivity.class));
                return true;
            }
            return false;
        });
    }

    @Override
    protected void onStop() {
        super.onStop();
        stopCountdown();
    }

    // ── Próxima Sessão ─────────────────────────────────────────────────────────

    private void loadNextAppointment() {
        if (patientId == null || patientId < 0) return;

        ApiService api = RetrofitClient.getInstance(this).create(ApiService.class);
        api.getAppointmentsByPatient(patientId).enqueue(new Callback<List<AppointmentResponse>>() {
            @Override
            public void onResponse(Call<List<AppointmentResponse>> call,
                                   Response<List<AppointmentResponse>> response) {
                if (!response.isSuccessful() || response.body() == null) {
                    Log.w(TAG, "Sem resposta de appointments");
                    return;
                }
                processAppointments(response.body());
            }

            @Override
            public void onFailure(Call<List<AppointmentResponse>> call, Throwable t) {
                Log.e(TAG, "Erro ao buscar appointments: " + t.getMessage());
            }
        });
    }

    private void processAppointments(List<AppointmentResponse> appointments) {
        Date now = new Date();
        long thirtyMinMs = 30L * 60 * 1000;

        AppointmentResponse nextAppt = null;
        Date nextDate = null;

        for (AppointmentResponse appt : appointments) {
            if (appt.getAppointmentDatetime() == null) continue;
            try {
                Date dt = ISO_FORMAT.parse(appt.getAppointmentDatetime());
                if (dt == null) continue;
                // Considera consultas que ainda não passaram de 30 minutos
                if (dt.getTime() >= now.getTime() - thirtyMinMs) {
                    if (nextDate == null || dt.before(nextDate)) {
                        nextDate = dt;
                        nextAppt = appt;
                    }
                }
            } catch (ParseException e) {
                Log.w(TAG, "Erro ao parsear data: " + appt.getAppointmentDatetime());
            }
        }

        if (nextAppt == null || nextDate == null) return;

        final AppointmentResponse finalAppt = nextAppt;
        final Date finalDate = nextDate;
        runOnUiThread(() -> bindAppointmentCard(finalAppt, finalDate));
    }

    private void bindAppointmentCard(AppointmentResponse appt, Date dt) {
        SimpleDateFormat dayFmt  = new SimpleDateFormat("EEE", new Locale("pt", "BR"));
        SimpleDateFormat dateFmt = new SimpleDateFormat("dd", Locale.getDefault());
        SimpleDateFormat monFmt  = new SimpleDateFormat("MMM", new Locale("pt", "BR"));
        SimpleDateFormat timeFmt = new SimpleDateFormat("HH:mm", Locale.getDefault());

        String dayName = capitalize(dayFmt.format(dt));
        String dayNum  = dateFmt.format(dt);
        String month   = monFmt.format(dt).replace(".", "");
        String formattedDate = dayName + ", " + dayNum + " de " + month + ".";

        tvAppointmentDate.setText(formattedDate);
        tvAppointmentTime.setText(timeFmt.format(dt));

        String notes = appt.getNotes();
        if (notes != null && !notes.trim().isEmpty()) {
            tvAppointmentNotes.setText(notes);
            layoutAppointmentNotes.setVisibility(View.VISIBLE);
        } else {
            layoutAppointmentNotes.setVisibility(View.GONE);
        }

        nextAppointmentDate = dt;

        // Exibe card com animação fade + slide
        cardNextAppointment.setVisibility(View.VISIBLE);
        cardNextAppointment.setAlpha(0f);
        cardNextAppointment.setTranslationY(18f);
        cardNextAppointment.animate()
                .alpha(1f)
                .translationY(0f)
                .setDuration(340)
                .setInterpolator(new android.view.animation.DecelerateInterpolator())
                .start();

        startCountdown();
    }

    // ── Countdown ──────────────────────────────────────────────────────────────

    private void startCountdown() {
        stopCountdown();
        countdownRunnable = new Runnable() {
            @Override
            public void run() {
                if (nextAppointmentDate == null || tvAppointmentCountdown == null) return;

                long diffMs  = nextAppointmentDate.getTime() - System.currentTimeMillis();
                long diffMin = diffMs / 60_000;

                String label;
                if (diffMs < -30L * 60 * 1000) {
                    stopCountdown();
                    return;
                } else if (diffMin <= 0) {
                    label = "Em andamento";
                } else if (diffMin < 60) {
                    label = "Em " + diffMin + "min";
                } else {
                    long h = diffMin / 60;
                    long m = diffMin % 60;
                    label = m > 0 ? "Em " + h + "h " + m + "min" : "Em " + h + "h";
                }

                tvAppointmentCountdown.setText(label);
                countdownHandler.postDelayed(this, 30_000);
            }
        };
        countdownHandler.post(countdownRunnable);
    }

    private void stopCountdown() {
        if (countdownRunnable != null) {
            countdownHandler.removeCallbacks(countdownRunnable);
            countdownRunnable = null;
        }
    }

    // ── Exercícios ─────────────────────────────────────────────────────────────

    private boolean isScheduledForToday(PlanExerciseResponse pe) {
        String daysOfWeek = pe.getDaysOfWeek();
        if (daysOfWeek == null || daysOfWeek.trim().isEmpty()) return true;

        int calendarDay = Calendar.getInstance().get(Calendar.DAY_OF_WEEK);
        Log.d(TAG, "Hoje → calendarDay=" + calendarDay + " | daysOfWeek='" + daysOfWeek + "'");

        for (String part : daysOfWeek.split(",")) {
            String trimmed = part.trim();
            if (trimmed.isEmpty()) continue;
            try {
                if (Integer.parseInt(trimmed) == calendarDay) {
                    Log.d(TAG, "Match! storedDay=" + trimmed);
                    return true;
                }
            } catch (NumberFormatException e) {
                Log.w(TAG, "Valor não numérico em daysOfWeek: '" + trimmed + "'");
            }
        }
        return false;
    }

    private void loadPatientName() {
        ApiService api = RetrofitClient.getInstance(this).create(ApiService.class);
        api.getPatientById(patientId).enqueue(new Callback<PatientResponse>() {
            @Override
            public void onResponse(Call<PatientResponse> call, Response<PatientResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    patientName.setText(response.body().getName());
                }
            }
            @Override
            public void onFailure(Call<PatientResponse> call, Throwable t) {
                Log.e(TAG, "Erro ao carregar nome do paciente", t);
            }
        });
    }

    private void loadPlans() {
        ApiService api = RetrofitClient.getInstance(this).create(ApiService.class);
        api.getPlansByPatient(patientId, 0, 50).enqueue(new Callback<PageResponse<PlanResponse>>() {
            @Override
            public void onResponse(Call<PageResponse<PlanResponse>> call,
                                   Response<PageResponse<PlanResponse>> response) {
                if (!response.isSuccessful() || response.body() == null) {
                    showEmptyState();
                    return;
                }
                List<PlanExerciseResponse> allExercises = new ArrayList<>();
                for (PlanResponse plan : response.body().getContent()) {
                    if ("ATIVO".equals(plan.getStatus()) && plan.getPlanExercises() != null) {
                        allExercises.addAll(plan.getPlanExercises());
                    }
                }
                Log.d(TAG, "Total de exercícios em planos ativos: " + allExercises.size());
                updateDashboard(allExercises);
            }

            @Override
            public void onFailure(Call<PageResponse<PlanResponse>> call, Throwable t) {
                Toast.makeText(DashboardActivity.this,
                        "Erro ao carregar planos: " + t.getMessage(), Toast.LENGTH_LONG).show();
                showEmptyState();
            }
        });
    }

    private void updateDashboard(List<PlanExerciseResponse> allExercises) {
        if (allExercises == null || allExercises.isEmpty()) {
            showEmptyState();
            return;
        }

        List<PlanExerciseResponse> todayExercises = new ArrayList<>();
        for (PlanExerciseResponse pe : allExercises) {
            if (pe.getExercise() != null && isScheduledForToday(pe)) {
                todayExercises.add(pe);
            }
        }

        Log.d(TAG, "Exercícios para hoje: " + todayExercises.size());

        int total = todayExercises.size();
        int completedToday = 0;
        String todayDate = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(new Date());

        for (PlanExerciseResponse pe : todayExercises) {
            if (pe.getExecutions() == null) continue;
            for (ExecutionResponse exec : pe.getExecutions()) {
                if (exec.isCompleted()
                        && exec.getExecutedAt() != null
                        && exec.getExecutedAt().startsWith(todayDate)) {
                    completedToday++;
                    break;
                }
            }
        }

        int pendingCount = total - completedToday;

        progress.setText(completedToday + " de " + total + " exercícios realizados");
        completed.setText(String.valueOf(completedToday));
        pending.setText(String.valueOf(pendingCount));
        progressBar.setMax(total > 0 ? total : 1);
        progressBar.setProgress(completedToday);

        exerciseList.clear();
        exerciseList.addAll(todayExercises);
        exercisePlanAdapter.notifyDataSetChanged();

        if (todayExercises.isEmpty()) {
            tvEmptyExercises.setVisibility(View.VISIBLE);
            recyclerExercises.setVisibility(View.GONE);
        } else {
            tvEmptyExercises.setVisibility(View.GONE);
            recyclerExercises.setVisibility(View.VISIBLE);
        }
    }

    private void showEmptyState() {
        progress.setText("0 de 0 exercícios realizados");
        completed.setText("0");
        pending.setText("0");
        progressBar.setMax(1);
        progressBar.setProgress(0);
        exerciseList.clear();
        exercisePlanAdapter.notifyDataSetChanged();
        tvEmptyExercises.setVisibility(View.VISIBLE);
        recyclerExercises.setVisibility(View.GONE);
    }

    private void onDoExercise(PlanExerciseResponse pe) {
        Intent intent = new Intent(this, ExercisesDescriptionActivity.class);
        intent.putExtra("planExerciseId",      pe.getId());
        intent.putExtra("exerciseName",        pe.getExercise().getName());
        intent.putExtra("exerciseDescription", pe.getExercise().getExerciseDescription());
        intent.putExtra("instructions",        pe.getExercise().getInstructions());
        intent.putExtra("frequency",           pe.getFrequency());
        intent.putExtra("specificNotes",       pe.getSpecificNotes() != null ? pe.getSpecificNotes() : "");

        String youtubeUrl = "";
        if (pe.getExercise().getMediaList() != null && !pe.getExercise().getMediaList().isEmpty()) {
            youtubeUrl = pe.getExercise().getMediaList().get(0).getImageUrl();
        }
        intent.putExtra("youtubeUrl", youtubeUrl);
        startActivity(intent);
    }

    private static String capitalize(String s) {
        if (s == null || s.isEmpty()) return s;
        return s.substring(0, 1).toUpperCase() + s.substring(1);
    }
}