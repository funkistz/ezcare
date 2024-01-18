import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'homev2',
        loadChildren: () => import('../homev2/homev2.module').then(m => m.Homev2PageModule)
      },
      {
        path: 'servicev2',
        loadChildren: () => import('../servicev2/servicev2.module').then(m => m.Servicev2PageModule)
      },
      {
        path: 'workshopv2',
        loadChildren: () => import('../workshopv2/workshopv2.module').then(m => m.Workshopv2PageModule)
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
        path: 'settingsv2',
        loadChildren: () => import('../settingv2/settingv2.module').then(m => m.Settingv2PageModule)
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
        redirectTo: '/tabsv2/homev2',
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
      {
        path: 'staff-logs',
        children: [
          {
            path: '',
            loadChildren: () => import('../staff-logs/staff-logs.module').then(m => m.StaffLogsPageModule),
          },
          {
            path: 'view-logs',
            loadChildren: () => import('../staff-view-logs/staff-view-logs.module').then(m => m.StaffViewLogsPageModule)
          },
          {
            path: 'add-logs',
            loadChildren: () => import('../staff-add-logs/staff-add-logs.module').then(m => m.StaffAddLogsPageModule)
          },
          {
            path: 'add-schedule',
            loadChildren: () => import('../staff-add-schedule/staff-add-schedule.module').then(m => m.StaffAddSchedulePageModule)
          },
        ]
      },
    ]
  },
  {
    path: '',
    redirectTo: '/tabsv2/homev2',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule { }
