import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StaffClaimsPage } from './staff-claims.page';

const routes: Routes = [
  {
    path: '',
    component: StaffClaimsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StaffClaimsPageRoutingModule {}
