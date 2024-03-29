import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StaffAddClaimsPageRoutingModule } from './staff-add-claims-routing.module';

import { StaffAddClaimsPage } from './staff-add-claims.page';
import { IonicSelectableModule } from 'ionic-selectable';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    StaffAddClaimsPageRoutingModule,
    IonicSelectableModule
  ],
  declarations: [StaffAddClaimsPage]
})
export class StaffAddClaimsPageModule { }
