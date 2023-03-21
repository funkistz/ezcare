import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddLeavePage } from './add-leave.page';

const routes: Routes = [
  {
    path: '',
    component: AddLeavePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddLeavePageRoutingModule {}
