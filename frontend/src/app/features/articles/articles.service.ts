import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/config';

export interface Article {
    id: number;
    title: string;
    slug: string;
    summary: string;
    body: string;
    cover_image_url: string;
    external_url: string;
    og_title: string;
    og_description: string;
    og_image: string;
    published_at: string;
}

@Injectable({ providedIn: 'root' })
export class ArticlesService {
    private baseUrl = `${API_BASE_URL}/api/articles`;

    constructor(private http: HttpClient) {}

    getArticles(): Observable<Article[]> {
        return this.http.get<Article[]>(`${this.baseUrl}/list/`);
    }

    createArticle(article: Partial<Article>): Observable<Article> {
        return this.http.post<Article>(`${this.baseUrl}/list/`, article);
    }

    deleteArticle(slugOrId: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/list/${slugOrId}/`);
    }
}
