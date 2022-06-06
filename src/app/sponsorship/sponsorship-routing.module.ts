import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SponsorshipPage } from './sponsorship.page';

const routes: Routes = [
  {
    path: '',
    component: SponsorshipPage
  },
  {
    path: 'add',
    loadChildren: () => import('./add/add.module').then(m => m.AddPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SponsorshipPageRoutingModule { }
