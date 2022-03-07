import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { HelperService } from '../../services/helper.service';
import * as moment from 'moment';
import { Platform, LoadingController, ToastController, ActionSheetController, AlertController } from '@ionic/angular';
import { decode } from "base64-arraybuffer";
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { DomSanitizer } from '@angular/platform-browser';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { finalize, tap } from 'rxjs/operators';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.page.html',
  styleUrls: ['./banner.page.scss'],
})
export class BannerPage implements OnInit {

  banners;
  banner = {
    image_url: '',
    is_active: 0,
    position: 1,
  };
  image: any;
  fileUploadTask;
  percentageVal;

  constructor(
    private authService: AuthenticationService,
    private helper: HelperService,
    public alertController: AlertController,
    private actionSheetCtrl: ActionSheetController,
    private sanitizer: DomSanitizer,
    private afStorage: AngularFireStorage,
  ) { }

  ngOnInit() {

    this.getBanners();
  }

  getBanners() {

    this.authService.getBanners().subscribe(
      (data: any) => {

        if (data && data.data) {
          this.banners = data.data;
        }

        console.log('banners', data);
      }, error => {
        console.log('error', error);
      });

  }

  updateBanners() {

    console.log(this.banners);

    this.helper.presentLoading();

    let data = {
      banners: this.banners
    }

    this.authService.updateBanners(data).subscribe(
      (data: any) => {

        if (data && data.data) {
          this.banners = data.data;
        }

        console.log(data);
        this.helper.dissmissLoading();
      }, error => {
        console.log(error);
        this.helper.dissmissLoading();

      });

  }

  onRenderItems(event) {
    console.log(`Moving item from ${event.detail.from} to ${event.detail.to}`);

    let draggedItem = this.banners.splice(event.detail.from, 1)[0];
    this.banners.splice(event.detail.to, 0, draggedItem)
    //this.listItems = reorderArray(this.listItems, event.detail.from, event.detail.to);

    for (let index = 1; index <= this.banners.length; index++) {

      this.banners[index - 1].position = index;

    }


    console.log(this.banners);

    event.detail.complete();
  }

  async selectImageSource() {

    this.addImage(CameraSource.Photos);
    return;

    const buttons = [
      {
        text: 'Take Photo',
        icon: 'camera',
        handler: () => {
          this.addImage(CameraSource.Camera);
        }
      },
      {
        text: 'Choose From Photos',
        icon: 'image',
        handler: () => {
          this.addImage(CameraSource.Photos);
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

  async addImage(source: CameraSource) {

    const image = await Camera.getPhoto({
      quality: 60,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      width: 960,
      height: 540,
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

      // this.image = {
      //   id: Date.now(),
      //   base64: this.sanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64, " + image.base64String),
      //   file: file,
      //   format: image.format
      // };

      this.compressImage("data:image/jpeg;base64, " + image.base64String, width, height).then((compressed: any) => {
        // console.log('compressed', compressed);
        // this.resizedBase64 = compressed;
        compressed = compressed.split(',')[1];

        const blob2 = new Blob([new Uint8Array(decode(compressed))], {
          type: `image/${image.format}`,
        });
        let filename: string = "" + moment().unix();

        const file2 = new File([blob2], filename, {
          lastModified: moment().unix(),
          type: blob.type,
        });

        this.image = {
          id: Date.now(),
          base64: this.sanitizer.bypassSecurityTrustUrl("data:image/jpeg;base64, " + compressed),
          file: file2,
          format: image.format
        };

      }, error => {
        console.log('error', error);
      });

    };

  }

  compressImage(src, newX, newY) {

    newX = 1920;
    newY = 1080;

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

  async upload() {

    this.helper.presentLoading();

    let name = (Math.random() + 1).toString(36).substring(7);
    let upload = await this.uploadToFirebase(this.image.file, name);

    let data = {
      url: upload.url
    };

    this.authService.addBanners(data).subscribe(
      (data: any) => {

        this.image = null;

        if (data && data.data) {
          this.banners = data.banners;
        }

        console.log(data);
        this.helper.dissmissLoading();
      }, error => {
        console.log(error);
        this.helper.dissmissLoading();

      });
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

  async removeImage(id) {

    const alert = await this.alertController.create({
      header: 'Are you sure want to remove?',
      // message: 'Cannot be undo',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          id: 'cancel-button',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Remove',
          id: 'confirm-button',
          handler: () => {

            this.helper.presentLoading();

            this.authService.deleteBanners(id).subscribe(
              (data: any) => {

                if (data && data.banners) {
                  this.banners = data.banners;
                }

                console.log(data);
                this.helper.dissmissLoading();
              }, error => {
                console.log(error);
                this.helper.dissmissLoading();

              });

          }
        }
      ]
    });

    await alert.present();
  }

}
