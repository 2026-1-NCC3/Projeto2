package com.example.projetomayamobile_rpg.activitys_javaclass;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.TextUtils;
import android.util.Log;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.projetomayamobile_rpg.R;
import com.example.projetomayamobile_rpg.adapters.MessagesAdapter;
import com.example.projetomayamobile_rpg.model.MessageRequest;
import com.example.projetomayamobile_rpg.model.MessageResponse;
import com.example.projetomayamobile_rpg.model.PageResponse;
import com.example.projetomayamobile_rpg.network.ApiService;
import com.example.projetomayamobile_rpg.network.RetrofitClient;
import com.google.android.material.bottomnavigation.BottomNavigationView;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MessagesActivity extends AppCompatActivity {

    private RecyclerView recyclerMessages;
    private EditText etMessage;
    private ImageButton btnSend;

    private MessagesAdapter adapter;
    private List<MessageResponse> messageList = new ArrayList<>();

    private Long patientId;
    private Long knownAdminId = 1L;

    private final Handler pollHandler = new Handler(Looper.getMainLooper());
    private boolean isSending = false;

    private final Runnable pollRunnable = new Runnable() {
        @Override
        public void run() {
            fetchMessages(true);
            pollHandler.postDelayed(this, 5000);
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.messages_activity);

        recyclerMessages = findViewById(R.id.recyclerMessages);
        etMessage = findViewById(R.id.etMessage);
        btnSend = findViewById(R.id.btnSend);

        SharedPreferences prefs = getSharedPreferences("auth", MODE_PRIVATE);
        patientId = prefs.getLong("patient_id", -1);

        LinearLayoutManager layoutManager = new LinearLayoutManager(this);
        layoutManager.setStackFromEnd(true);
        recyclerMessages.setLayoutManager(layoutManager);

        adapter = new MessagesAdapter(messageList);
        recyclerMessages.setAdapter(adapter);

        btnSend.setOnClickListener(v -> sendMessage());

        setupBottomNavigation();
    }

    @Override
    protected void onResume() {
        super.onResume();
        fetchMessages(false);
        pollHandler.postDelayed(pollRunnable, 5000);
    }

    @Override
    protected void onPause() {
        super.onPause();
        pollHandler.removeCallbacks(pollRunnable);
    }

    private void fetchMessages(boolean silent) {
        ApiService api = RetrofitClient.getInstance(this).create(ApiService.class);
        api.getMessages(0, 1000).enqueue(new Callback<PageResponse<MessageResponse>>() {
            @Override
            public void onResponse(Call<PageResponse<MessageResponse>> call, Response<PageResponse<MessageResponse>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<MessageResponse> allMessages = response.body().getContent();
                    List<MessageResponse> myMessages = new ArrayList<>();

                    for (MessageResponse msg : allMessages) {
                        if (msg.getPatient() != null && msg.getPatient().getId().equals(patientId)) {
                            myMessages.add(msg);
                            if (msg.getAdmin() != null) {
                                knownAdminId = msg.getAdmin().getId();
                            }
                        }
                    }

                    Collections.sort(myMessages, (m1, m2) -> m1.getSentAt().compareTo(m2.getSentAt()));

                    boolean shouldScroll = messageList.size() != myMessages.size();
                    adapter.updateMessages(myMessages);

                    if (shouldScroll && myMessages.size() > 0 && !silent) {
                        recyclerMessages.scrollToPosition(myMessages.size() - 1);
                    }
                }
            }

            @Override
            public void onFailure(Call<PageResponse<MessageResponse>> call, Throwable t) {
                Log.e("Messages", "Erro ao carregar mensagens", t);
            }
        });
    }

    private void sendMessage() {
        String text = etMessage.getText().toString().trim();
        if (TextUtils.isEmpty(text) || isSending) return;

        isSending = true;
        etMessage.setText("");

        ApiService api = RetrofitClient.getInstance(this).create(ApiService.class);
        MessageRequest request = new MessageRequest(text, patientId, knownAdminId);

        api.sendMessage(request).enqueue(new Callback<MessageResponse>() {
            @Override
            public void onResponse(Call<MessageResponse> call, Response<MessageResponse> response) {
                isSending = false;
                if (response.isSuccessful()) {
                    fetchMessages(false);
                } else {
                    Toast.makeText(MessagesActivity.this, "Erro ao enviar.", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<MessageResponse> call, Throwable t) {
                isSending = false;
                Toast.makeText(MessagesActivity.this, "Falha de conexão.", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void setupBottomNavigation() {
        BottomNavigationView bottomNav = findViewById(R.id.bottomNav);
        bottomNav.setSelectedItemId(R.id.menu_messages);             // ← CORRIGIDO
        bottomNav.setOnItemSelectedListener(item -> {
            int id = item.getItemId();
            if (id == R.id.menu_home) {
                startActivity(new Intent(this, DashboardActivity.class));
                finish();
                return true;
            }
            if (id == R.id.menu_exercises) {
                startActivity(new Intent(this, ExercisesActivity.class));
                finish();
                return true;
            }
            if (id == R.id.menu_messages) return true;               // ← CORRIGIDO
            if (id == R.id.menu_history) {
                startActivity(new Intent(this, HistoryActivity.class));
                finish();
                return true;
            }
            if (id == R.id.menu_profile) {
                startActivity(new Intent(this, ProfileActivity.class));
                finish();
                return true;
            }
            return false;
        });
    }
}