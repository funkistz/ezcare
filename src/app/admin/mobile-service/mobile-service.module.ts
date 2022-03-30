import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MobileServicePageRoutingModule } from './mobile-service-routing.module';

import { MobileServicePage } from './mobile-service.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MobileServicePageRoutingModule
  ],
  declarations: [MobileServicePage]
})
export class MobileServicePageModule {}
