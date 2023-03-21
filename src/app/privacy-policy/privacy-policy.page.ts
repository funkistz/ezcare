import { Component, OnInit } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.page.html',
  styleUrls: ['./privacy-policy.page.scss'],
})
export class PrivacyPolicyPage implements OnInit {

  policy;

  constructor() { }

  async ngOnInit() {

    this.getPolicy();
  }

  async getPolicy() {
    let { value }: any = await Preferences.get({ key: 'privacy_policy' });
    this.policy = value;

    console.log(value);
  }

}
