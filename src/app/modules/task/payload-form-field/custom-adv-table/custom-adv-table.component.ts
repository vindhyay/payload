import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import {
  BaseWidget,
  CELL_ALIGNMENTS_TYPES,
  TABLE_OVERFLOW,
  TABLE_PAGINATION_POSITIONS,
  TableActions,
  WidgetTypes,
  Column,
} from "../../model/create-form.models";
import {
  conditionValidation,
  DeepCopy,
  dynamicEvaluation,
  getOrder,
  getUniqueId,
  scrollToBottom,
  superClone,
} from "../../../../utils";
import { FormControl, Validators } from "@angular/forms";
import { PaginationDirective } from "../../../shared/finlevit-custom-table/table-utils/pagination.directive";
import { CustomTableFiltersComponent } from "../../../shared/finlevit-custom-table/table-utils/custom-table-filters/custom-table-filters.component";
import { ConfirmationService } from "primeng/api";

const MIN_ROW_HEIGHT = 50;

@Component({
  selector: "finlevit-custom-adv-table",
  templateUrl: "./custom-adv-table.component.html",
  styleUrls: ["./custom-adv-table.component.scss"],
  providers: [ConfirmationService],
})
export class CustomAdvTableComponent implements OnInit, OnChanges, AfterViewInit {
  Object = Object;
  CellAlignTypes = CELL_ALIGNMENTS_TYPES;
  PaginatorPositionTypes = TABLE_PAGINATION_POSITIONS;
  OverflowTypes = TABLE_OVERFLOW;
  Text: WidgetTypes = WidgetTypes.Text;
  Button: WidgetTypes = WidgetTypes.Button;
  Modal: WidgetTypes = WidgetTypes.Modal;
  TextInput: WidgetTypes = WidgetTypes.TextInput;
  Email: WidgetTypes = WidgetTypes.Email;
  TextArea: WidgetTypes = WidgetTypes.TextArea;
  Number: WidgetTypes = WidgetTypes.Number;
  Checkbox: WidgetTypes = WidgetTypes.Checkbox;
  Image: WidgetTypes = WidgetTypes.Image;
  Dropdown: WidgetTypes = WidgetTypes.Dropdown;
  DatePicker: WidgetTypes = WidgetTypes.DatePicker;
  CheckboxGroup: WidgetTypes = WidgetTypes.CheckboxGroup;
  RadioGroup: WidgetTypes = WidgetTypes.RadioGroup;
  Upload: WidgetTypes = WidgetTypes.Upload;
  _columns: BaseWidget[] = [];
  @Input() isLoading = false;
  @Input() verticalBorder = true;
  @Input() horizontalBorder = true;
  @Input() tableBorder = true;
  @Input() isColumnEdit: boolean = false;
  @Input() dateFormat: string;
  @Input()
  set columns(columns) {
    this._columns = columns.map((column) => {
      if (column?.metaData?.widgetType === WidgetTypes.DatePicker) {
        if (column?.validators?.minDate) {
          column.validators.minDate = new Date(column.validators.minDate);
        }
        if (column?.validators?.maxDate) {
          column.validators.maxDate = new Date(column.validators.maxDate);
        }
      }
      return column;
    });
  }
  get columns() {
    return this._columns.filter((col) => !col?.metaData?.isHidden);
  }
  isPaginationEnabled = true;
  @Input() sort = false;
  @Input() filter = false;
  @Input() addRows = false;
  @Input()
  set overflowType(value: TABLE_OVERFLOW) {
    this.isPaginationEnabled = value === TABLE_OVERFLOW.PAGINATION;
    if (this.isPaginationEnabled) {
      this.updateRowsLimit();
    }
  }
  @Input() paginatorPosition: TABLE_PAGINATION_POSITIONS = TABLE_PAGINATION_POSITIONS.BOTTOM;
  @Input() rows = 0;
  @Input() isServerSidePagination = false;
  @Input() totalRecords = 0;
  _tableData = [];
  filteredTableData = [];
  @Input()
  set tableData(data) {
    this._tableData = data;
    this.filteredTableData = data;
    this.updateRowsLimit();
  }
  get tableData() {
    return this._tableData;
  }
  @Input() hideHeader = false;
  @Input() hideFooter = false;
  @Input() actions: TableActions = null;
  @Output() onColDataChange = new EventEmitter();
  @Output() onRowClick = new EventEmitter();
  @Output() onPageChange = new EventEmitter();

