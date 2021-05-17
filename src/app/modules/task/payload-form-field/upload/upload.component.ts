import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {TaskService} from "../../services/task.service";
import {BaseWidget, UploadMetaData} from "../../model/create-form.models";

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {

  constructor(private activatedRoute: ActivatedRoute, private taskService: TaskService) { }

  ngOnInit(): void {
  }

  @Input() item: BaseWidget = {} as BaseWidget;
  @Input() viewMode = false;
  @Input() editMode = false;
  transactionId: string;

  get metaData(): UploadMetaData {
    return this.item.metaData as UploadMetaData;
  }

  uploadFile(formData){
    this.activatedRoute.paramMap.subscribe(params => {
      this.transactionId = params.get('transactionId');
    });
    if(this.transactionId){
      this.taskService.uploadFile(formData, this.transactionId).subscribe( result => {
        if(result){
          this.item.value.value = result;
        }
      }, error => {
        // TODo error handling
      })
    }
  }
}
