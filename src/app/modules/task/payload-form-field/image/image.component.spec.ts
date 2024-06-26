import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ImageComponent } from "./image.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { NotificationService } from "src/app/services/notification.service";
import { EditorService } from "../../editor.service";
import { ActiveToast, IndividualConfig, ToastrService } from "ngx-toastr";

export class MockToastrService extends ToastrService {
  toasts: ActiveToast<any>[] = [];
 
  constructor() {
    super(null, null, null, null, null);
  }
 
  show(message?: string, title?: string, override?: Partial<IndividualConfig>, type?: string): ActiveToast<any> {
    return;
  }
}

describe("ImageComponent", () => {
  let component: ImageComponent;
  let fixture: ComponentFixture<ImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImageComponent],
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [EditorService, NotificationService, { provide: ToastrService, useValue: MockToastrService }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
