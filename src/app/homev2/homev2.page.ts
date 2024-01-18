import { Component, OnInit } from '@angular/core';
import { Apiv2Service } from '../services/apiv2.service';
import { Preferences } from '@capacitor/preferences';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { HelperService } from '../services/helper.service';

@Component({
  selector: 'app-homev2',
  templateUrl: './homev2.page.html',
  styleUrls: ['./homev2.page.scss'],
})
export class Homev2Page implements OnInit {

  user;
  banners = [];
  settings: any = [];
  policies: any = [];
  mainPolicy;

  constructor(
    private apiv2: Apiv2Service,
    private callNumber: CallNumber,
    public helper: HelperService,
  ) { }

  ngOnInit() {

    this.getSettingsV2();
    this.getBannersV2();
  }

  ionViewDidEnter() {
    this.checkUser();
  }

  async checkUser(event = null) {

    this.user = null;
    const { value }: any = await Preferences.get({ key: 'user' });
    let user = value;
    user = JSON.parse(user);
    this.user = user;

    console.log('this.user', this.user);
    this.getPolicyV2(user.customer.id);
  }

  async getPolicyV2(id) {
    this.apiv2.get('customers/' + id + '/policies', {}).subscribe(
      data => {
        console.log('policy', data);
        this.policies = data.data;

        if (data.data && data.data[0]) {
          this.mainPolicy = data.data[0];
        }
      }, error => {

      });
  }

  async getBannersV2() {
    this.apiv2.get('mobile/banners', {}).subscribe(
      data => {
        console.log('data', data);

        this.banners = data.data;

      }, error => {

      });
  }

  async getSettingsV2() {

    console.log('getSettingsV2');

    this.apiv2.get('mobile/settings', {}).subscribe(
      data => {
        console.log('getSettingsV2', data);

        Preferences.set({
          key: 'settings_v2',
          value: JSON.stringify(data.data),
        });
        this.settings = data.data;

      }, error => {

      });

    return;

  }

  whatsapp() {

    const ws = this.settings.m_whatsapp_numbers.value.split(',');

    const random = Math.floor(Math.random() * ws.length);

    const wsTemplate = this.settings.m_whatsapp_template.value;

    const link = 'https://api.whatsapp.com/send?phone=' + ws[random] + '&text=' + wsTemplate;


    window.open(link, '_system', 'location=yes');

  }

  call() {

    console.log('calling...');

    const call = this.settings.m_phone_numbers.value.split(',');
    const random = Math.floor(Math.random() * call.length);

    console.log('calling ', call[random]);

    this.callNumber.callNumber(call[random], true)
      .then(res => console.log('Launched dialer!', res))
      .catch(err => console.log('Error launching dialer', err));

  }

}
