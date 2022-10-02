import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StaffHomePageRoutingModule } from './staff-home-routing.module';

import { StaffHomePage } from './staff-home.page';
import { IonicSelectableModule } from 'ionic-selectable';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StaffHomePageRoutingModule,
    IonicSelectableModule,
  ],
  declarations: [StaffHomePage]
})
export class StaffHomePageModule { }
