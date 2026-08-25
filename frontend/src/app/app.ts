import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <header class="nav">
      <div class="nav-inner">
        <a routerLink="/s2p">
          <img src="/assets/logo.png" alt="FoodBridge" class="nav-logo" />
        </a>
        <nav class="nav-links">
          <a routerLink="/s2p" routerLinkActive="active">S2P</a>
          @if (auth.getRole() === 'business') {
            <a routerLink="/producers" routerLinkActive="active">Калькулятор</a>
          }
          <a routerLink="/articles" routerLinkActive="active">Статьи</a>
        </nav>
        <div class="nav-auth">
          @if (auth.isLoggedIn()) {
            <a routerLink="/account" class="btn btn-outline btn-sm">Сменить пароль</a>
            <span class="nav-role">{{ auth.getRole() }}</span>
          } @else {
            <a routerLink="/login" class="btn btn-outline btn-sm">Войти</a>
            <a routerLink="/register" class="btn btn-primary btn-sm">Регистрация</a>
          }
        </div>
      </div>
    </header>
    <main class="container">
      <router-outlet></router-outlet>
    </main>
  `,
})
export class App {
  constructor(public auth: AuthService) {}
}