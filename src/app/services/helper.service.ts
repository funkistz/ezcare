import { Injectable } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Camera, CameraResultType, Photo, CameraSource } from '@capacitor/camera';
import { Platform } from '@ionic/angular';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { decode } from "base64-arraybuffer";
import * as moment from 'moment';

const IMAGE_DIR = 'stored-images';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  loading;
  images = [];

  constructor(
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    public platform: Platform
  ) { }

  async presentToast(message) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'top',
      translucent: true,
      mode: 'ios'
    });
    toast.present();
  }

  async presentLoading(message = 'Please wait...') {
    this.loading = await this.loadingController.create({
      message: message,
      mode: 'ios',
    });
    await this.loading.present();
  }

  updateLoading(message) {
    this.loading.setContent(message);
  }

  dissmissLoading() {

    setTimeout(() => {
      if (this.loading) {
        this.loading.dismiss();
      }
    }, 500);

  }

  async presentAlertDetails(header, message) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: header,
      message: message,
      mode: 'ios',
      buttons: [{
        text: 'Okay',
        handler: () => {
          console.log('Confirm Okay');
        }
      }
      ]
    });

    await alert.present();
  }

  async imagePicker() {

    // Camera.pickImages(options: GalleryImageOptions) => 

    let photos = [];
    const images = await Camera.pickImages({
      quality: 60,
      height: 1080,
      correctOrientation: true,
      limit: 20
    });

    console.log('images', images);

    for (const image of images.photos) {
      if (image) {
        await photos.push({
          file: await this.saveImage(image),
          format: image.format,
          webPath: image.webPath,
        });
      }
    }

    return photos;

  }

  async camera() {
    const image = await Camera.getPhoto({
      quality: 60,
      height: 1080,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      // source: CameraSource.Camera
      source: CameraSource.Photos
    });

    return {
      file: await this.saveImage(image),
      format: image.format,
      webPath: image.webPath,
    }
  }

  // Create a new file from a capture image
  async saveImage(photo) {

    const base64Data = await this.readAsBase64(photo);

    // const savedFile = await Filesystem.writeFile({
    //   path: `${IMAGE_DIR}/${fileName}`,
    //   data: base64Data,
    //   directory: Directory.Data
    // });

    const blob = new Blob([new Uint8Array(decode(base64Data))], {
      type: `image/${photo.format}`,
    });
    let filename: string = "" + moment().unix();

    const file = new File([blob], filename, {
      lastModified: moment().unix(),
      type: blob.type,
    });

    let finalFile = {
      original: file,
      thumbnail: null
    }

    await this.compressImage("data:image/" + photo.format + ";base64, " + base64Data).then((compressed: any) => {
      // console.log('compressed', compressed);
      // this.resizedBase64 = compressed;
      compressed = compressed.split(',')[1];

      const blob2 = new Blob([new Uint8Array(decode(compressed))], {
        type: `image/${photo.format}`,
      });
      let filename: string = "" + moment().unix();

      const file2 = new File([blob2], filename, {
        lastModified: moment().unix(),
        type: 'image/jpeg',
      });

      finalFile.thumbnail = file2;

    }, error => {
      console.log('error', error);
    });

    return finalFile;

    // console.log('savedFile', savedFile);

    // Reload the file list
    // Improve by only loading for the new image and unshifting array!
    // this.loadFiles();
  }

  private async readAsBase64(photo: Photo) {
    if (this.platform.is('hybrid')) {
      const file = await Filesystem.readFile({
        path: photo.path
      });
      // console.log(file);
      return file.data;
    }
    else {
      // Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(photo.webPath);
      const blob = await response.blob();

      return (await this.convertBlobToBase64(blob) as string).split(',')[1];
    }
  }

  // Helper function
  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

  async loadFiles() {
    this.images = [];

    const loading = await this.loadingController.create({
      message: 'Loading data...',
    });
    await loading.present();

    Filesystem.readdir({
      path: IMAGE_DIR,
      directory: Directory.Data,
    }).then(result => {
      this.loadFileData(result.files);
    },
      async (err) => {
        // Folder does not yet exists!
        await Filesystem.mkdir({
          path: IMAGE_DIR,
          directory: Directory.Data,
        });
      }
    ).then(_ => {
      loading.dismiss();
    });
  }

  // Get the actual base64 data of an image
  // base on the name of the file
  async loadFileData(fileNames: string[]) {
    for (let f of fileNames) {
      const filePath = `${IMAGE_DIR}/${f}`;

      const readFile = await Filesystem.readFile({
        path: filePath,
        directory: Directory.Data,
      });

      this.images.push({
        name: f,
        path: filePath,
        data: `data:image/jpeg;base64,${readFile.data}`,
      });
    }
  }

  thumbImage(base64String, format) {

  }

  compressImage(src) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {

        let formula;
        let width = img.width;
        let height = img.height;
        if (img.width < img.height) {
          formula = img.width / img.height;

          height = 250;
          width = 250 * formula;
        } else {
          formula = img.height / img.width;

          width = 250;
          height = 250 * formula;
        }

        const elem = document.createElement('canvas');
        elem.width = width;
        elem.height = height;
        const ctx = elem.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const data = ctx.canvas.toDataURL();
        res(data);
      }
      img.onerror = error => rej(error);
    })
  }


}
