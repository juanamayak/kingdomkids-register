import {Routes} from '@angular/router';
import {RegisterComponent} from './pages/register/register.component';
import {SuccessComponent} from './pages/success/success.component';
import {ScannerComponent} from './pages/scanner/scanner.component';
import {HomeComponent} from './pages/home/home.component';
import {FinderComponent} from './pages/finder/finder.component';

export const routes: Routes = [
    {
        path: 'home',
        component: HomeComponent,
    },
    {
        path: 'buscador',
        component: FinderComponent,
    },
    {
        path: '',
        component: RegisterComponent,
    },
    {
        path: 'success/:id',
        component: SuccessComponent,
    },
    {
        path: 'scanner',
        component: ScannerComponent,
    }
];
