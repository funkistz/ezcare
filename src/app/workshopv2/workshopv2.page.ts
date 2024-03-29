/* eslint-disable no-underscore-dangle */
import { Component, OnInit, ViewChild, ElementRef, } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { LaunchNavigator, LaunchNavigatorOptions } from '@awesome-cordova-plugins/launch-navigator/ngx';
import { Geolocation as capGeolocation } from '@capacitor/geolocation';
import { ModalController } from '@ionic/angular';
import { WorkshopDetailsComponent } from '../components/workshop-details2/workshop-details.component';
import { Apiv2Service } from '../services/apiv2.service';
declare var google;

@Component({
  selector: 'app-workshopv2',
  templateUrl: './workshopv2.page.html',
  styleUrls: ['./workshopv2.page.scss'],
})
export class Workshopv2Page implements OnInit {

  @ViewChild('map', { static: true }) mapElement: ElementRef;
  map: any;
  address: string;

  latitude: any = 3.168440;
  longitude: any = 101.654620;
  workshops;
  searchText;
  autocomplete: { input: string; };
  markers = [];
  hasPermission = false;
  evOnly = false;
  hybridOnly = false;
  isLoading = false;

  constructor(
    private geolocation: Geolocation,
    private nativeGeocoder: NativeGeocoder,
    private router: Router,
    private authService: AuthenticationService,
    private launchNavigator: LaunchNavigator,
    private modalCtrl: ModalController,
    private apiv2: Apiv2Service,
  ) {
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.checkPermission();
  }

  async checkPermission() {
    const permission = await capGeolocation.checkPermissions();

    if (permission.location === 'granted') {
      this.hasPermission = true;
      this.getWorkshopsv2();
      // this.getWorkshops();
      this.loadMap();
    }
    console.log('permission:', permission);
  }

  async requestPermission() {
    const permission = await capGeolocation.requestPermissions();

    console.log('permission:', permission);
    this.checkPermission();

  }

  getWorkshopsv2() {

    this.workshops = [];
    this.isLoading = true;

    const params = {
      lat: this.latitude,
      lng: this.longitude,
      isEv: this.evOnly,
      isHybrid: this.hybridOnly,
      search: this.searchText ? this.searchText : '',
    };

    this.apiv2.get('workshops', { params }).subscribe(
      data => {
        console.log('getWorkshopsv2', data);
        if (data.data) {
          this.workshops = data.data;
          this.getMarkers();
        }
        this.isLoading = false;
      }, error => {
        this.isLoading = false;
      });
  }

