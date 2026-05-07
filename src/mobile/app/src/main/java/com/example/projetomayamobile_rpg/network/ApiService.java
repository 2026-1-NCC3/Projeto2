package com.example.projetomayamobile_rpg.network;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.GET;
import retrofit2.http.Path;
import retrofit2.http.Query;

import com.example.projetomayamobile_rpg.model.ForgotPasswordRequest;
import com.example.projetomayamobile_rpg.model.LoginRequest;
import com.example.projetomayamobile_rpg.model.PageResponse;
import com.example.projetomayamobile_rpg.model.PatientResponse;
import com.example.projetomayamobile_rpg.model.PlanResponse;
import com.example.projetomayamobile_rpg.model.VerifyCodeRequest;

public interface ApiService {

    @GET("patients")
    Call<PageResponse<PatientResponse>> getPatients(@Query("page") int page, @Query("size") int size);

    @POST("patients/login")
    Call<String> login(@Body LoginRequest body);

    @GET("patients/{id}")
    Call<PatientResponse> getPatientById(@Path("id") Long id);

    @GET("plan")
    Call<PageResponse<PlanResponse>> getPlans(@Query("page") int page, @Query("size") int size);

    // TODO: substituir pelo path real
    @POST("auth/forgot-password")
    Call<Void> forgotPassword(@Body ForgotPasswordRequest body);

    // TODO: substituir pelo path real
    @POST("auth/verify-code")
    Call<Void> verifyCode(@Body VerifyCodeRequest body);

    // TODO: substituir pelo path real
    @POST("auth/reset-password")
    Call<Void> resetPassword(@Body ResetPasswordRequest body);

    // TODO: placeholder temporário para criar a build, apagar depois
    Call<Void> registerExecution(Map<String, Object> body);
}