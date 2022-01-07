import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StaffHomePageRoutingModule } from './staff-home-routing.module';

import { StaffHomePage } from './staff-home.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StaffHomePageRoutingModule
  ],
  declarations: [StaffHomePage]
})
export class StaffHomePageModule { }
