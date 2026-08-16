// src/app/core/models/movie.model.ts

export interface MovieResult {
  title: string;
  overview: string;
  poster_path: string;
}

export interface MovieError {
  error: string;
}

export interface MovieReviewSource {
  title?: string | null;
  rating?: number | string | null;
  year?: number | string | null;
  error?: string | null;
}

export interface MovieRatings {
  cinemeta: MovieReviewSource;
  omdb: MovieRatingEntry[] | MovieError;
  letterboxd: MovieReviewSource;
}

export interface MovieRatingEntry {
  [source: string]: MovieRatingDetail;
}

export interface MovieRatingDetail {
  title?: string;
  movie_title?: string;
  rating?: number | string | null;
  vote_count?: number | null;
  year?: string | number | null;
  source_name?: string;
}