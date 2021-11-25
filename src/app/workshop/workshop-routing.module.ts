import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkshopPage } from './workshop.page';

const routes: Routes = [
  {
    path: '',
    component: WorkshopPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkshopPageRoutingModule {}