  @Input() saveBtnProperties: any = {};
  @Input() cancelBtnProperties: any = {};

  @Output() handleRowSave = new EventEmitter();
  @Output() handleRowDelete = new EventEmitter();
  @Output() onBtnClick = new EventEmitter();
  @Output() onOptionChange = new EventEmitter();
  @Output() onTableDataChange = new EventEmitter();
  @Input() isDisabled: boolean = false;
  @Input() onRowEdit: Function = null;
  @Input() onRowDelete: Function = null;
  @Input() rowEditConfigure: boolean = false;
  @Input() rowDeleteConfigure: boolean = false;
  tableId: any = null;
  editRows = {};
  editCells = {};
  newRows = {};
  modifyingData = {};
  rowErrors = {};

  //loading rows
  saveLoadingRows = {};
  deleteLoadingRows = {};

  // pagination related
  currentPage = 1;
  limitPerPage = 1;
  @ViewChild("tableBody", { static: false }) tableBody: ElementRef;
  @ViewChild("tableFilters", { static: false }) tableFilters: CustomTableFiltersComponent;
  @ViewChild("pagination", { static: false }) tablePagination: PaginationDirective;
  constructor(private confirmationService: ConfirmationService) {}

  isCellEditMode(col, rowIndex) {
    return this.editRows[rowIndex] || this.newRows[rowIndex];
  }
  isRowEditMode(rowIndex) {
    return this.editRows[rowIndex];
  }
  isNewRowEditMode(rowIndex) {
    return this.newRows[rowIndex];
  }
  get isEditRowExists() {
    return Object.keys(this.editRows)?.length || Object.keys(this.newRows)?.length;
  }

  ngOnInit(): void {
    this.tableId = getUniqueId("table");
  }

  get tableRows() {
    const tableRows = this.tableBody?.nativeElement?.querySelectorAll(".f-tr-group")?.length;
    const bodyHeight = this.tableBody?.nativeElement?.offsetHeight;
    const availableSpace = bodyHeight - tableRows * MIN_ROW_HEIGHT;
    return MIN_ROW_HEIGHT > availableSpace;
  }

