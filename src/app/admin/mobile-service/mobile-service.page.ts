import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { HelperService } from '../../services/helper.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import * as moment from 'moment';
import { PhotoViewer } from '@awesome-cordova-plugins/photo-viewer/ngx';
import { finalize, tap } from 'rxjs/operators';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { Observable } from 'rxjs';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Platform, LoadingController, ToastController, ActionSheetController, AlertController, NavController } from '@ionic/angular';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import { decode } from "base64-arraybuffer";
import { url } from 'inspector';

@Component({
  selector: 'app-mobile-service',
  templateUrl: './mobile-service.page.html',
  styleUrls: ['./mobile-service.page.scss'],
})
export class MobileServicePage implements OnInit {

  generals = {};
  settings;
  bannerImages = [];
  bannerImagesUrl = [];
  // File upload task 
  fileUploadTask: AngularFireUploadTask;
  // Upload progress
  percentageVal: Observable<number>;
  // Track file uploading with snapshot
  trackSnapshot: Observable<any>;

  constructor(
    private authService: AuthenticationService,
    private helper: HelperService,
    private firestore: AngularFirestore,
    private actionSheetCtrl: ActionSheetController,
    public alertController: AlertController,
    private afStorage: AngularFireStorage,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private photoViewer: PhotoViewer,
  ) { }

  ngOnInit() {

    this.getSettings();
  }

  getSettings() {

    return this.firestore.collection('generals').doc('mobile-service')
      .valueChanges()
      .subscribe(singleDoc => {
        console.log(singleDoc);
        this.settings = singleDoc;
      }, error => {
        console.log(error);
      });
  }

  updateSettings() {

    if (!this.helper.loading) {
      this.helper.presentLoading();
    }

    if (typeof this.settings.phones === 'string' || this.settings.phones instanceof String) {
      this.settings.phones = this.settings.phones.split(",");
    }

    this.firestore.doc<any>('generals/mobile-service').update(this.settings).then(() => {
      console.log('success');
      this.helper.dissmissLoading();
      this.helper.presentToast('Successfully updated.');

    }).catch(error => {

      this.helper.presentToast('Sorry, there is some error occured.');

    });
  }

  getGenerals() {

    this.authService.getSettings().subscribe(
      data => {

        if (data && data.data) {
          this.generals = data.data[0];
        }

        console.log(data);
      }, error => {
        console.log(error);
      });

  }

  async selectImageSource(type) {
    const buttons = [
      {
        text: 'Take Photo',
        icon: 'camera',
        handler: () => {
          this.addImage(CameraSource.Camera, type);
        }
      },
      {
        text: 'Choose From Photos',
        icon: 'image',
        handler: () => {
          this.addImage(CameraSource.Photos, type);
        }
      }
    ];

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Select Image Source',
      mode: 'ios',
      buttons
    });
    await actionSheet.present();
  }

  async addImage(source: CameraSource, type) {

    const image = await Camera.getPhoto({
      quality: 60,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      source
    });

    const blob = new Blob([new Uint8Array(decode(image.base64String))], {
      type: `image/${image.format}`,
    });
    let filename: string = "" + moment().unix();

    const file = new File([blob], filename, {
      lastModified: moment().unix(),
      type: blob.type,
    });

    let im = new Image;
    im.src = "data:image/jpeg;base64, " + image.base64String;
    im.onload = () => {

      let formula;
      let width = im.width;
      let height = im.height;
      if (im.width < im.height) {
        formula = im.width / im.height;

        height = 250;
        width = 250 * formula;
      } else {
        formula = im.height / im.width;

        width = 250;
        height = 250 * formula;
      }

      this.helper.presentLoading();

      this.compressImage("data:image/jpeg;base64, " + image.base64String, width, height).then((compressed: any) => {
        // console.log('compressed', compressed);
        // this.resizedBase64 = compressed;
        compressed = compressed.split(',')[1];

        const blob2 = new Blob([new Uint8Array(decode(compressed))], {
          type: `image/${image.format}`,
        });
        let filename: string = "" + moment().unix();

        // this.bannerImages.push({
        //   id: Date.now(),
        //   base64: "data:image/jpeg;base64, " + image.base64String,
        //   file: file,
        //   format: image.format
        // });

        let upload = this.uploadToFirebase(file, Date.now()).then((upload) => {
          console.log('success', upload.url);

          // this.helper.dissmissLoading();

          if (type == 'banners') {

            if (!this.settings.banners) {
              this.settings.banners = [];
            }

            this.settings.banners.push(upload.url);
          } else if (type == 'unit_banners') {

            if (!this.settings.unit_banners) {
              this.settings.unit_banners = [];
            }

            this.settings.unit_banners.push(upload.url);
          }

          setTimeout(() => {
            this.updateSettings();
          }, 200);

        }).catch(error => {
          this.helper.dissmissLoading();
          this.helper.presentToast('Sorry, there is some error occured.');
        });

      }, error => {
        console.log('error', error);
      });

    };

  }

  removeImage(index, type) {

    if (type == 'banners') {
      this.settings.banners.splice(index, 1);
    } else if (type == 'unit_banners') {
      this.settings.unit_banners.splice(index, 1);
    }

  }

  async uploadToFirebase(file, reg_no): Promise<any> {

    return new Promise(async (resolve, reject) => {

      console.log('uploading...');

      const filename = new Date().getTime() + '_' + reg_no;

      // Storage path
      const fileStoragePath = `inspections/${new Date().getTime()}_${reg_no}`;

      // Image reference
      const imageRef = this.afStorage.ref(fileStoragePath);

      // File upload task
      this.fileUploadTask = this.afStorage.upload(fileStoragePath, file);
      // Show uploading progress
      this.percentageVal = this.fileUploadTask.percentageChanges();

      await this.fileUploadTask.snapshotChanges().pipe(
        finalize(async () => {
          console.log('finish fileUploadTask');

          await imageRef.getDownloadURL().subscribe(downloadURL => {

            resolve({
              name: filename,
              url: downloadURL,
            });

          });
        })
      ).toPromise();
    });

  }

  compressImage(src, newX, newY) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        const elem = document.createElement('canvas');
        elem.width = newX;
        elem.height = newY;
        const ctx = elem.getContext('2d');
        ctx.drawImage(img, 0, 0, newX, newY);
        const data = ctx.canvas.toDataURL();
        res(data);
      }
      img.onerror = error => rej(error);
    })
  }

  imagePreview(src) {

    this.photoViewer.show(src);

  }

}
