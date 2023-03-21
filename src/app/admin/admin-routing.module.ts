import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdminPage } from './admin.page';

const routes: Routes = [
  {
    path: '',
    component: AdminPage
  },
  {
    path: 'staff',
    loadChildren: () => import('./staff/staff.module').then( m => m.StaffPageModule)
  },
  {
    path: 'warranty',
    loadChildren: () => import('./warranty/warranty.module').then( m => m.WarrantyPageModule)
  },
  {
    path: 'workshop',
    loadChildren: () => import('./workshop/workshop.module').then( m => m.WorkshopPageModule)
  },
  {
    path: 'banner',
    loadChildren: () => import('./banner/banner.module').then( m => m.BannerPageModule)
  },
  {
    path: 'general',
    loadChildren: () => import('./general/general.module').then( m => m.GeneralPageModule)
  },
  {
    path: 'customer',
    loadChildren: () => import('./customer/customer.module').then( m => m.CustomerPageModule)
  },
  {
    path: 'mobile-service',
    loadChildren: () => import('./mobile-service/mobile-service.module').then( m => m.MobileServicePageModule)
  },
  {
    path: 'leave',
    loadChildren: () => import('./leave/leave.module').then( m => m.LeavePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminPageRoutingModule {}
