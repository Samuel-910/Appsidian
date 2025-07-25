import { Routes } from '@angular/router';

export const tiposRoutes: Routes = [
    {
        path: 'tipos',
        loadComponent: () =>
            import('./tipos.component').then(m => m.TiposComponent),
    }
];
