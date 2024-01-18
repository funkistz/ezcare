import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Workshopv2Page } from './workshopv2.page';

const routes: Routes = [
  {
    path: '',
    component: Workshopv2Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Workshopv2PageRoutingModule {}
