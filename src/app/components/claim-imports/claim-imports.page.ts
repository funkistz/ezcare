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
  imageLinkPicked = [];
  imageLinkPickedConfirm = [];

  unpickStyle = 'border:1px solid; margin: 5px;';
  pickedStyle = 'border:6px solid #0096FF; margin: 5px;';

  @Input() public policy;
  constructor(
    private firestore: AngularFirestore,
    private modalCtrl: ModalController,
    public helper: HelperService,
  ) { }

  ngOnInit() {

    console.log(this.policy);

    this.getInspection();

  }

  getImageStyle(image) {
    return this.imageLinkPicked.includes(image) ? this.pickedStyle : this.unpickStyle;
  }

  async getInspection() {

    await this.firestore.collection('inspections', ref => ref.where('policy_no', '==', this.policy.cust_policyno)).valueChanges().subscribe((data: any) => {

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

  pickImage(image) {
    console.log(this.imageLinkPicked);

    if (!this.imageLinkPicked.includes(image)) {          //checking weather array contain the id
      this.imageLinkPicked.push(image);    //adding to array because value doesnt exists
    } else {
      this.imageLinkPicked.splice(this.imageLinkPicked.indexOf(image), 1);  //deleting
    }

  }

  dismiss(): void {
    this.modalCtrl.dismiss();
  }

  import() {
    this.modalCtrl.dismiss({
      images: this.imageLinkPicked,
    });
  }

}
