import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StaffViewLogsPage } from './staff-view-logs.page';

const routes: Routes = [
  {
    path: '',
    component: StaffViewLogsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StaffViewLogsPageRoutingModule {}
