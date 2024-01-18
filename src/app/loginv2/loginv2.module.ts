import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Loginv2PageRoutingModule } from './loginv2-routing.module';

import { Loginv2Page } from './loginv2.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Loginv2PageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [Loginv2Page]
})
export class Loginv2PageModule { }
