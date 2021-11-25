import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ViewServicePageRoutingModule } from './view-service-routing.module';

import { ViewServicePage } from './view-service.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ViewServicePageRoutingModule
  ],
  declarations: [ViewServicePage]
})
export class ViewServicePageModule {}
