import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-mobile-service',
  templateUrl: './mobile-service.page.html',
  styleUrls: ['./mobile-service.page.scss'],
})
export class MobileServicePage implements OnInit {

  slideOpts = {
    initialSlide: 0,
    speed: 200,
    autoplay: true
  };
  settings;

  constructor(
    private router: Router,
    private firestore: AngularFirestore,
  ) { }

  ngOnInit() {
    this.getSettingCache();
  }

  async getSettingCache() {

    let { value }: any = await Preferences.get({ key: 'mobile_service_settings' });
    this.settings = JSON.parse(value);
    console.log('mobile_service_settings', this.settings);

    this.firestore.collection('generals').doc('mobile-service')
      .valueChanges()
      .subscribe(singleDoc => {

        this.settings = singleDoc;

        Preferences.set({
          key: 'mobile_service_settings',
          value: JSON.stringify(this.settings),
        });
      }, error => {
        console.log(error);
      });
  }

  mobileService() {

    console.log('whatsapp');

    const ws = this.settings.phones;
    const random = Math.floor(Math.random() * ws.length);

    // https://api.whatsapp.com/send?phone=919756054965&amp;text=I%20want%20to%20find%20out%20about%20your%20products

    let link = 'https://api.whatsapp.com/send?phone=' + ws[random] + '&text=' + this.settings.whatsapp_template;


    window.open(link, '_system', 'location=yes');

  }

}
