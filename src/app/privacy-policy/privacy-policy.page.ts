import { Component, OnInit } from '@angular/core';
import { Storage } from '@capacitor/storage';

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
    let { value }: any = await Storage.get({ key: 'privacy_policy' });
    this.policy = value;

    console.log(value);
  }

}
