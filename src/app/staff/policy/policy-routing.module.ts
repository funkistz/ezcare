import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PolicyPage } from './policy.page';

const routes: Routes = [
  {
    path: '',
    component: PolicyPage
  },
  {
    path: 'view',
    loadChildren: () => import('./view/view.module').then( m => m.ViewPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PolicyPageRoutingModule {}
