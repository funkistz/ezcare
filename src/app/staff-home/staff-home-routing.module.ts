import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StaffHomePage } from './staff-home.page';

const routes: Routes = [
  {
    path: '',
    component: StaffHomePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StaffHomePageRoutingModule {}
