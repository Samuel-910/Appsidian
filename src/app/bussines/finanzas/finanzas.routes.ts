import { Routes } from '@angular/router';
import { cuentasRoutes } from './cuentas/cuentas.routes';

export const finanzasRoutes: Routes = [
    {
        path: '',
        children: [
            ...cuentasRoutes,
        ]
    }
];
