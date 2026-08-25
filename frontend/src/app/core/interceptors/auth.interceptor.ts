import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const auth = inject(AuthService);
    const token = auth.getToken();
    const cloned = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

    return next(cloned).pipe(
        catchError((error: HttpErrorResponse) => {
            const isAuthEndpoint = req.url.includes('/api/auth/token/');
            if (error.status === 401 && !isAuthEndpoint) {
                return auth.refreshAccessToken().pipe(
                    switchMap(newToken => {
                        const retried = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
                        return next(retried);
                    }),
                    catchError(refreshError => {
                        auth.logout();
                        return throwError(() => refreshError);
                    }),
                );
            }
            return throwError(() => error);
        }),
    );
};