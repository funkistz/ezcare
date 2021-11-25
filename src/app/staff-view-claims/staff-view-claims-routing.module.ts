import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StaffViewClaimsPage } from './staff-view-claims.page';

const routes: Routes = [
  {
    path: '',
    component: StaffViewClaimsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StaffViewClaimsPageRoutingModule {}
