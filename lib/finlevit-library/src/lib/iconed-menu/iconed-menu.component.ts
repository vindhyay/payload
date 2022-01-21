import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IAvatarData, IAvatarEnabled } from '../model/common-types';

@Component({
  selector: 'rng-iconed-menu',
  templateUrl: './iconed-menu.component.html',
  styleUrls: ['./iconed-menu.component.scss']
})
export class IconedMenuComponent {
  @Output() changeItem = new EventEmitter();

  @Input() items: IAvatarData[] | IAvatarEnabled[];
  @Input() placeholderItem: IAvatarData;
  @Input() showName: boolean | null = true;
  @Input() currentItem: IAvatarData | IAvatarEnabled;
  @Input() disabled: boolean = false;
  @Input() color: string | null = '#434B5B';
  @Input() bgColor: string | null = '#ffffff';
  @Input() borderColor: string | null = '#ffffff';
  get currentName(): string {
    const avatar = this.itemAvatar(this.currentItem);
    return avatar.name;
  }

  itemAvatar(item: IAvatarData | IAvatarEnabled): IAvatarData {
    if (!item) {
      return this.placeholderItem || ({} as IAvatarData);
    }
    if ('avatar' in item) {
      return (item as IAvatarEnabled).avatar;
    }
    return item as IAvatarData;
  }

  itemName(item: IAvatarData | IAvatarEnabled): string {
    return this.itemAvatar(item).name;
  }

  clickFunction(item) {
    this.currentItem = item;
    this.changeItem.emit(item);
  }
}
