import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClaimImportComponent } from './claim-import.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ClaimImportComponent,
  ],
  declarations: [ClaimImportComponent]
})
export class StaffAddClaimsPageModule { }
