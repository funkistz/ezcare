import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

declare var google;

@Component({
  selector: 'app-workshop',
  templateUrl: './workshop.page.html',
  styleUrls: ['./workshop.page.scss'],
})
export class WorkshopPage implements OnInit {

  @ViewChild('map', { static: false }) mapElement: ElementRef;
  map: any;
  address: string;

  latitude: number;
  longitude: number;
  workshops;
  searchText;
  autocomplete: { input: string; };
  markers = [];

  constructor(
    private geolocation: Geolocation,
    private nativeGeocoder: NativeGeocoder,
    private router: Router,
    private authService: AuthenticationService,
  ) {
    this.loadMap();
  }

  ngOnInit() {
  }

  loadMap() {
    this.geolocation.getCurrentPosition().then((resp) => {

      this.latitude = resp.coords.latitude;
      this.longitude = resp.coords.longitude;

      let latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      let mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }

      this.getAddressFromCoords(resp.coords.latitude, resp.coords.longitude);

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

      this.map.addListener('dragend', () => {

        this.latitude = this.map.center.lat();
        this.longitude = this.map.center.lng();

        this.getAddressFromCoords(this.map.center.lat(), this.map.center.lng())
      });

      console.log('before getWorkshops');
      this.getWorkshops();


    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

  getAddressFromCoords(lattitude, longitude) {
    console.log("getAddressFromCoords " + lattitude + " " + longitude);
    let options: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 5
    };

    this.nativeGeocoder.reverseGeocode(lattitude, longitude, options)
      .then((result: NativeGeocoderResult[]) => {
        this.address = "";
        let responseAddress = [];
        for (let [key, value] of Object.entries(result[0])) {
          if (value.length > 0)
            responseAddress.push(value);

        }
        responseAddress.reverse();
        for (let value of responseAddress) {
          this.address += value + ", ";
        }
        this.address = this.address.slice(0, -2);
      })
      .catch((error: any) => {
        this.address = "Address Not Available!";
      });

  }

  centerMap(lat, lng) {
    let center = new google.maps.LatLng(lat, lng);
    this.map.setCenter(center);
  }

  getMarkers() {

    this.markers.forEach(element => {
      element.setMap(null);
    });

    this.markers = [];

    console.log('workshops', this.workshops);

    // tslint:disable-next-line:variable-name
    for (let _i = 0; _i < this.workshops.length; _i++) {
      this.addMarkersToMap(this.workshops[_i], _i);
    }
  }

  addMarkersToMap(workshop, index) {

    if (index == 0) {
      this.centerMap(workshop.latitude, workshop.longitude);
    }

    console.log('workshop', workshop);
    console.log('index', index);

    const position = new google.maps.LatLng(workshop.latitude, workshop.longitude);
    this.markers[index] = new google.maps.Marker({ position, title: workshop.name });
    this.markers[index].setMap(this.map);
  }

  mobileService() {

    this.router.navigateByUrl('/mobile-service');
    return;

    let link = 'https://api.whatsapp.com/send?phone=60132880699&text=hi%20ape%20kabar';

    window.open(link, '_system', 'location=yes');

  }

  getWorkshops() {
    this.authService.getWorkshops().subscribe(
      data => {

        if (data && data.data) {

          this.workshops = data.data;
          console.log('workshop', data);

          this.getMarkers();

        }
      }, error => {
        console.log(error);
      });
  }

  searchWorkshops(event) {
    console.log(event.detail.value);

    this.authService.searchWorkshops(event.detail.value).subscribe(
      data => {

        if (data && data.data) {

          this.workshops = data.data;
          console.log('workshop', data);

          this.getMarkers();

        }
      }, error => {
        console.log(error);
      });
  }

}
