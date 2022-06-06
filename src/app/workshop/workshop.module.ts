import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WorkshopPageRoutingModule } from './workshop-routing.module';

import { WorkshopPage } from './workshop.page';
import { WorkshopDetailsComponent } from '../components/workshop-details/workshop-details.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WorkshopPageRoutingModule
  ],
  declarations: [WorkshopPage, WorkshopDetailsComponent]
})
export class WorkshopPageModule { }
