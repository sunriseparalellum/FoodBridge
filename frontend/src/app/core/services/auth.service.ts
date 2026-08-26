import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, switchMap } from 'rxjs';
import { API_BASE_URL } from '../config';

interface TokenResponse { access: string; refresh: string; }
interface MeResponse { id: number; username: string; role: 'business' | 'volunteer'; is_staff: boolean; }

@Injectable({ providedIn: 'root' })
export class AuthService {
    private accessSignal = signal<string | null>(null);
    private refreshSignal = signal<string | null>(null);
    private roleSignal = signal<'business' | 'volunteer' | null>(null);
    private userIdSignal = signal<number | null>(null);
    private isStaffSignal = signal<boolean>(false);

    constructor(private http: HttpClient) {}

    login(username: string, password: string): Observable<MeResponse> {
        return this.http.post<TokenResponse>(`${API_BASE_URL}/api/auth/token/`, { username, password }).pipe(
            tap(res => {
                this.accessSignal.set(res.access);
                this.refreshSignal.set(res.refresh);
            }),
            switchMap(() => this.http.get<MeResponse>(`${API_BASE_URL}/api/auth/me/`)),
            tap(me => {
                this.roleSignal.set(me.role);
                this.userIdSignal.set(me.id);
                this.isStaffSignal.set(me.is_staff);
            }),
        );
    }

    getToken(): string | null { return this.accessSignal(); }
    isLoggedIn(): boolean { return this.accessSignal() !== null; }
    getRole(): 'business' | 'volunteer' | null { return this.roleSignal(); }
    getUserId(): number | null { return this.userIdSignal(); }
    getIsStaff(): boolean { return this.isStaffSignal(); }

    refreshAccessToken(): Observable<string> {
        const refresh = this.refreshSignal();
        if (!refresh) {
            throw new Error('Нет refresh-токена - зайдите снова');
        }
        return this.http.post<{ access: string }>(`${API_BASE_URL}/api/auth/token/refresh/`, { refresh }).pipe(
            tap(res => this.accessSignal.set(res.access)),
            switchMap(res => [res.access]),
        );
    }

    changePassword(oldPassword: string, newPassword: string): Observable<any> {
        return this.http.post(`${API_BASE_URL}/api/auth/change-password/`, {
            old_password: oldPassword,
            new_password: newPassword,
        });
    }

    logout(): void {
        this.accessSignal.set(null);
        this.refreshSignal.set(null);
        this.roleSignal.set(null);
        this.userIdSignal.set(null);
        this.isStaffSignal.set(false);
    }
}