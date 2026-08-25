import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-change-password',
    standalone: true,
    imports: [FormsModule, CommonModule],
    templateUrl: 'change-password.component.html',
})
export class ChangePasswordComponent {
    oldPassword = '';
    newPassword = '';
    confirmPassword = '';
    error = signal('');
    success = signal(false);

    constructor(private auth: AuthService) {}

    submit(): void {
        this.error.set('');
        this.success.set(false);

        if (this.newPassword !== this.confirmPassword) {
            this.error.set('Новые пароли не совпадают');
            return;
        }

        this.auth.changePassword(this.oldPassword, this.newPassword).subscribe({
            next: () => {
                this.success.set(true);
                this.oldPassword = '';
                this.newPassword = '';
                this.confirmPassword = '';
            },
            error: err => {
                this.error.set(err.error?.detail || err.error?.new_password?.[0] || 'Не удалось сменить пароль');
            },
        });
    }
}