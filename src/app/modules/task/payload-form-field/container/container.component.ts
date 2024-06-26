import { Component, Input } from "@angular/core";
import { BaseWidget, ContainerMetaData } from "../../model/create-form.models";

@Component({
  selector: "app-container",
  templateUrl: "container.component.html",
  styleUrls: ["./container.component.scss"],
})
export class ContainerComponent {
  @Input() item: BaseWidget = {} as BaseWidget;

  get metaData(): ContainerMetaData {
    return this.item.metaData as ContainerMetaData;
  }
}
