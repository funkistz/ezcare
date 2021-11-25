import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'tab1',
        loadChildren: () => import('../tab1/tab1.module').then(m => m.Tab1PageModule)
      },
      {
        path: 'tab2',
        children: [
          {
            path: '',
            loadChildren: () => import('../tab2/tab2.module').then(m => m.Tab2PageModule),
          },
          {
            path: 'add-service',
            loadChildren: () => import('../add-service/add-service.module').then(m => m.AddServicePageModule)
          },
          {
            path: 'view-service',
            loadChildren: () => import('../view-service/view-service.module').then(m => m.ViewServicePageModule)
          }
        ]
      },
      {
        path: 'tab3',
        children: [
          {
            path: '',
            loadChildren: () => import('../tab3/tab3.module').then(m => m.Tab3PageModule),
          },
          {
            path: 'staff-view-claim',
            loadChildren: () => import('../staff-view-claims/staff-view-claims.module').then(m => m.StaffViewClaimsPageModule)
          }
        ]
      },
      {
        path: 'tab4',
        loadChildren: () => import('../setting/setting.module').then(m => m.SettingPageModule)
      },
      {
        path: 'workshop',
        loadChildren: () => import('../workshop/workshop.module').then(m => m.WorkshopPageModule)
      },
      {
        path: 'staffClaims',
        children: [
          {
            path: '',
            loadChildren: () => import('../staff-claims/staff-claims.module').then(m => m.StaffClaimsPageModule),
          },
          {
            path: 'staff-view-claim',
            loadChildren: () => import('../staff-view-claims/staff-view-claims.module').then(m => m.StaffViewClaimsPageModule)
          },
          {
            path: 'staff-add-claim',
            loadChildren: () => import('../staff-add-claims/staff-add-claims.module').then(m => m.StaffAddClaimsPageModule)
          }
        ]
      },
      {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full'
      },
      {
        path: 'staff-services',
        children: [
          {
            path: '',
            loadChildren: () => import('../staff-services/staff-services.module').then(m => m.StaffServicesPageModule),
          },
          {
            path: 'view-service',
            loadChildren: () => import('../view-service/view-service.module').then(m => m.ViewServicePageModule)
          },
        ]
      },
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/tab1',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule { }
