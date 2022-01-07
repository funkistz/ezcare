import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MobileServicePage } from './mobile-service.page';

const routes: Routes = [
  {
    path: '',
    component: MobileServicePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MobileServicePageRoutingModule {}
