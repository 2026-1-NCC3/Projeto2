package com.example.projetomayamobile_rpg.adapters;

import com.google.gson.TypeAdapter;
import com.google.gson.stream.JsonReader;
import com.google.gson.stream.JsonToken;
import com.google.gson.stream.JsonWriter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Gson TypeAdapter que deserializa datas vindas do Spring Boot em dois formatos:
 *   - String ISO:  "2024-05-08T10:30:00"     (com write-dates-as-timestamps=false)
 *   - Array JSON:  [2024,5,8,10,30,0,0]       (padrão do Jackson sem configuração)
 *
 * Sempre produz uma String ISO "yyyy-MM-dd'T'HH:mm:ss" para uso interno.
 */
public class FlexibleDateAdapter extends TypeAdapter<String> {

    @Override
    public void write(JsonWriter out, String value) throws IOException {
        if (value == null) out.nullValue();
        else out.value(value);
    }

    @Override
    public String read(JsonReader in) throws IOException {
        JsonToken token = in.peek();

        if (token == JsonToken.NULL) {
            in.nextNull();
            return null;
        }

        if (token == JsonToken.STRING) {
            return in.nextString();
        }

        if (token == JsonToken.BEGIN_ARRAY) {
            // Array format: [year, month, day, hour, minute, second, nano?]
            in.beginArray();
            List<Integer> parts = new ArrayList<>();
            while (in.hasNext()) {
                parts.add(in.nextInt());
            }
            in.endArray();

            if (parts.size() < 5) return null;

            int year   = parts.get(0);
            int month  = parts.get(1);
            int day    = parts.get(2);
            int hour   = parts.get(3);
            int minute = parts.get(4);
            int second = parts.size() > 5 ? parts.get(5) : 0;

            return String.format("%04d-%02d-%02dT%02d:%02d:%02d",
                    year, month, day, hour, minute, second);
        }

        // fallback
        in.skipValue();
        return null;
    }
}