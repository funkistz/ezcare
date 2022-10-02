import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddNonInspectPageRoutingModule } from './add-non-inspect-routing.module';

import { AddNonInspectPage } from './add-non-inspect.page';
import { IonicSelectableModule } from 'ionic-selectable';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicSelectableModule,
    IonicModule,
    AddNonInspectPageRoutingModule
  ],
  declarations: [AddNonInspectPage]
})
export class AddNonInspectPageModule { }
