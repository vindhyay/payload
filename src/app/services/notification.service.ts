import { Injectable } from "@angular/core";
import { ActiveToast, ToastrService } from "ngx-toastr";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  defaultOption = {
    disableTimeOut: false,
  };
  constructor(protected toast: ToastrService) {}

  public addressAutoComplete = new BehaviorSubject<any>({});
  public addressAutoCompleteChanged$ = this.addressAutoComplete.asObservable();

  public error(message: string, title: string = "Error", option = this.defaultOption): ActiveToast<any> {
    return this.toast.error(message, title, { ...option, enableHtml: true });
  }
  public success(message: string, title: string = "Success", option = this.defaultOption): ActiveToast<any> {
    return this.toast.success(message, title, { ...option, enableHtml: true });
  }
  public info(message: string, title: string = "Info", option = this.defaultOption): ActiveToast<any> {
    return this.toast.info(message, title, { ...option, enableHtml: true });
  }
  public warn(message: string, title: string = "Warning"): ActiveToast<any> {
    return this.toast.warning(message, title, { enableHtml: true });
  }
}
