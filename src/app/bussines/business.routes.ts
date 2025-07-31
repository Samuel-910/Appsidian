import { Routes } from '@angular/router';
import { tiposRoutes } from './tipos/tipos.routes';
import { contenidoRoutes } from './contenido/contenido.routes';
import { finanzasRoutes } from './finanzas/finanzas.routes';

export const businessRoutes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('../bussines/layouts/business-layout.component').then(m => m.BusinessLayoutComponent),
        children: [
            ...tiposRoutes,
            ...contenidoRoutes,
            ...finanzasRoutes
        ]
    }
];
