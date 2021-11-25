import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewServicePage } from './view-service.page';

const routes: Routes = [
  {
    path: '',
    component: ViewServicePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewServicePageRoutingModule {}
