import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddNonInspectPage } from './add-non-inspect.page';

const routes: Routes = [
  {
    path: '',
    component: AddNonInspectPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddNonInspectPageRoutingModule {}
