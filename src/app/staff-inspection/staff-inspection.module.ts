import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StaffInspectionPageRoutingModule } from './staff-inspection-routing.module';

import { StaffInspectionPage } from './staff-inspection.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StaffInspectionPageRoutingModule
  ],
  declarations: [StaffInspectionPage]
})
export class StaffInspectionPageModule {}
