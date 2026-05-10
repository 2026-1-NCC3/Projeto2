package com.example.projetomayamobile_rpg.workers;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;

import com.example.projetomayamobile_rpg.R;
import com.example.projetomayamobile_rpg.activitys_javaclass.MessagesActivity;
import com.example.projetomayamobile_rpg.network.ApiService;
import com.example.projetomayamobile_rpg.network.RetrofitClient;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MayaFirebaseMessagingService extends FirebaseMessagingService {

    private static final String TAG = "FCM";
    private static final String CHANNEL_ID = "messages_channel";

    /**
     * Chamado quando chega uma mensagem push com o app em foreground.
     * Quando o app está fechado, o Firebase exibe a notificação automaticamente.
     */
    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);

        String title = "Maya Yamamoto — Nova mensagem";
        String body  = "Você recebeu uma nova mensagem.";

        // Usa o conteúdo enviado pelo backend se disponível
        if (remoteMessage.getNotification() != null) {
            if (remoteMessage.getNotification().getTitle() != null)
                title = remoteMessage.getNotification().getTitle();
            if (remoteMessage.getNotification().getBody() != null)
                body = remoteMessage.getNotification().getBody();
        }

        sendNotification(title, body);
    }

    /**
     * Chamado quando o token FCM do dispositivo é gerado ou renovado.
     * Salva localmente e envia ao backend para que ele saiba para
     * qual dispositivo mandar o push quando o admin enviar mensagem.
     */
    @Override
    public void onNewToken(@NonNull String token) {
        super.onNewToken(token);
        Log.d(TAG, "Token FCM gerado: " + token);

        // Salva o token localmente
        getSharedPreferences("auth", MODE_PRIVATE)
                .edit()
                .putString("fcm_token", token)
                .apply();

        // Envia ao backend se o paciente já estiver logado
        sendTokenToBackend(token);
    }

    private void sendTokenToBackend(String token) {
        SharedPreferences prefs = getSharedPreferences("auth", MODE_PRIVATE);
        long patientId = prefs.getLong("patient_id", -1);

        // Só envia se houver sessão ativa
        if (patientId == -1) return;

        ApiService api = RetrofitClient.getInstance(this).create(ApiService.class);
        api.updateFcmToken(patientId, token).enqueue(new Callback<Void>() {
            @Override
            public void onResponse(@NonNull Call<Void> call, @NonNull Response<Void> response) {
                if (response.isSuccessful()) {
                    Log.d(TAG, "Token FCM enviado ao backend com sucesso.");
                } else {
                    Log.w(TAG, "Falha ao enviar token FCM: " + response.code());
                }
            }

            @Override
            public void onFailure(@NonNull Call<Void> call, @NonNull Throwable t) {
                Log.e(TAG, "Erro de conexão ao enviar token FCM: " + t.getMessage());
            }
        });
    }

    private void sendNotification(String title, String body) {
        NotificationManager manager =
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Mensagens",
                    NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Notificações de novas mensagens do seu profissional");
            manager.createNotificationChannel(channel);
        }

        // Ao tocar abre direto na tela de mensagens
        Intent intent = new Intent(this, MessagesActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                this, 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_launcher_foreground)
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setContentIntent(pendingIntent)
                .setAutoCancel(true);

        manager.notify(1002, builder.build());
    }
}