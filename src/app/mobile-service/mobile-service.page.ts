import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
  }

  mobileService() {

    let link = 'https://api.whatsapp.com/send?phone=60132880699&text=hi%20ape%20kabar';

    window.open(link, '_system', 'location=yes');

  }

}
