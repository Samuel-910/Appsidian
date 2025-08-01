import { Routes } from '@angular/router';

export const registroRoutes: Routes = [
    {
        path: 'registro',
        loadComponent: () =>
            import('./registro.component').then(m => m.RegistroComponent),
    }
];
