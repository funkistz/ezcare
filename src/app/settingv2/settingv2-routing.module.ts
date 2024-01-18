import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Settingv2Page } from './settingv2.page';

const routes: Routes = [
  {
    path: '',
    component: Settingv2Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Settingv2PageRoutingModule {}