  updateRowsLimit() {
    const bodyHeight = this.tableBody?.nativeElement?.offsetHeight;
    this.limitPerPage = Math.floor(bodyHeight / MIN_ROW_HEIGHT) || 1;
  }
  ngAfterViewInit() {
    setTimeout(() => {
      if (this.isPaginationEnabled) {
        this.updateRowsLimit();
        if (this.isServerSidePagination) {
          this.onPageChange.emit({ limit: this.limitPerPage, page: this.currentPage });
        }
      }
    }, 100);
  }
  ngOnChanges(changes: SimpleChanges) {
    if (this.isPaginationEnabled) {
      this.currentPage = 1;
      this.updateRowsLimit();
    }
  }
  onResize($event, column: BaseWidget | TableActions) {
    column.width = parseInt($event, 10);
  }
  getMinWidth() {
    let sum = 0;
    this.columns.forEach((col) => {
      sum = sum + Number(col.width || 100);
    });
    if (this.actions?.editRow || this.actions?.deleteRow) {
      sum = sum + Number(this.actions?.width || 100);
    }
    return sum + "px";
  }
  doDelete(index) {
    this.deleteLoadingRows[index] = true;
    this.onRowDelete(this.tableData[index])
      .then(() => {
        this.deleteLoadingRows[index] = false;
        delete this.rowErrors[index];
        delete this.newRows[index];
        delete this.modifyingData[index];
      })
      .catch((error) => {
        this.deleteLoadingRows[index] = false;
      });
  }
  onDelete(index, rowData, isNew = false) {
    if (this.rowDeleteConfigure && !isNew) {
      this.confirmationService.confirm({
        message: "Are you sure that you want to delete this record?",
        accept: () => {
          this.doDelete(index);
        },
      });
    } else {
      this.tableData.splice(index, 1);
      delete this.rowErrors[index];
      delete this.newRows[index];
      delete this.modifyingData[index];
      this.handleRowDelete.emit({ index, rowData, isNew });
    }
  }
  onEdit(rowIndex, rowData: Array<any>) {
    this.editRows[rowIndex] = rowData;
    const currentRow: any = {};
    (rowData || []).forEach((eachColumn) => {
      if (eachColumn?.value?.value) {
        currentRow[eachColumn?.widgetId] = eachColumn?.value?.value;
      } else {
        if (
          eachColumn["metaData"].widgetType === WidgetTypes.DatePicker ||
          eachColumn["metaData"].widgetType === WidgetTypes.Number
        ) {
          currentRow[eachColumn?.widgetId] = null;
        } else {
          currentRow[eachColumn?.widgetId] = "";
        }
      }
    });
    this.modifyingData[rowIndex] = currentRow;
  }
  onRowEditCancel(index, rowData) {
    this.tableData[index] = this.editRows[index];
    delete this.editRows[index];
    delete this.modifyingData[index];
    delete this.editCells[index];
    delete this.rowErrors[index];
  }
  onRowSave(index, rowData, isNew = false) {
    if (this.validateRow(index, rowData)) {
      if (this.rowEditConfigure && !isNew) {
        this.saveLoadingRows[index] = true;
        const updatedRowData = DeepCopy.copy(this.tableData[index]);
        (updatedRowData || []).forEach((eachColumn) => {
          if (!eachColumn?.value) {
            eachColumn.value = {};
          }
          eachColumn.value.value = rowData[eachColumn?.widgetId];
        });
        this.onRowEdit(updatedRowData)
          .then(() => {
            this.saveLoadingRows[index] = false;
            delete this.editRows[index];
            delete this.rowErrors[index];
            delete this.modifyingData[index];
            delete this.editCells[index];
          })
          .catch((error) => {
            this.saveLoadingRows[index] = false;
          });
      } else {
        this.handleRowSave.emit({ index, rowData });
        if (isNew) {
          delete this.newRows[index];
        } else {
          delete this.editRows[index];
        }
        delete this.rowErrors[index];
        delete this.modifyingData[index];
        delete this.editCells[index];
        const oldRowData = this.tableData[index];
        (oldRowData || []).forEach((eachColumn) => {
          if (!eachColumn?.value) {
            eachColumn.value = {};
          }
          eachColumn.value.value = rowData[eachColumn?.widgetId];
        });
      }
    }
  }
  onColEdit($event, column: BaseWidget, rowIndex, rowData) {
    const colRowData = {};
    (this.tableData[rowIndex] || []).forEach((eachCol) => {
      colRowData[eachCol?.widgetId] = eachCol?.value?.value || null;
    });
    if (!this.editCells[rowIndex]) {
      this.editCells[rowIndex] = {};
    }
    this.editCells[rowIndex][column?.widgetId] = colRowData[column?.widgetId];
    if (!this.modifyingData[rowIndex]) {
      this.modifyingData[rowIndex] = superClone(colRowData);
    }
  }
  onColSave($event) {
    Object.keys(this.modifyingData).forEach((index) => {
      const rowData = this.modifyingData[index];
      if (this.validateRow(index, rowData)) {
        const oldRowData = this.tableData[index];
        (oldRowData || []).forEach((eachColumn) => {
          if (!eachColumn?.value) {
            eachColumn.value = {};
          }
          eachColumn.value.value = rowData[eachColumn?.widgetId];
        });
        if (this.newRows[index]) {
          delete this.newRows[index];
        }
        delete this.editRows[index];
        delete this.editCells[index];
        delete this.modifyingData[index];
      }
    });
  }
  onColSaveCancel($event) {
    this.editCells = {};
    Object.keys(this.modifyingData).forEach((rowIndex) => {
      if (this.newRows[rowIndex]) {
        this.onDelete(rowIndex, this.modifyingData[rowIndex], true);
      }
    });
    this.modifyingData = {};
    this.editRows = {};
  }
  validateRow(index, rowData, columnData: BaseWidget = null) {
    let valid = true;
    this.columns.forEach((eachCol) => {
      if (columnData && columnData?.widgetId && columnData?.widgetId !== eachCol.widgetId) {
        return;
      }
      const columnValue = rowData[eachCol?.widgetId];
      const tempFormControl = new FormControl(columnValue, this.getValidators(eachCol.validators) || []);
      if (tempFormControl.valid) {
        if (!this.rowErrors[index]) {
          this.rowErrors[index] = {};
        }
        this.rowErrors[index][eachCol.widgetId] = { error: false, errorMsg: "" };
      } else {
        valid = false;
        if (!this.rowErrors[index]) {
          this.rowErrors[index] = {};
        }
        this.rowErrors[index][eachCol.widgetId] = {
          error: true,
          errorMsg: eachCol?.metaData?.errorMessage || this.getErrorMessages(tempFormControl.errors, eachCol.label)[0],
        };
      }
    });
    return valid;
  }
  getErrorMessages = (errors: any, label: any) => {
    const errorMessages: string[] = [];
    Object.keys(errors).forEach((error) => {
      switch (error) {
        case "required":
          errorMessages.push(`${label} is required`);
          break;
        case "minlength":
        case "maxlength":
          errorMessages.push(
            `Expected atleast length ${errors[error].requiredLength} but got ${errors[error].actualLength}`
          );
          break;
        case "min":
          errorMessages.push(`Expected atleast value ${errors[error].min} but got ${errors[error].actual}`);
          break;
        case "max":
          errorMessages.push(`Expected atleast value ${errors[error].max} but got ${errors[error].actual}`);
          break;
      }
    });
    return errorMessages;
  };
  getValidators = (validators: any) => {
    const _validators: any = [];
    Object.keys(validators).forEach((validator) => {
      switch (validator) {
        case "minValue":
          validators[validator] && _validators.push(Validators.min(validators[validator]));
          break;
        case "minLength":
          validators[validator] && _validators.push(Validators.minLength(validators[validator]));
          break;
        case "maxValue":
          validators[validator] && _validators.push(Validators.max(validators[validator]));
          break;
        case "maxLength":
          validators[validator] && _validators.push(Validators.maxLength(validators[validator]));
          break;
        case "required":
          validators[validator] && _validators.push(Validators.required);
          break;
      }
    });
    return _validators;
  };
  getColumnDefaultValue(column: Column) {
    switch (column.type) {
      case "string":
        return "";
      case "number":
        return null;
      default:
        return null;
    }
  }
  addRow() {
    if (this.isDisabled) {
      return;
    }
    const newRow: any = [];
    const newRowData = {};
    this.columns.forEach((eachColumn) => {
      const column = DeepCopy.copy(eachColumn);
      column.value.value = column?.value?.value || null;
      newRow.push(column);
      newRowData[eachColumn?.widgetId] = column?.value?.value;
    });
    this.tableData.push(newRow);
    if (this.isPaginationEnabled) {
      this.currentPage = Math.ceil(this.tableData.length / this.limitPerPage);
    } else {
      const tableBodyElement = document.querySelector(`#${this.tableId} .f-tbody`);
      setTimeout(() => {
        scrollToBottom(tableBodyElement);
      });
    }
    const rowIndex = this.tableData.length - 1;
    this.newRows[rowIndex] = newRow;
    this.modifyingData[rowIndex] = newRowData;
    if (!this.actions?.editRow) {
      if (!this.editCells[rowIndex]) {
        this.editCells[rowIndex] = {};
      }
      Object.keys(newRow).forEach((col) => {
        this.editCells[rowIndex][col] = newRow[col];
      });
    }
  }
  handlePageChange($event: number) {
    this.currentPage = $event;
    if (this.isServerSidePagination) {
      this.onPageChange.emit({ limit: this.limitPerPage, page: $event });
    }
  }
  getTotalPages() {
    let pages = 0;
    if (this.isServerSidePagination) {
      pages = Math.ceil(this.totalRecords / this.limitPerPage) || 1;
    } else {
      if (!this.tableFilters?.filtersEnabled) {
        pages = Math.ceil(this.tableData.length / this.limitPerPage) || 1;
      } else {
        pages = Math.ceil(this.filteredTableData.length / this.limitPerPage) || 1;
      }
    }
    if (this.currentPage > pages) {
      this.currentPage = pages;
    }
    return pages;
  }
  onSortChange($event) {
    const order = getOrder($event.direction);
    this.tableData.sort((data1, data2) => {
      const value1Data = data1.find((cellData) => cellData.widgetId === $event.column);
      const value2Data = data2.find((cellData) => cellData.widgetId === $event.column);
      const value1 = value1Data?.value?.value;
      const value2 = value2Data?.value?.value;
      let result = null;
      if (value1 == null && value2 != null) {
        result = -1;
      } else if (value1 != null && value2 == null) {
        result = 1;
      } else if (value1 == null && value2 == null) {
        result = 0;
      } else if (typeof value1 === "string" && typeof value2 === "string") {
        result = value1.localeCompare(value2);
      } else {
        result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;
      }
      return order * result;
    });
  }

