import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { getAllFromFields, eligibileReviewField } from "src/app/utils";
import { StepperContainerMetaData, TextStyles } from "../../model/create-form.models";
import { EditorService } from "../../editor.service";
import { TaskService } from "../../services/task.service";
@Component({
  selector: "app-horizontal-stepper",
  templateUrl: "./horizontal-stepper.component.html",
  styleUrls: ["./horizontal-stepper.component.scss"],
})
export class HorizontalStepperComponent implements OnInit {
  constructor(private editorService: EditorService, private taskService: TaskService) {}
  @Input() headerContent = [];
  @Input() viewMode = false;
  @Input() metaData : StepperContainerMetaData ;
  @Output() onNext = new EventEmitter();
  @Output() onPrev = new EventEmitter();
  @Output() onSelect = new EventEmitter();
  @Output() onBtnClick = new EventEmitter();
  @Output() onOptionChange = new EventEmitter();
  @Output() onTableDataChange = new EventEmitter();
  @Input() completedSteps = {};
  @Input() showEdit = false;
  @Input() children = [];
  reviewData = [];
  _selectedIndex = 0;
  @ViewChild("contentConatiner", { read: ElementRef }) contentConatiner: ElementRef;
  @ViewChild("stepperBody", { read: ElementRef }) stepperBody: ElementRef;
  isInteract = false;
  ngOnInit() {
    setTimeout(() => {
      this.checkHeight();
      this.scrollTo(this._selectedIndex);
    }, 100);
    this.taskService.transactionDetailsSubject.subscribe((value) => {
      setTimeout(() => {
        this.scrollTo(this._selectedIndex);
      });
    });
  }

  @Input() set selectedIndex(number) {
    this._selectedIndex = number;
    setTimeout(() => {
      this.checkHeight();
    }, 100);
  }
  private scrollTo(_index: any) {
    if (this.isInteract)
      this.stepperBody.nativeElement
        ?.querySelectorAll("li")
        [this._selectedIndex]?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }
  setSelection(item: any) {
    this.isInteract = true;
    const actionName = item.data.metaData?.onClickConfigs.find(
      (item) => item.action === "previousStep" || item.action === "nextStep"
    );
    switch (actionName?.action) {
      case "previousStep":
        this.onPrev.emit({ stepIndex: this._selectedIndex, item: item });
        break;
      case "nextStep":
        this.onNext.emit({ stepIndex: this._selectedIndex, item: item });
        break;
      default:
        this.onBtnClick.emit(item);
        break;
    }
  }
  checkHeight(containerName?) {
    this.editorService.setAdjustableHeight(
      this.children[this._selectedIndex].children,
      ".content" + this.metaData["widgetId"]
    );
  }
  onSelectIndexChange = (index) => {
    this.isInteract = true;
    this.onSelect.emit(index);
  };
}
