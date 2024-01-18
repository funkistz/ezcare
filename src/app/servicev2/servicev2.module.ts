import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Servicev2PageRoutingModule } from './servicev2-routing.module';

import { Servicev2Page } from './servicev2.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Servicev2PageRoutingModule
  ],
  declarations: [Servicev2Page]
})
export class Servicev2PageModule {}
