import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { HelperService } from '../../services/helper.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-general',
  templateUrl: './general.page.html',
  styleUrls: ['./general.page.scss'],
})
export class GeneralPage implements OnInit {

  generals = {};
  settings;

  constructor(
    private authService: AuthenticationService,
    private helper: HelperService,
    private firestore: AngularFirestore,
  ) { }

  ngOnInit() {

    this.getSettings();
  }

  getSettings() {

    return this.firestore.collection('generals').doc('settings')
      .valueChanges()
      .subscribe(singleDoc => {
        console.log(singleDoc);
        this.settings = singleDoc;
      }, error => {
        console.log(error);
      });
  }

  updateSettings() {

    this.helper.presentLoading();

    if (typeof this.settings.generals_phones === 'string' || this.settings.generals_phones instanceof String) {
      this.settings.generals_phones = this.settings.generals_phones.split(",");
    }

    if (typeof this.settings.mobile_service_phones === 'string' || this.settings.mobile_service_phones instanceof String) {
      this.settings.mobile_service_phones = this.settings.mobile_service_phones.split(",");
    }

    if (typeof this.settings.whatsapp === 'string' || this.settings.whatsapp instanceof String) {
      this.settings.whatsapp = this.settings.whatsapp.split(",");
    }

    this.firestore.doc<any>('generals/settings').update(this.settings).then(() => {
      console.log('success');
      this.helper.dissmissLoading();
      this.helper.presentToast('Successfully updated.');

    }).catch(error => {

      this.helper.presentToast('Sorry, there is some error occured.');

    });
  }

  getGenerals() {

    this.authService.getSettings().subscribe(
      data => {

        if (data && data.data) {
          this.generals = data.data[0];
        }

        console.log(data);
      }, error => {
        console.log(error);
      });

  }

}
