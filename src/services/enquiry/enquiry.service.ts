import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnquiryService {
  constructor() {}

  sendEnquiry(formData: any) {
    return of({ success: true, message: 'Enquiry submitted (mock).', data: formData }).pipe(delay(250));
  }
}
