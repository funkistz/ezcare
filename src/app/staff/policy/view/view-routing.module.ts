import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewPage } from './view.page';

const routes: Routes = [
  {
    path: '',
    component: ViewPage
  },
  {
    path: 'claim',
    loadChildren: () => import('../../../staff-view-claims/staff-view-claims.module').then(m => m.StaffViewClaimsPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewPageRoutingModule { }
