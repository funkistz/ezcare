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
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EndorsementPageRoutingModule { }
