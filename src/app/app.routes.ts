import {Routes} from '@angular/router';
import {RegisterComponent} from './pages/register/register.component';
import {SuccessComponent} from './pages/success/success.component';

export const routes: Routes = [
    {
        path: '',
        component: RegisterComponent,
    },
    {
        path: 'registro/:id',
        component: SuccessComponent,
    },
];
