import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StaffViewClaimsPageRoutingModule } from './staff-view-claims-routing.module';

import { StaffViewClaimsPage } from './staff-view-claims.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StaffViewClaimsPageRoutingModule
  ],
  declarations: [StaffViewClaimsPage]
})
export class StaffViewClaimsPageModule {}
