import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddExgratiaPage } from './add-exgratia.page';

const routes: Routes = [
  {
    path: '',
    component: AddExgratiaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddExgratiaPageRoutingModule {}
