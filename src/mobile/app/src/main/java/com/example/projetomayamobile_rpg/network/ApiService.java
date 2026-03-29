package com.example.projetomayamobile_rpg.network;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.POST;

import com.example.projetomayamobile_rpg.model.LoginRequest;

public interface ApiService {

    @POST("/patients/login")
    Call<String> login(@Body LoginRequest body);
}