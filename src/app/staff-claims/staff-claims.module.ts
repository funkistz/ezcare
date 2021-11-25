import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StaffClaimsPageRoutingModule } from './staff-claims-routing.module';

import { StaffClaimsPage } from './staff-claims.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StaffClaimsPageRoutingModule
  ],
  declarations: [StaffClaimsPage]
})
export class StaffClaimsPageModule {}
