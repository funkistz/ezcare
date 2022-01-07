import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StaffViewLogsPageRoutingModule } from './staff-view-logs-routing.module';

import { StaffViewLogsPage } from './staff-view-logs.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StaffViewLogsPageRoutingModule
  ],
  declarations: [StaffViewLogsPage]
})
export class StaffViewLogsPageModule {}
