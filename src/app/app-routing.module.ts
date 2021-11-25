import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'setting',
    loadChildren: () => import('./setting/setting.module').then( m => m.SettingPageModule)
  },
  {
    path: 'workshop',
    loadChildren: () => import('./workshop/workshop.module').then( m => m.WorkshopPageModule)
  },
  {
    path: 'add-service',
    loadChildren: () => import('./add-service/add-service.module').then( m => m.AddServicePageModule)
  },
  {
    path: 'staff-claims',
    loadChildren: () => import('./staff-claims/staff-claims.module').then( m => m.StaffClaimsPageModule)
  },
  {
    path: 'staff-view-claims',
    loadChildren: () => import('./staff-view-claims/staff-view-claims.module').then( m => m.StaffViewClaimsPageModule)
  },
  {
    path: 'staff-add-claims',
    loadChildren: () => import('./staff-add-claims/staff-add-claims.module').then( m => m.StaffAddClaimsPageModule)
  },
  {
    path: 'view-service',
    loadChildren: () => import('./view-service/view-service.module').then( m => m.ViewServicePageModule)
  },
  {
    path: 'staff-services',
    loadChildren: () => import('./staff-services/staff-services.module').then( m => m.StaffServicesPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
