import { Routes, RouterModule } from '@angular/router';
import { BoxView } from './view/box';
import { ListView } from './view/list';

export const ROUTES: Routes = [
  { path: '',     component: BoxView },
  { path: '*',    component: BoxView },
  { path: 'box',  component: BoxView },
  { path: 'list', component: ListView }
];
