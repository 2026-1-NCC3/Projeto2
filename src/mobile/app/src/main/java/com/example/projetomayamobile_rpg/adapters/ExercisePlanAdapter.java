package com.example.projetomayamobile_rpg.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.example.projetomayamobile_rpg.R;
import com.example.projetomayamobile_rpg.model.ExerciseMediaResponse;
import com.example.projetomayamobile_rpg.model.PlanExerciseResponse;
import com.google.android.material.button.MaterialButton;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ExercisePlanAdapter extends RecyclerView.Adapter<ExercisePlanAdapter.ViewHolder> {

    public interface OnExerciseClickListener {
        void onDoExercise(PlanExerciseResponse planExercise);
    }

    private final List<PlanExerciseResponse> exercises;
    private final OnExerciseClickListener listener;

    public ExercisePlanAdapter(List<PlanExerciseResponse> exercises, OnExerciseClickListener listener) {
        this.exercises = exercises;
        this.listener = listener;
    }

    @Override
    public ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.exercise_plan_item, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(ViewHolder holder, int position) {
        PlanExerciseResponse pe = exercises.get(position);

        holder.tvName.setText(pe.getExercise().getName());
        holder.tvDesc.setText(pe.getExercise().getExerciseDescription());
        holder.tvFrequency.setText(pe.getFrequency());

        // Thumbnail do YouTube
        List<ExerciseMediaResponse> mediaList = pe.getExercise().getMediaList();
        String youtubeId = null;
        if (mediaList != null && !mediaList.isEmpty()) {
            youtubeId = extractYoutubeId(mediaList.get(0).getImageUrl());
        }

        if (youtubeId != null) {
            holder.ivPlaceholder.setVisibility(View.GONE);
            holder.tvYtBadge.setVisibility(View.VISIBLE);
            String thumbnailUrl = "https://img.youtube.com/vi/" + youtubeId + "/hqdefault.jpg";
            Glide.with(holder.ivThumbnail.getContext())
                    .load(thumbnailUrl)
                    .placeholder(R.color.lightgrey)
                    .error(R.color.lightgrey)
                    .into(holder.ivThumbnail);
        } else {
            holder.ivPlaceholder.setVisibility(View.VISIBLE);
            holder.tvYtBadge.setVisibility(View.GONE);
            holder.ivThumbnail.setImageDrawable(null);
        }

        holder.btnDoExercise.setOnClickListener(v -> listener.onDoExercise(pe));
    }

    @Override
    public int getItemCount() { return exercises.size(); }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvName, tvDesc, tvFrequency, tvYtBadge;
        ImageView ivThumbnail, ivPlaceholder;
        MaterialButton btnDoExercise;

        ViewHolder(View v) {
            super(v);
            tvName       = v.findViewById(R.id.tvExerciseName);
            tvDesc       = v.findViewById(R.id.tvExerciseDesc);
            tvFrequency  = v.findViewById(R.id.tvFrequency);
            tvYtBadge    = v.findViewById(R.id.tvYtBadge);
            ivThumbnail  = v.findViewById(R.id.ivThumbnail);
            ivPlaceholder = v.findViewById(R.id.ivPlaceholder);
            btnDoExercise = v.findViewById(R.id.btnDoExercise);
        }
    }

    public static String extractYoutubeId(String url) {
        if (url == null || url.isEmpty()) return null;
        // Remove protocolo e www
        url = url.replace("https://", "").replace("http://", "").replace("www.", "");
        String[] patterns = {
                "youtube\\.com/watch\\?v=([^&\\n?#]+)",
                "youtu\\.be/([^&\\n?#]+)",
                "youtube\\.com/embed/([^&\\n?#]+)",
                "youtube\\.com/shorts/([^&\\n?#]+)",
                "youtube\\.com/v/([^&\\n?#]+)"
        };
        for (String p : patterns) {
            Matcher m = Pattern.compile(p).matcher(url);
            if (m.find()) return m.group(1);
        }
        // fallback: tenta pegar o v=ID em qualquer lugar
        Matcher m = Pattern.compile("v=([^&\\n?#]+)").matcher(url);
        if (m.find()) return m.group(1);
        return null;
    }
}