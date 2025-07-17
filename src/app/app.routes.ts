import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                loadComponent: () =>
                    import('./login/login.component').then(m => m.LoginComponent),
            },
            {
                path: 'tipos',
                loadComponent: () =>
                    import('./tipos/tipos.component').then(m => m.TiposComponent),
            },
        ]
    }
];