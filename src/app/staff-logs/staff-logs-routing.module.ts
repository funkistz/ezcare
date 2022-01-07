import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StaffLogsPage } from './staff-logs.page';

const routes: Routes = [
  {
    path: '',
    component: StaffLogsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StaffLogsPageRoutingModule {}
