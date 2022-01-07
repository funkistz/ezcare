import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StaffAddLogsPage } from './staff-add-logs.page';

const routes: Routes = [
  {
    path: '',
    component: StaffAddLogsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StaffAddLogsPageRoutingModule {}
