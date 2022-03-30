import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EndorsementPageRoutingModule } from './endorsement-routing.module';

import { EndorsementPage } from './endorsement.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EndorsementPageRoutingModule
  ],
  declarations: [EndorsementPage]
})
export class EndorsementPageModule {}
