import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StaffAddClaimsPage } from './staff-add-claims.page';

const routes: Routes = [
  {
    path: '',
    component: StaffAddClaimsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StaffAddClaimsPageRoutingModule {}
