import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Homev2PageRoutingModule } from './homev2-routing.module';

import { Homev2Page } from './homev2.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Homev2PageRoutingModule
  ],
  declarations: [Homev2Page]
})
export class Homev2PageModule {}
