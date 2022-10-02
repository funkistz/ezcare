import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StaffAddSchedulePage } from './staff-add-schedule.page';

const routes: Routes = [
  {
    path: '',
    component: StaffAddSchedulePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StaffAddSchedulePageRoutingModule {}