  loadMap() {

    let mapOptions: any = {
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    this.geolocation.getCurrentPosition().then((resp) => {

      this.latitude = Number(resp.coords.latitude);
      this.longitude = Number(resp.coords.longitude);

      this.centerMap(this.latitude, this.longitude);

      console.log('current position', this.latitude + ' - ' + this.longitude);

      const latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      this.getAddressFromCoords(resp.coords.latitude, resp.coords.longitude);

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

      this.map.addListener('dragend', () => {

        this.latitude = this.map.center.lat();
        this.longitude = this.map.center.lng();

        this.getAddressFromCoords(this.map.center.lat(), this.map.center.lng())
      });

      console.log('before getWorkshops');
      this.getMarkers();


    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

  getAddressFromCoords(lattitude, longitude) {
    // console.log(getAddressFromCoords " + lattitude + " " + longitude);

    const options: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 5
    };

    this.nativeGeocoder.reverseGeocode(lattitude, longitude, options)
      .then((result: NativeGeocoderResult[]) => {
        this.address = '';
        const responseAddress = [];
        for (const [key, value] of Object.entries(result[0])) {
          if (value.length > 0) {
            responseAddress.push(value);
          }
        }
        responseAddress.reverse();
        for (const value of responseAddress) {
          this.address += value + ', ';
        }
        this.address = this.address.slice(0, -2);
      })
      .catch((error: any) => {
        this.address = 'Address Not Available!';
      });

  }

  centerMap(lat, lng) {
    const center = new google.maps.LatLng(lat, lng);
    this.map.setCenter(center);
  }

  getMarkers() {

    this.markers.forEach(element => {
      element.setMap(null);
    });

    this.markers = [];

    // console.log('workshops', this.workshops);

    // tslint:disable-next-line:variable-name
    for (let _i = 0; _i < this.workshops.length; _i++) {
      this.addMarkersToMap(this.workshops[_i], _i);
    }
  }

  addMarkersToMap(workshop, index) {

    if (index === 0) {
      this.centerMap(workshop.lat, workshop.lng);
    }

    // console.log('workshop', workshop);
    // console.log('index', index);

    const position = new google.maps.LatLng(workshop.lat, workshop.lng);
    this.markers[index] = new google.maps.Marker({ position, title: workshop.name });
    this.markers[index].setMap(this.map);
  }

  mobileService() {

    this.router.navigateByUrl('/mobile-service');
    return;

    // let link = 'https://api.whatsapp.com/send?phone=60132880699&text=hi%20ape%20kabar';

    // window.open(link, '_system', 'location=yes');

  }

  getWorkshops() {

    this.authService.getWorkshops().subscribe(
      data => {

        if (data && data.data) {

          data.data = data.data.filter((el) => {
            if (this.evOnly) {
              return el.is_ev === '1';
            }
            return true;
          });

          this.workshops = data.data;

          for (let i = 0; i < data.data.length; i++) {
            data.data[i]["distance"] = this.calculateDistance(this.latitude, this.longitude, Number(data.data[i]["latitude"]), Number(data.data[i]["longitude"]), "K");
          }

          data.data.sort(function (a, b) {
            return a.distance - b.distance;
          });

          this.getMarkers();

          console.log('workshop', data);

        }
      }, error => {
        console.log(error);
      });
  }

  searchWorkshops(event) {

    this.searchText = event ? event.detail.value : '';
    this.getWorkshopsv2();

    // this.authService.searchWorkshops(search).subscribe(
    //   data => {

    //     if (data && data.data) {

    //       data.data = data.data.filter((el) => {
    //         if (this.evOnly) {
    //           return el.is_ev === '1';
    //         }
    //         return true;
    //       });

    //       this.workshops = data.data;
    //       console.log('workshop', data);

    //       this.getMarkers();

    //     }
    //     this.isLoading = false;

    //   }, error => {
    //     console.log(error);
    //     this.isLoading = false;
    //   });
  }

  navigate(lat, lng) {
    let destination = [lat, lng];
    this.launchNavigator.navigate(destination)
      .then(
        success => console.log('Launched navigator'),
        error => console.log('Error launching navigator', error)
      );
  }

  calculateDistance(lat1, lon1, lat2, lon2, unit) {

    // console.log('calculateDistance', lat1, lon1, lat2, lon2, unit);

    var radlat1 = Math.PI * lat1 / 180
    var radlat2 = Math.PI * lat2 / 180
    var radlon1 = Math.PI * lon1 / 180
    var radlon2 = Math.PI * lon2 / 180
    var theta = lon1 - lon2
    var radtheta = Math.PI * theta / 180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist)
    dist = dist * 180 / Math.PI
    dist = dist * 60 * 1.1515
    if (unit == "K") { dist = dist * 1.609344 }
    if (unit == "N") { dist = dist * 0.8684 }
    return dist
  }

  async displayWorkshop(workshop): Promise<void> {

    this.centerMap(workshop.lat, workshop.lng);

    const workshopModal = await this.modalCtrl.create({
      component: WorkshopDetailsComponent,
      componentProps: { workshop },
      mode: 'ios',
      showBackdrop: false,
      swipeToClose: true,
      breakpoints: [0, 0.6, 0.9, 1],
      initialBreakpoint: 0.6,
    });
    return await workshopModal.present();
  }

  toggleEv($event) {
    this.getWorkshopsv2();
  }

  toggleHybrid($event) {
    this.getWorkshopsv2();
  }
}
