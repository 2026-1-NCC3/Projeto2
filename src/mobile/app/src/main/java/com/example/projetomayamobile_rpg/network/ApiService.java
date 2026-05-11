package com.example.projetomayamobile_rpg.network;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.GET;
import retrofit2.http.Path;
import retrofit2.http.Query;

import com.example.projetomayamobile_rpg.model.AppointmentResponse;
import com.example.projetomayamobile_rpg.model.ChangePasswordRequest;
import com.example.projetomayamobile_rpg.model.ExecutionRequest;
import com.example.projetomayamobile_rpg.model.ExecutionResponse;
import com.example.projetomayamobile_rpg.model.ForgotPasswordRequest;
import com.example.projetomayamobile_rpg.model.LoginRequest;
import com.example.projetomayamobile_rpg.model.LoginResponse;
import com.example.projetomayamobile_rpg.model.MessageRequest;
import com.example.projetomayamobile_rpg.model.MessageResponse;
import com.example.projetomayamobile_rpg.model.PageResponse;
import com.example.projetomayamobile_rpg.model.PatientResponse;
import com.example.projetomayamobile_rpg.model.PlanResponse;
import com.example.projetomayamobile_rpg.model.VerifyCodeRequest;
import retrofit2.http.PATCH;
import com.example.projetomayamobile_rpg.model.ResetPasswordRequest;

import java.util.List;

public interface ApiService {

    @GET("patients")
    Call<PageResponse<PatientResponse>> getPatients(@Query("page") int page, @Query("size") int size);

    @POST("patients/login")
    Call<LoginResponse> login(@Body LoginRequest body);

    @GET("patients/{id}")
    Call<PatientResponse> getPatientById(@Path("id") Long id);

    @GET("plan")
    Call<PageResponse<PlanResponse>> getPlans(@Query("page") int page, @Query("size") int size);

    @GET("plan/patient/{patientId}")
    Call<PageResponse<PlanResponse>> getPlansByPatient(
            @Path("patientId") Long patientId,
            @Query("page") int page,
            @Query("size") int size);

    @GET("executions/plan-exercise/{planExerciseId}")
    Call<List<ExecutionResponse>> getExecutionsByPlanExercise(@Path("planExerciseId") Long planExerciseId);

    @POST("executions")
    Call<Void> registerExecution(@Body ExecutionRequest body);

    @POST("token/patient")
    Call<Void> forgotPassword(@Body ForgotPasswordRequest body);

    @POST("token/verify")
    Call<Boolean> verifyCode(@Body VerifyCodeRequest body);

    @PUT("patients/change-password")
    Call<Void> changePassword(@Body ChangePasswordRequest body);

    @GET("messages")
    Call<PageResponse<MessageResponse>> getMessages(@Query("page") int page, @Query("size") int size);

    @POST("messages")
    Call<MessageResponse> sendMessage(@Body MessageRequest body);

    /* Busca todas as consultas de um paciente específico */
    @GET("appointments/patient/{patientId}")
    Call<List<AppointmentResponse>> getAppointmentsByPatient(@Path("patientId") Long patientId);

    //  Envia o token FCM ao backend para receber notificações
    @PUT("patients/{id}/fcm-token")
    Call<Void> updateFcmToken(@Path("id") Long patientId, @Query("token") String token);

    @PATCH("patients/reset-password")
    Call<Void> resetPatientPassword(@Body ResetPasswordRequest body);
}