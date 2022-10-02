import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StaffInspectionPage } from './staff-inspection.page';

const routes: Routes = [
  {
    path: '',
    component: StaffInspectionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StaffInspectionPageRoutingModule {}
