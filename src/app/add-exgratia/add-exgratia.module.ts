import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddExgratiaPageRoutingModule } from './add-exgratia-routing.module';

import { AddExgratiaPage } from './add-exgratia.page';
import { IonicSelectableModule } from 'ionic-selectable';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddExgratiaPageRoutingModule,
    ReactiveFormsModule,
    IonicSelectableModule
  ],
  declarations: [AddExgratiaPage]
})
export class AddExgratiaPageModule { }
