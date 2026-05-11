package com.example.projetomayamobile_rpg.workers;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import com.example.projetomayamobile_rpg.R;
import com.example.projetomayamobile_rpg.activitys_javaclass.DashboardActivity;
import com.example.projetomayamobile_rpg.model.PageResponse;
import com.example.projetomayamobile_rpg.model.PlanResponse;
import com.example.projetomayamobile_rpg.network.ApiService;
import com.example.projetomayamobile_rpg.network.RetrofitClient;

import retrofit2.Response;

public class ExerciseReminderWorker extends Worker {

    private static final String CHANNEL_ID = "exercise_reminder_channel";

    public ExerciseReminderWorker(@NonNull Context context, @NonNull WorkerParameters params) {
        super(context, params);
    }

    @NonNull
    @Override
    public Result doWork() {
        Context context = getApplicationContext();

        SharedPreferences prefs = context.getSharedPreferences("auth", Context.MODE_PRIVATE);
        long patientId = prefs.getLong("patient_id", -1);

        if (patientId == -1) return Result.success();

        try {
            ApiService api = RetrofitClient.getInstance(context).create(ApiService.class);

            // Chamada síncrona — doWork já roda em thread de background
            Response<PageResponse<PlanResponse>> response =
                    api.getPlansByPatient(patientId, 0, 50).execute();

            if (response.isSuccessful() && response.body() != null) {
                int totalExercises = 0;

                for (PlanResponse plan : response.body().getContent()) {
                    if ("ATIVO".equals(plan.getStatus()) && plan.getPlanExercises() != null) {
                        totalExercises += plan.getPlanExercises().size();
                    }
                }

                // Só notifica se houver exercícios ativos
                if (totalExercises > 0) {
                    sendNotification(context, totalExercises);
                }
            }

            return Result.success();

        } catch (Exception e) {
            return Result.retry();
        }
    }

    private void sendNotification(Context context, int totalExercises) {
        NotificationManager manager =
                (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Lembrete de Exercícios",
                    NotificationManager.IMPORTANCE_DEFAULT
            );
            channel.setDescription("Notificações diárias para lembrar de realizar os exercícios");
            manager.createNotificationChannel(channel);
        }

        Intent intent = new Intent(context, DashboardActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                context, 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        String mensagem = totalExercises == 1
                ? "Você tem 1 exercício para realizar hoje. Vamos lá!"
                : "Você tem " + totalExercises + " exercícios para realizar hoje. Vamos lá!";

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_launcher_foreground)
                .setContentTitle("MayaCare — Hora de se exercitar!")
                .setContentText(mensagem)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(mensagem))
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                .setContentIntent(pendingIntent)
                .setAutoCancel(true);

        manager.notify(1001, builder.build());
    }
}