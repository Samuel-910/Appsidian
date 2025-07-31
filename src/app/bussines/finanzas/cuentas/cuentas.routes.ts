import { Routes } from '@angular/router';

export const cuentasRoutes: Routes = [
    {
        path: 'cuentas',
        loadComponent: () =>
            import('./cuentas.component').then(m => m.CuentasComponent),
    }
];
