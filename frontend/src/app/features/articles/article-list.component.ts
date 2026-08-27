import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArticlesService, Article } from './articles.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-article-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './article-list.component.html',
})
export class ArticleListComponent implements OnInit {
    articles = signal<Article[]>([]);
    expandedId = signal<number | null>(null);

    showCreateForm = signal(false);
    contentType = signal<'own' | 'external'>('own');
    title = '';
    summary = '';
    body = '';
    coverImageUrl = '';
    externalUrl = '';
    createError = signal('');

    constructor(private articlesService: ArticlesService, public auth: AuthService) {}

    ngOnInit(): void {
        this.load();
    }

    load(): void {
        this.articlesService.getArticles().subscribe({
            next: data => this.articles.set(data),
            error: err => console.error('Ошибка загрузки статей:', err),
        });
    }

    toggle(id: number): void {
        this.expandedId.set(this.expandedId() === id ? null : id);
    }

    toggleCreateForm(): void {
        this.showCreateForm.update(v => !v);
    }

    submitArticle(): void {
        this.createError.set('');
        const payload: Partial<Article> = { title: this.title, summary: this.summary };
        if (this.contentType() === 'own') {
            payload.body = this.body;
            payload.cover_image_url = this.coverImageUrl;
        } else {
            payload.external_url = this.externalUrl;
        }
        this.articlesService.createArticle(payload).subscribe({
            next: () => {
                this.resetForm();
                this.showCreateForm.set(false);
                this.load();
            },
            error: () => this.createError.set('Не удалось создать статью - проверьте поля'),
        });
    }

    deleteArticle(id: string): void {
        if (!confirm('Удалить статью?')) return;
        this.articlesService.deleteArticle(id).subscribe({
            next: () => this.load(),
            error: err => console.error('Ошибка удаления:', err),
        });
    }

    private resetForm(): void {
        this.title = '';
        this.summary = '';
        this.body = '';
        this.coverImageUrl = '';
        this.externalUrl = '';
    }
}
