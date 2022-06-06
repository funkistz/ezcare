import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SponsorshipPageRoutingModule } from './sponsorship-routing.module';

import { SponsorshipPage } from './sponsorship.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SponsorshipPageRoutingModule
  ],
  declarations: [SponsorshipPage]
})
export class SponsorshipPageModule { }
