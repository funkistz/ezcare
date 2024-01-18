import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Loginv2Page } from './loginv2.page';

const routes: Routes = [
  {
    path: '',
    component: Loginv2Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Loginv2PageRoutingModule {}
