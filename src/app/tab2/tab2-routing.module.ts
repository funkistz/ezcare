import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Tab2Page } from './tab2.page';
import { AddServicePage } from '../add-service/add-service.page';

const routes: Routes = [
  {
    path: '',
    component: Tab2Page,
    // children: [
    //   {
    //     path: 'add-service',
    //     children: [
    //       {
    //         path: '',
    //         // loadChildren: '../add-service/add-service.module',
    //         loadChildren: () => import('../add-service/add-service.module').then(m => m.AddServicePageModule)
    //         // loadChildren: () => import('../add-service/add-service.module').then(m => m.AddServicePageModule)
    //       },
    //     ],
    //   }
    // ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Tab2PageRoutingModule { }
