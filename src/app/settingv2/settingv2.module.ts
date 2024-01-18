import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Settingv2PageRoutingModule } from './settingv2-routing.module';

import { Settingv2Page } from './settingv2.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Settingv2PageRoutingModule
  ],
  declarations: [Settingv2Page]
})
export class Settingv2PageModule {}
