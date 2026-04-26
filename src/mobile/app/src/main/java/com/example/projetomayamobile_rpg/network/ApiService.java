package com.example.projetomayamobile_rpg.network;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.POST;
import retrofit2.http.GET;
import retrofit2.http.Path;
import retrofit2.http.Query;

import com.example.projetomayamobile_rpg.model.LoginRequest;
import com.example.projetomayamobile_rpg.model.PageResponse;
import com.example.projetomayamobile_rpg.model.PatientResponse;
import com.example.projetomayamobile_rpg.model.PlanResponse;

public interface ApiService {

    @GET("patients")
    Call<PageResponse<PatientResponse>> getPatients(@Query("page") int page, @Query("size") int size);

    @POST("/patients/login")
    Call<String> login(@Body LoginRequest body);

    @GET("patients/{id}")
    Call<PatientResponse> getPatientById(@Path("id") Long id);

    @GET("plan")
    Call<PageResponse<PlanResponse>> getPlans(@Query("page") int page, @Query("size") int size);

}