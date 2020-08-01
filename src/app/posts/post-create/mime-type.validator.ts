import { AbstractControl } from '@angular/forms';
import { from, Observable, Observer } from 'rxjs';

export const mimeType = (
  control: AbstractControl
): Observable<{ [key: string]: any }> => {
  const file = control.value as File;
  const fileReader = new FileReader();
  const frObs = new Observable((observer: Observer<{ [key: string]: any }>) => {
    fileReader.addEventListener('loadend', () => {
      const arr = new Uint8Array(fileReader.result as ArrayBuffer).subarray(
        0,
        4
      );
      let header = '';
      let isValid = false;
      for (const buff of arr) {
        header += buff.toString(16);
      }
      switch (header) {
        case '89504e47':
          // type = 'image/png';
          isValid = true;
          break;
        case '47494638':
          // type = 'image/gif';
          isValid = true;
          break;
        case 'ffd8ffe0':
        case 'ffd8ffe1':
        case 'ffd8ffe2':
        case 'ffd8ffe3':
        case 'ffd8ffe8':
          // type = 'image/jpeg';
          isValid = true;
          break;
        default:
          // type = 'unknown'; // Or you can use the blob.type as fallback
          isValid = false;
          break;
      }
      if (isValid) {
        observer.next(null);
      } else {
        observer.next({ invalidMimeType: true });
      }
      observer.complete();
    });
    fileReader.readAsArrayBuffer(file);
  });
  return frObs;
};
