import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Storage } from '@capacitor/storage';

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
  ) { }

  ngOnInit() {
    this.getSettingCache();
  }

  async getSettingCache() {

    let { value }: any = await Storage.get({ key: 'settings' });
    this.settings = JSON.parse(value);
    console.log('settings', this.settings);
  }

  mobileService() {

    console.log('whatsapp');

    const ws = this.settings.whatsapp;
    const random = Math.floor(Math.random() * ws.length);

    // https://api.whatsapp.com/send?phone=919756054965&amp;text=I%20want%20to%20find%20out%20about%20your%20products

    let link = 'https://api.whatsapp.com/send?phone=' + ws[random] + '&text=hi%20ape%20kabar';


    window.open(link, '_system', 'location=yes');

  }

}
