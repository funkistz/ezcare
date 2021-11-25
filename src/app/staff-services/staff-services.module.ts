import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StaffServicesPageRoutingModule } from './staff-services-routing.module';

import { StaffServicesPage } from './staff-services.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StaffServicesPageRoutingModule
  ],
  declarations: [StaffServicesPage]
})
export class StaffServicesPageModule {}
