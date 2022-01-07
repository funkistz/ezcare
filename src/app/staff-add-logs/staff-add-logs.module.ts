import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StaffAddLogsPageRoutingModule } from './staff-add-logs-routing.module';

import { StaffAddLogsPage } from './staff-add-logs.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    StaffAddLogsPageRoutingModule
  ],
  declarations: [StaffAddLogsPage]
})
export class StaffAddLogsPageModule { }
