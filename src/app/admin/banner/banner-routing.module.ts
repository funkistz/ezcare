import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BannerPage } from './banner.page';

const routes: Routes = [
  {
    path: '',
    component: BannerPage
  },
  {
    path: 'view',
    loadChildren: () => import('./view/view.module').then( m => m.ViewPageModule)
  },
  {
    path: 'add',
    loadChildren: () => import('./add/add.module').then( m => m.AddPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BannerPageRoutingModule {}
