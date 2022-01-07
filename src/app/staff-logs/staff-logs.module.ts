import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StaffLogsPageRoutingModule } from './staff-logs-routing.module';

import { StaffLogsPage } from './staff-logs.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StaffLogsPageRoutingModule
  ],
  declarations: [StaffLogsPage]
})
export class StaffLogsPageModule {}
