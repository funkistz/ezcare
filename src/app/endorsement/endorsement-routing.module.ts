import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EndorsementPage } from './endorsement.page';

const routes: Routes = [
  {
    path: '',
    component: EndorsementPage
  },
  {
    path: 'add',
    loadChildren: () => import('./add/add.module').then(m => m.AddPageModule)
  },
  {
    path: 'addSponsorship',
    loadChildren: () => import('../sponsorship/add/add.module').then(m => m.AddPageModule)
  },
  {
    path: 'addLeave',
    loadChildren: () => import('../add-leave/add-leave.module').then(m => m.AddLeavePageModule)
  },
  {
    path: 'addExgratia',
    loadChildren: () => import('../add-exgratia/add-exgratia.module').then(m => m.AddExgratiaPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EndorsementPageRoutingModule { }
