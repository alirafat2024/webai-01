import { Routes } from '@angular/router';
import { Home } from './home/home/home';
import { Builder } from './builder/builder';

export const routes: Routes = [
	{ path: '', component: Home },
	{ path: 'builder', component: Builder },
	{ path: '**', redirectTo: '' },
];
