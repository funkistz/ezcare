import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StaffAddSchedulePageRoutingModule } from './staff-add-schedule-routing.module';

import { StaffAddSchedulePage } from './staff-add-schedule.page';
import { IonicSelectableModule } from 'ionic-selectable';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    StaffAddSchedulePageRoutingModule,
    IonicSelectableModule
  ],
  declarations: [StaffAddSchedulePage]
})
export class StaffAddSchedulePageModule { }
