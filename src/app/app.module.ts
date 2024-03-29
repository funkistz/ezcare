import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HttpClientModule, HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';
import { CallNumber } from '@ionic-native/call-number/ngx';
// import { ToolbarComponent } from './components/toolbar/toolbar.component';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';

import { environment } from '../environments/environment';
import { PhotoViewer } from '@awesome-cordova-plugins/photo-viewer/ngx';
import { DocumentViewer } from '@awesome-cordova-plugins/document-viewer/ngx';
import { Chooser } from '@awesome-cordova-plugins/chooser/ngx';
import { PreviewAnyFile } from '@awesome-cordova-plugins/preview-any-file/ngx';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { LaunchNavigator, LaunchNavigatorOptions } from '@awesome-cordova-plugins/launch-navigator/ngx';
import { IonicSelectableModule } from 'ionic-selectable';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
  ],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    AngularFireStorageModule,
    IonicSelectableModule,
    CommonModule
  ],
  providers: [
    DatePipe,
    Geolocation,
    NativeGeocoder,
    CallNumber,
    PhotoViewer,
    DocumentViewer,
    Chooser,
    PreviewAnyFile,
    InAppBrowser,
    LaunchNavigator,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
