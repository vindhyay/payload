import {
  AfterViewInit,
  ChangeDetectorRef,
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
import { FormControl, Validators } from "@angular/forms";
import {
  CELL_ALIGNMENTS_TYPES,
  Column,
  TABLE_OVERFLOW,
  TABLE_PAGINATION_POSITIONS,
  TableActions,
  WidgetTypes,
} from "../../task/model/create-form.models";
import {
  getOrder,
  conditionValidation,
  getUniqueId,
  scrollToBottom,
  superClone,
  dynamicEvaluation,
} from "../../../utils";
import { CustomTableFiltersComponent } from "./table-utils/custom-table-filters/custom-table-filters.component";
import { PaginationDirective } from "./table-utils/pagination.directive";
import { SelectionModel } from "@angular/cdk/collections";
const MIN_ROW_HEIGHT = 50;

@Component({
  selector: "finlevit-custom-table",
  templateUrl: "./custom-table.component.html",
  styleUrls: ["./custom-table.component.scss"],
})
export class CustomTableComponent implements OnInit, AfterViewInit, OnChanges {
  @Input()
  set columns(columns) {
    this._columns = columns.map((column) => {
      this.searchObject[column.columnId] = null;
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
    return this._columns;
  }
  @Input()
  set overflowType(value: TABLE_OVERFLOW) {
    this.isPaginationEnabled = value === TABLE_OVERFLOW.PAGINATION;
    if (this.isPaginationEnabled) {
      this.updateRowsLimit();
    }
  }
  @Input() isColumnEdit: boolean = false;
  @Input()
  set tableData(data) {
    this._tableData = data;
    this.filteredTableData = data;
    this.updateRowsLimit();
  }
  get tableData() {
    return this._tableData;
  }
  constructor(private cdr: ChangeDetectorRef) {}
  @Input() minRowHeight = MIN_ROW_HEIGHT;
  Object = Object;
  CellAlignTypes = CELL_ALIGNMENTS_TYPES;
  PaginatorPositionTypes = TABLE_PAGINATION_POSITIONS;
  OverflowTypes = TABLE_OVERFLOW;
  Text: WidgetTypes = WidgetTypes.Text;
  Button: WidgetTypes = WidgetTypes.Button;
  Modal: WidgetTypes = WidgetTypes.Modal;
  TextInput: WidgetTypes = WidgetTypes.TextInput;
  TextArea: WidgetTypes = WidgetTypes.TextArea;
  Number: WidgetTypes = WidgetTypes.Number;
  Checkbox: WidgetTypes = WidgetTypes.Checkbox;
  Image: WidgetTypes = WidgetTypes.Image;
  Dropdown: WidgetTypes = WidgetTypes.Dropdown;
  DatePicker: WidgetTypes = WidgetTypes.DatePicker;
  Avatar: WidgetTypes = WidgetTypes.Avatar;
  CheckboxGroup: WidgetTypes = WidgetTypes.CheckboxGroup;
  RadioGroup: WidgetTypes = WidgetTypes.RadioGroup;
  Upload: WidgetTypes = WidgetTypes.Upload;
  selectableConfig = {
    width: 50,
    alignment: CELL_ALIGNMENTS_TYPES.CENTER,
    label: "#",
  };
  _columns: Column[] = [];
  selection = new SelectionModel<any>(true, []);
  searchObject = {};
  @Input() saveBtnProperties: any = {};
  @Input() cancelBtnProperties: any = {};

  @Input() customTemplates = {};
  @Input() verticalBorder = false;
  @Input() horizontalBorder = true;
  @Input() tableBorder = true;
  isPaginationEnabled = true;

  @Input() showPageOptions = true;
  @Input() sort = false;
  @Input() filter = false;
  @Input() addRows = false;
  @Input() paginatorPosition: TABLE_PAGINATION_POSITIONS = TABLE_PAGINATION_POSITIONS.BOTTOM;
  @Input() rows = 0;
  @Input() isServerSidePagination = false;
  @Input() isServerSideSorting = false;
  @Input() isServerSideFiltering = false;
  @Input() totalRecords = 0;
  @Input() pageOptions = [10, 15, 20, 30, 40, 50];
  @Input() fixedRecordsPerPage = 10;
  _tableData = [];
  filteredTableData = [];
  @Input() isLoading = false;
  @Input() hideHeader = false;
  @Input() hideFooter = false;
  @Input() dateFormat = "medium";
  @Input() actions: TableActions = null;
  @Input() selectable = false;
  @Input() colSearch = false;
  @Input() isDisabled: boolean = false;
  @Output() onColSearch = new EventEmitter();
  @Output() selectionHandler = new EventEmitter();
  @Output() selectedRows = new EventEmitter();

  @Output() onColDataChange = new EventEmitter();
  @Output() onRowClick = new EventEmitter();
  @Output() onPageChange = new EventEmitter();
  @Output() onSort = new EventEmitter();
  @Output() onRowEditClick = new EventEmitter();
  @Output() onRowDeleteClick = new EventEmitter();
  @Output() handleRowSave = new EventEmitter();
  @Output() handleColsSave = new EventEmitter();
  @Output() handleRowDelete = new EventEmitter();
  @Output() onFilter = new EventEmitter();

  tableId: any = null;
  editRows = {};
  editCells = {};
  newRows = {};
  modifyingData = {};
  rowErrors = {};

  // pagination related
  currentPage = 1;
  limitPerPage = 1;
  @ViewChild("tableBody", { static: false }) tableBody: ElementRef;
  @ViewChild("tableFilters", { static: false }) tableFilters: CustomTableFiltersComponent;
  @ViewChild("pagination", { static: false }) tablePagination: PaginationDirective;

  isCellEditMode(col, rowIndex) {
    return (
      !col?.metaData?.readOnly &&
      (this.editRows[rowIndex] ||
        this.newRows[rowIndex] ||
        (this.editCells[rowIndex] && this.editCells[rowIndex].hasOwnProperty(col?.columnId)))
    );
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

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.tableFilters?.filtersEnabled ? this.filteredTableData.length : this.tableData.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected) {
      this.selection.clear();
    } else {
      (this.tableFilters?.filtersEnabled ? this.filteredTableData : this.tableData).forEach((row) =>
        this.selection.select(row)
      );
    }
    this.selectedRows.emit(this.selection.selected);
  }

  /** Selects row if not selected; otherwise clear selection. */
  rowToggle(row) {
    this.selection.toggle(row);
    this.selectedRows.emit(this.selection.selected);
  }

  ngOnInit(): void {
    this.tableId = getUniqueId("table");
    this.selectionHandler.emit(this.selection);
    // Initiating search object
    this.columns.forEach((column) => {
      this.searchObject[column.columnId] = null;
    });
  }

  updateRowsLimit() {
    if (!this.fixedRecordsPerPage) {
      const bodyHeight = this.tableBody?.nativeElement?.offsetHeight;
      this.limitPerPage = Math.floor(bodyHeight / MIN_ROW_HEIGHT) || 1;
    } else {
      this.limitPerPage = this.fixedRecordsPerPage;
    }
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
    if (this.isPaginationEnabled && changes.rows) {
      this.currentPage = 1;
      this.updateRowsLimit();
    }
  }

  onResize($event: string, column: Column | TableActions) {
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
    if (this.selectable) {
      sum = sum + Number(this.selectableConfig.width);
    }
    return sum + "px";
  }
  onDelete($event: any, index: any, rowData: any, isNew = false) {
    if ($event) {
      $event?.stopPropagation();
    }
    if (this.actions?.emitOnDelete && !isNew) {
      this.onRowDeleteClick.emit({ event: $event, data: rowData });
      return;
    }
    this.tableData.splice(index, 1);
    delete this.rowErrors[index];
    delete this.newRows[index];
    delete this.modifyingData[index];
    this.handleRowDelete.emit({ index, rowData, isNew });
  }
  onEdit($event: any, rowIndex: string, data: Array<any>) {
    $event.stopPropagation();
    if (this.actions?.emitOnEdit) {
      this.onRowEditClick.emit({ event: $event, data });
      return;
    }
    this.editRows[rowIndex] = superClone(data);
    if (!this.modifyingData[rowIndex]) {
      this.modifyingData[rowIndex] = superClone(data);
    }
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
      this.handleRowSave?.emit({ index, rowData });
      if (isNew) {
        delete this.newRows[index];
      } else {
        delete this.editRows[index];
      }
      delete this.rowErrors[index];
      delete this.modifyingData[index];
      delete this.editCells[index];
      this.tableData[index] = rowData;
    }
  }
  validateRow(index, rowData, columnId = "") {
    let valid = true;
    Object.keys(rowData).forEach((column) => {
      if (columnId && columnId !== column) {
        return;
      }
      const columnValue = rowData[column];
      const columnConfig = this.columns.find((col) => col.columnId === column);
      const tempFormControl = new FormControl(columnValue, this.getValidators(columnConfig?.validators) || []);
      if (tempFormControl.valid) {
        if (!this.rowErrors[index]) {
          this.rowErrors[index] = {};
        }
        this.rowErrors[index][column] = { error: false, errorMsg: "" };
      } else {
        valid = false;
        if (!this.rowErrors[index]) {
          this.rowErrors[index] = {};
        }
        this.rowErrors[index][column] = {
          error: true,
          errorMsg:
            columnConfig?.metaData?.errorMessage ||
            this.getErrorMessages(tempFormControl.errors, columnConfig.label)[0],
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
  addRow() {
    if (this.isDisabled) {
      return;
    }
    const newRow: any = {};
    this.columns.forEach((eachColumn) => {
      Object.assign(newRow, { [eachColumn.columnId]: eachColumn?.value?.value || null });
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
    this.modifyingData[rowIndex] = newRow;
    if (!this.actions.editRow) {
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

  onSortChange($event: any) {
    const order = getOrder($event.direction);
    if (this.isServerSideSorting) {
      this.onSort.emit($event);
      return;
    }
    this.tableData.sort((row1, row2) => {
      const value1 = row1[$event.column];
      const value2 = row2[$event.column];
      let result = null;
      if (value1 == null && value2 != null) {
        result = value2 != null ? -1 : 0;
      } else if (value1 != null && value2 == null) {
        result = 1;
      } else if (typeof value1 === "string" && typeof value2 === "string") {
        result = value1.localeCompare(value2);
      } else {
        if (value1 < value2) {
          result = -1;
        } else if (value1 > value2) {
          result = 1;
        } else {
          result = 0;
        }
      }
      return order * result;
    });
  }

  getRulesFromFilterColumns(columns: any) {
    return (columns || []).map((column) => {
      return {
        fieldId: column?.field?.columnId,
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
    if (this.isServerSideFiltering) {
      this.onFilter.emit({ rules, filtersLogic });
      return;
    }
    if (rules && rules.length) {
      this.filteredTableData = this.tableData.filter((rowData) => {
        let condMatched = true;
        let filtersLogicCopy = JSON.parse(JSON.stringify(filtersLogic));
        for (let i: any = 0; i < rules.length; i++) {
          const rule = rules[i];
          const fieldValue = rowData[rule?.fieldId];
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
    } else {
      this.filteredTableData = [...this.tableData];
    }
  }
  emitColSearch(column: Column) {
    this.onColSearch.emit({ search: this.searchObject, column });
  }
  onKeyDown($event, column: Column) {
    if ($event.keyCode === 13) {
      this.emitColSearch(column);
    }
  }
  onPageLimitChange($event: number) {
    this.currentPage = 1;
    this.updateRowsLimit();
    this.onPageChange.emit({ limit: $event, page: this.currentPage });
  }
  calculateCellValue(col: any, rowIndex: any) {
    return this.tableData[rowIndex][col?.columnId];
  }

  columnFilterHiddenColumns(column: Column) {
    if (column?.metaData?.hasOwnProperty("isHidden")) {
      return !column?.metaData?.isHidden;
    }
    return true;
  }
  columnFilterNoFilterColumns = (column: any) => {
    return column?.filter !== false;
  };
}
