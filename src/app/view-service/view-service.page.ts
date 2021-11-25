import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { Storage } from '@capacitor/storage';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-view-service',
  templateUrl: './view-service.page.html',
  styleUrls: ['./view-service.page.scss'],
})
export class ViewServicePage implements OnInit {

  service_id;
  service;

  constructor(
    private authService: AuthenticationService,
    private route: ActivatedRoute, private router: Router,
  ) { }

  ngOnInit() {

    this.route.queryParams.subscribe(params => {
      if (params && params.service_id) {
        this.service_id = params.service_id;

        this.getService(this.service_id);
      }
    });

  }

  async getService(service_id, event = null) {



    this.authService.getService(service_id).subscribe(
      data => {

        if (data && data.data) {

          console.log(data);


          if (event) {
            event.target.complete();
          }

          this.service = data.data;
          console.log(this.service);

        }
      }, error => {
        console.log(error);
        if (event) {
          event.target.complete();
        }
      });

  }

}
