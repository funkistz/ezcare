import { Component, OnInit, Input } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-claim-import',
  templateUrl: './claim-import.component.html',
  styleUrls: ['./claim-import.component.scss'],
})
export class ClaimImportComponent implements OnInit {

  inspections;
  images = [];

  @Input() public claim;
  constructor(
    private firestore: AngularFirestore,
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {

    console.log(this.claim);

    this.getInspection();

  }

  async getInspection() {

    await this.firestore.collection('inspections', ref => ref.where('policy_no', '==', this.claim.policy.cust_policyno)).valueChanges().subscribe((data: any) => {

      this.inspections = data;
      data.forEach(inspection => {

        inspection.images.forEach(image => {

          this.images.push(image.image_link);

        });

      });

      // console.log('this.inspections', data.images);
      console.log('this.images', this.images);

    });


  }

  dismiss(): void {
    this.modalCtrl.dismiss();
  }

}
