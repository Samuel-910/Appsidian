import { Routes } from '@angular/router';
import { cuentasRoutes } from './cuentas/cuentas.routes';
import { categoriaRoutes } from './categoria/categoria.routes';

export const finanzasRoutes: Routes = [
    {
        path: '',
        children: [
            ...cuentasRoutes,
            ...categoriaRoutes,
        ]
    }
];
