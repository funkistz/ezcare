import { Component, OnInit, Input } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ModalController } from '@ionic/angular';
import { HelperService } from '../../services/helper.service';

@Component({
  selector: 'app-claim-imports',
  templateUrl: './claim-imports.page.html',
  styleUrls: ['./claim-imports.page.scss'],
})
export class ClaimImportsPage implements OnInit {

  inspections;
  images = [];

  @Input() public claim;
  constructor(
    private firestore: AngularFirestore,
    private modalCtrl: ModalController,
    public helper: HelperService,
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

  import() {

  }

}