  getRulesFromFilterColumns(columns) {
    return (columns || []).map((column) => {
      return {
        widgetId: column?.field?.widgetName,
        condition: column.condition,
        dataType: column?.field?.type,
        operator: column.operator,
        value: column?.value,
      };
    });
  }

  handleSearch({ searchColumns, filtersLogic }) {
    this.currentPage = 1;
    const rules = this.getRulesFromFilterColumns(searchColumns);
    if (rules && rules.length) {
      this.filteredTableData = this.tableData.filter((rowData: BaseWidget[]) => {
        const rowDataInObject = {};
        rowData.forEach((cellData: BaseWidget) => {
          rowDataInObject[cellData.widgetName] = cellData?.value?.value;
        });
        let condMatched = true;
        let filtersLogicCopy = JSON.parse(JSON.stringify(filtersLogic));
        for (let i: any = 0; i < rules.length; i++) {
          const rule = rules[i];
          const fieldValue = rowDataInObject[rule?.widgetId];
          let result = conditionValidation(rule, fieldValue);
          if (i === 0) {
            condMatched = result;
          } else if (rule.operator === "AND") {
            condMatched = condMatched && result;
          } else {
            condMatched = condMatched || result;
          }
          filtersLogicCopy = filtersLogicCopy.replace(new RegExp(i + 1, "g"), result);
        }
        if (filtersLogicCopy) {
          try {
            condMatched = dynamicEvaluation(filtersLogicCopy);
          } catch (error) {
            console.log("error", error);
          }
        }
        return condMatched;
      });
      this.filteredTableData = [...this.filteredTableData];
    } else {
      this.filteredTableData = [];
    }
  }
  optionChange($event, data) {
    this.onOptionChange.emit({ event: $event, data });
  }

  calculateCellValue(col, rowIndex) {
    return col?.value?.value;
  }

  rowDataColumnsFilterFn = (eachCol) => {
    const colConfig = this.columns.find((col) => col?.displayName === eachCol?.displayName);
    return colConfig && !colConfig?.metaData?.isHidden;
  };
}
