package com.example.projetomayamobile_rpg.model;

import java.util.List;

public class PageResponse<T> {
    private List<T> content;
    private int totalElements;
    private int totalPages;

    public List<T> getContent() { return content; }
    public int getTotalElements() { return totalElements; }
    public int getTotalPages() { return totalPages; }
}