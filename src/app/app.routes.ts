import { Routes } from '@angular/router';
import { authRoutes } from './authentication/auth.routes';
import { tiposRoutes } from './bussines/tipos/tipos.routes';
import { businessRoutes } from './bussines/business.routes';


export const routes: Routes = [
    {
        path: '',
        children: [
            ...authRoutes
        ]
    },
    {
        path: 'dashboard',
        children: [
            ...businessRoutes,

        ]
    }

];
