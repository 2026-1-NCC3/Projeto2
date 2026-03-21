package com.example.projetomayamobile_rpg.network;

import com.example.projetomayamobile_rpg.model.LoginResponse;
import com.example.projetomayamobile_rpg.model.LoginRequest;


import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.POST;

public interface ApiService {

    @POST("LOGIN") //alterar para o endpoint correto mais para frente
    Call<LoginResponse> login(@Body LoginRequest body);
}
