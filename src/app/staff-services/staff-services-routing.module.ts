import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StaffServicesPage } from './staff-services.page';

const routes: Routes = [
  {
    path: '',
    component: StaffServicesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StaffServicesPageRoutingModule {}
