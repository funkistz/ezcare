import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StaffTabsPage } from './staff-tabs.page';

const routes: Routes = [
  {
    path: '',
    component: StaffTabsPage,
    children: [
      {
        path: 'staff-home',
        loadChildren: () => import('../staff-home/staff-home.module').then(m => m.StaffHomePageModule)
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
        ]
      },
      {
        path: 'endorsement',
        children: [
          {
            path: '',
            loadChildren: () => import('../endorsement/endorsement.module').then(m => m.EndorsementPageModule),
          }
        ]
      },
      {
        path: 'sponsorship',
        children: [
          {
            path: '',
            loadChildren: () => import('../sponsorship/sponsorship.module').then(m => m.SponsorshipPageModule),
          }
        ]
      },
      {
        path: 'policy',
        children: [
          {
            path: '',
            loadChildren: () => import('../staff/policy/policy.module').then(m => m.PolicyPageModule),
          }
        ]
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StaffTabsPageRoutingModule { }
