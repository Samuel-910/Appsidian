import { Routes } from '@angular/router';

export const authRoutes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('../noticias/noticias.component').then(m => m.NewsPortalComponent),
    },
    {
        path: 'register',
        loadComponent: () =>
            import('../authentication/register/register.component').then(m => m.RegisterComponent),
    },
    {
        path: 'verificacion',
        loadComponent: () =>
            import('../authentication/password-recovery/password-recovery.component').then(m => m.PasswordRecoveryComponent),
    },
    {
        path: 'verificacioncodigo',
        loadComponent: () =>
            import('../authentication/verification-code/verification-code.component').then(m => m.VerificationCodeComponent),
    }
];
