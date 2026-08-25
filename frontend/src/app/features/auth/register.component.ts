import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './register.component.html',
})
export class RegisterComponent {
    username = '';
    email = '';
    password = '';
    role: 'business' | 'volunteer' = 'volunteer';
    success = signal(false);
    error = signal('');

    constructor(private http: HttpClient) {}

    register(): void {
        this.http.post('http://127.0.0.1:8000/api/auth/register/', {
            username: this.username,
            email: this.email,
            password: this.password,
            role: this.role,
        }).subscribe({
            next: () => this.success.set(true),
            error: () => this.error.set('Не удалось зарегистрироваться - проверьте данные'),
        });
    }
}