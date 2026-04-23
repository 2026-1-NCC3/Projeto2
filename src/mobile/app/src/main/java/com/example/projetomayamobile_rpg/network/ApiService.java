package com.example.projetomayamobile_rpg.network;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.POST;
import retrofit2.http.GET;

import com.example.projetomayamobile_rpg.model.DashboardResponse;
import com.example.projetomayamobile_rpg.model.LoginRequest;

public interface ApiService {

    @POST("/patients/login")
    Call<String> login(@Body LoginRequest body);

    @GET("/patients/dashboard")  // mudar pra rota correta
    Call<DashboardResponse> getDashboard();
}