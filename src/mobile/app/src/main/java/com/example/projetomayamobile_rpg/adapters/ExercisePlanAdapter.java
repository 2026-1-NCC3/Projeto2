package com.example.projetomayamobile_rpg.adapters;

import android.content.Context;
import android.content.Intent;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.recyclerview.widget.RecyclerView;

import com.example.projetomayamobile_rpg.R;
import com.example.projetomayamobile_rpg.activitys_javaclass.ExercisesDescriptionActivity;
import com.example.projetomayamobile_rpg.model.PlanExerciseResponse;
import com.google.android.material.button.MaterialButton;

import java.util.List;

public class ExercisePlanAdapter extends RecyclerView.Adapter<ExercisePlanAdapter.ViewHolder> {

    private final List<PlanExerciseResponse> exercises;
    private final Context context;

    public ExercisePlanAdapter(Context context, List<PlanExerciseResponse> exercises) {
        this.context = context;
        this.exercises = exercises;
    }

    @Override
    public ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_exercise_plan, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(ViewHolder holder, int position) {
        PlanExerciseResponse pe = exercises.get(position);

        holder.name.setText(pe.getExercise().getName());
        holder.description.setText(pe.getExercise().getExerciseDescription());
        holder.frequency.setText(pe.getFrequency());

        // Imagem: por enquanto placeholder, futuramente carregar da URL
        holder.image.setImageResource(R.drawable.ic_profile);

        // Botão Iniciar — abre tela de descrição passando o ID do planExercise
        holder.btnStart.setOnClickListener(v -> {
            Intent intent = new Intent(context, ExercisesDescriptionActivity.class);
            intent.putExtra("planExerciseId", pe.getId());
            intent.putExtra("exerciseName", pe.getExercise().getName());
            intent.putExtra("exerciseDescription", pe.getExercise().getExerciseDescription());
            intent.putExtra("exerciseInstructions", pe.getExercise().getInstructions());
            intent.putExtra("exerciseFrequency", pe.getFrequency());
            context.startActivity(intent);
        });
    }

    @Override
    public int getItemCount() { return exercises.size(); }

    static class ViewHolder extends RecyclerView.ViewHolder {
        ImageView image;
        TextView name, description, frequency;
        MaterialButton btnStart;

        ViewHolder(View v) {
            super(v);
            image       = v.findViewById(R.id.exerciseImage);
            name        = v.findViewById(R.id.exerciseName);
            description = v.findViewById(R.id.exerciseDescription);
            frequency   = v.findViewById(R.id.exerciseFrequency);
            btnStart    = v.findViewById(R.id.btnStartExercise);
        }
    }
}