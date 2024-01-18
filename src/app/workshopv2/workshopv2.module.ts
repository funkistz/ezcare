import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Workshopv2PageRoutingModule } from './workshopv2-routing.module';

import { Workshopv2Page } from './workshopv2.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Workshopv2PageRoutingModule
  ],
  declarations: [Workshopv2Page]
})
export class Workshopv2PageModule {}
