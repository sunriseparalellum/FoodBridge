import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const businessGuard = () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (auth.getRole() === 'business') return true;
    router.navigate(['/s2p']);
    return false;
};