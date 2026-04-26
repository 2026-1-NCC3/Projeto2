package com.example.projetomayamobile_rpg.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.recyclerview.widget.RecyclerView;
import com.example.projetomayamobile_rpg.R;
import com.example.projetomayamobile_rpg.model.PlanExerciseResponse;
import java.util.List;

public class ExerciseAdapter extends RecyclerView.Adapter<ExerciseAdapter.ViewHolder> {

    private List<PlanExerciseResponse> exercises;

    public ExerciseAdapter(List<PlanExerciseResponse> exercises) {
        this.exercises = exercises;
    }

    @Override
    public ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.exercises_dashboard_recycler, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(ViewHolder holder, int position) {
        PlanExerciseResponse pe = exercises.get(position);
        holder.name.setText(pe.getExercise().getName());
        holder.frequency.setText(pe.getFrequency());
    }

    @Override
    public int getItemCount() { return exercises.size(); }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView name, frequency;
        ViewHolder(View v) {
            super(v);
            name      = v.findViewById(R.id.exerciseName);
            frequency = v.findViewById(R.id.exerciseFrequency);
        }
    }
}