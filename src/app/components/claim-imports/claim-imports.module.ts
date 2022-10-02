import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClaimImportsPageRoutingModule } from './claim-imports-routing.module';

import { ClaimImportsPage } from './claim-imports.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ClaimImportsPageRoutingModule
  ],
  declarations: [ClaimImportsPage]
})
export class ClaimImportsPageModule {}
