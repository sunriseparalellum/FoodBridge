import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../core/config';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './register.component.html',
})
export class RegisterComponent {
    username = '';
    email = '';
    phone = '';
    password = '';
    role: 'business' | 'volunteer' | 'charity' = 'volunteer';
    success = signal(false);
    error = signal('');

    constructor(private http: HttpClient) {}

    register(): void {
        this.http.post(`${API_BASE_URL}/api/auth/register/`, {
            username: this.username,
            email: this.email,
            phone: this.phone,
            password: this.password,
            role: this.role,
        }).subscribe({
            next: () => this.success.set(true),
            error: err => this.error.set(this.getRegisterError(err)),
        });
    }

    private getRegisterError(error: { error?: Record<string, string[] | string> }): string {
        const details = error.error;
        if (details && typeof details === 'object') {
            return Object.entries(details)
                .map(([field, value]) => `${field}: ${Array.isArray(value) ? value.join(', ') : value}`)
                .join('; ');
        }
        return 'Не удалось зарегистрироваться - проверьте данные';
    }
}