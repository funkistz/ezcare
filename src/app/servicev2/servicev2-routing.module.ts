import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Servicev2Page } from './servicev2.page';

const routes: Routes = [
  {
    path: '',
    component: Servicev2Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Servicev2PageRoutingModule {}
