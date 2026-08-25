import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="auth-shell">
      <div class="card">
        <h3>Вход</h3>
        <div class="field"><label>Username</label><input [(ngModel)]="username" name="username" /></div>
        <div class="field"><label>Пароль</label><input [(ngModel)]="password" type="password" name="password" /></div>
        <button class="btn btn-primary" style="width: 100%; justify-content: center;" (click)="login()">Войти</button>
        @if (error) {
          <p style="color: var(--color-danger); margin-top: 8px;">{{ error }}</p>
        }
      </div>
    </div>
  `,
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  login(): void {
    this.auth.login(this.username, this.password).subscribe({
      next: () => this.router.navigate(['/s2p']),
      error: () => this.error = 'Неверный логин или пароль',
    });
  }
}