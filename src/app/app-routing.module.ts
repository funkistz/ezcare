import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./starter/starter.module').then(m => m.StarterPageModule)
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'setting',
    loadChildren: () => import('./setting/setting.module').then(m => m.SettingPageModule)
  },
  {
    path: 'workshop',
    loadChildren: () => import('./workshop/workshop.module').then(m => m.WorkshopPageModule)
  },
  {
    path: 'add-service',
    loadChildren: () => import('./add-service/add-service.module').then(m => m.AddServicePageModule)
  },
  {
    path: 'staff-claims',
    loadChildren: () => import('./staff-claims/staff-claims.module').then(m => m.StaffClaimsPageModule)
  },
  {
    path: 'staff-view-claims',
    loadChildren: () => import('./staff-view-claims/staff-view-claims.module').then(m => m.StaffViewClaimsPageModule)
  },
  {
    path: 'staff-add-claims',
    loadChildren: () => import('./staff-add-claims/staff-add-claims.module').then(m => m.StaffAddClaimsPageModule)
  },
  {
    path: 'view-service',
    loadChildren: () => import('./view-service/view-service.module').then(m => m.ViewServicePageModule)
  },
  {
    path: 'staff-services',
    loadChildren: () => import('./staff-services/staff-services.module').then(m => m.StaffServicesPageModule)
  },
  {
    path: 'staff-logs',
    loadChildren: () => import('./staff-logs/staff-logs.module').then(m => m.StaffLogsPageModule)
  },
  {
    path: 'staff-add-logs',
    loadChildren: () => import('./staff-add-logs/staff-add-logs.module').then(m => m.StaffAddLogsPageModule)
  },
  {
    path: 'staff-view-logs',
    loadChildren: () => import('./staff-view-logs/staff-view-logs.module').then(m => m.StaffViewLogsPageModule)
  },
  {
    path: 'image-preview',
    loadChildren: () => import('./image-preview/image-preview.module').then(m => m.ImagePreviewPageModule)
  },
  {
    path: 'staff-tabs',
    loadChildren: () => import('./staff-tabs/staff-tabs.module').then(m => m.StaffTabsPageModule)
  },
  {
    path: 'staff-home',
    loadChildren: () => import('./staff-home/staff-home.module').then(m => m.StaffHomePageModule)
  },
  {
    path: 'starter',
    loadChildren: () => import('./starter/starter.module').then(m => m.StarterPageModule)
  },
  {
    path: 'mobile-service',
    loadChildren: () => import('./mobile-service/mobile-service.module').then(m => m.MobileServicePageModule)
  },
  {
    path: 'notification',
    loadChildren: () => import('./notification/notification.module').then(m => m.NotificationPageModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminPageModule)
  },
  {
    path: 'privacy-policy',
    loadChildren: () => import('./privacy-policy/privacy-policy.module').then(m => m.PrivacyPolicyPageModule)
  },
  {
    path: 'policy',
    loadChildren: () => import('./staff/policy/policy.module').then(m => m.PolicyPageModule)
  },
  {
    path: 'endorsement',
    loadChildren: () => import('./endorsement/endorsement.module').then( m => m.EndorsementPageModule)
  },
  {
    path: 'claim-imports',
    loadChildren: () => import('./components/claim-imports/claim-imports.module').then( m => m.ClaimImportsPageModule)
  },
  {
    path: 'staff-add-schedule',
    loadChildren: () => import('./staff-add-schedule/staff-add-schedule.module').then( m => m.StaffAddSchedulePageModule)
  },
  {
    path: 'staff-inspection',
    loadChildren: () => import('./staff-inspection/staff-inspection.module').then( m => m.StaffInspectionPageModule)
  },
  {
    path: 'add-non-inspect',
    loadChildren: () => import('./add-non-inspect/add-non-inspect.module').then( m => m.AddNonInspectPageModule)
  },
  {
    path: 'add-leave',
    loadChildren: () => import('./add-leave/add-leave.module').then( m => m.AddLeavePageModule)
  },
  {
    path: 'add-exgratia',
    loadChildren: () => import('./add-exgratia/add-exgratia.module').then( m => m.AddExgratiaPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'change-password',
    loadChildren: () => import('./change-password/change-password.module').then( m => m.ChangePasswordPageModule)
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
