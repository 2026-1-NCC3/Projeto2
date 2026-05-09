package com.example.projetomayamobile_rpg.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.projetomayamobile_rpg.R;
import com.example.projetomayamobile_rpg.model.ExecutionHistoryItem;
import com.example.projetomayamobile_rpg.utils.DateUtils;

import java.util.List;

public class HistoryExecutionAdapter extends RecyclerView.Adapter<RecyclerView.ViewHolder> {

    private static final int VIEW_TYPE_HEADER    = 0;
    private static final int VIEW_TYPE_EXECUTION = 1;

    private final List<ExecutionHistoryItem> items;

    public HistoryExecutionAdapter(List<ExecutionHistoryItem> items) {
        this.items = items;
    }

    @Override
    public int getItemViewType(int position) {
        return items.get(position).getType() == ExecutionHistoryItem.Type.DATE_HEADER
                ? VIEW_TYPE_HEADER
                : VIEW_TYPE_EXECUTION;
    }

    @NonNull
    @Override
    public RecyclerView.ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        LayoutInflater inf = LayoutInflater.from(parent.getContext());
        if (viewType == VIEW_TYPE_HEADER) {
            View v = inf.inflate(R.layout.item_history_header, parent, false);
            return new HeaderViewHolder(v);
        } else {
            View v = inf.inflate(R.layout.item_history_execution, parent, false);
            return new ExecutionViewHolder(v);
        }
    }

    @Override
    public void onBindViewHolder(@NonNull RecyclerView.ViewHolder holder, int position) {
        ExecutionHistoryItem item = items.get(position);
        if (holder instanceof HeaderViewHolder) {
            ((HeaderViewHolder) holder).bind(item);
        } else {
            ((ExecutionViewHolder) holder).bind(item);
        }
    }

    @Override
    public int getItemCount() { return items.size(); }

    // ── ViewHolder: cabeçalho de data ──────────────────────────────────────────
    static class HeaderViewHolder extends RecyclerView.ViewHolder {
        final TextView tvDate;

        HeaderViewHolder(View v) {
            super(v);
            tvDate = v.findViewById(R.id.tvHistoryDate);
        }

        void bind(ExecutionHistoryItem item) {
            tvDate.setText(DateUtils.formatDisplayDate(item.getDate()));
        }
    }

    // ── ViewHolder: item de execução ───────────────────────────────────────────
    static class ExecutionViewHolder extends RecyclerView.ViewHolder {
        final TextView tvName, tvTime, tvPain, tvStatus;

        ExecutionViewHolder(View v) {
            super(v);
            tvName   = v.findViewById(R.id.tvExerciseNameHistory);
            tvTime   = v.findViewById(R.id.tvExecutionTime);
            tvPain   = v.findViewById(R.id.tvPainLevel);
            tvStatus = v.findViewById(R.id.tvExecutionStatus);
        }

        void bind(ExecutionHistoryItem item) {
            tvName.setText(item.getExerciseName());
            tvTime.setText(DateUtils.formatTime(item.getExecutedAt()));
            tvPain.setText("Dor: " + DateUtils.mapPainScale(item.getPainScale()));

            if (item.isCompleted()) {
                tvStatus.setText("✓ Concluído");
                tvStatus.setTextColor(tvStatus.getContext().getColor(R.color.green));
            } else {
                tvStatus.setText("✗ Incompleto");
                tvStatus.setTextColor(tvStatus.getContext().getColor(R.color.red));
            }
        }
    }
}