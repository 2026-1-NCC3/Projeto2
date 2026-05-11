package com.example.projetomayamobile_rpg.workers;

import android.content.Context;

import androidx.work.Constraints;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.NetworkType;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;

import java.util.Calendar;
import java.util.concurrent.TimeUnit;

public class NotificationScheduler {

    private static final String WORK_TAG = "exercise_reminder";

    public static void schedule(Context context) {
        long delayMinutes = calculateDelayUntil8am();

        // Exige conexão com internet para buscar os exercícios
        Constraints constraints = new Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build();

        PeriodicWorkRequest workRequest =
                new PeriodicWorkRequest.Builder(ExerciseReminderWorker.class, 24, TimeUnit.HOURS)
                        .setInitialDelay(delayMinutes, TimeUnit.MINUTES)
                        .setConstraints(constraints)
                        .addTag(WORK_TAG)
                        .build();

        WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                WORK_TAG,
                ExistingPeriodicWorkPolicy.KEEP,
                workRequest
        );
    }

    public static void cancel(Context context) {
        WorkManager.getInstance(context).cancelAllWorkByTag(WORK_TAG);
    }

    private static long calculateDelayUntil8am() {
        Calendar now    = Calendar.getInstance();
        Calendar target = Calendar.getInstance();
        target.set(Calendar.HOUR_OF_DAY, 10);
        target.set(Calendar.MINUTE, 0);
        target.set(Calendar.SECOND, 0);
        target.set(Calendar.MILLISECOND, 66);

        if (now.after(target)) {
            target.add(Calendar.DAY_OF_MONTH, 1);
        }

        long diffMillis = target.getTimeInMillis() - now.getTimeInMillis();
        return TimeUnit.MILLISECONDS.toMinutes(diffMillis);
    }
}