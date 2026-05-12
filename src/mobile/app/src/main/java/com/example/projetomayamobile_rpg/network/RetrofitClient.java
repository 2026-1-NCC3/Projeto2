package com.example.projetomayamobile_rpg.network;

import android.content.Context;
import android.content.SharedPreferences;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.converter.scalars.ScalarsConverterFactory;

public class RetrofitClient {

    private static Retrofit instance;
    private static final String BASE_URL = "https://projeto-maya-rpg-production.up.railway.app/";

    public static Retrofit getInstance(Context context) {
        if (instance == null) {

            HttpLoggingInterceptor logging = new HttpLoggingInterceptor();
            logging.setLevel(HttpLoggingInterceptor.Level.BODY);

            // Lê o token salvo no login
            SharedPreferences prefs = context.getSharedPreferences("auth", Context.MODE_PRIVATE);
            String token = prefs.getString("token", "");

            OkHttpClient client = new OkHttpClient.Builder()
                    .addInterceptor(logging)
                    .addInterceptor(chain -> {
                        Request original = chain.request();
                        Request request = original.newBuilder()
                                .header("Authorization", "Bearer " + token)
                                .build();
                        return chain.proceed(request);
                    })
                    .build();

            Gson gson = new GsonBuilder()
                    .setLenient()
                    .create();

            instance = new Retrofit.Builder()
                    .baseUrl(BASE_URL)
                    .client(client)
                    .addConverterFactory(ScalarsConverterFactory.create())  // recebe texto puro
                    .addConverterFactory(GsonConverterFactory.create(gson))  // envia JSON
                    .build();
        }
        return instance;
    }

    public static Retrofit getInstance() {
        if (instance == null) {
            throw new IllegalStateException("Chame getInstance(context) primeiro!");
        }
        return instance;
    }

    public static void resetInstance() {
        instance = null;
    }
}