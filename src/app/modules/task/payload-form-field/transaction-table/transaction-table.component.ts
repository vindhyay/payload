import { Component, Input } from "@angular/core";
import { BaseWidget } from "../../model/create-form.models";
import { parseApiResponse } from "../../../../utils";
import { BaseComponent } from "../../../shared/base/base.component";
import { NotificationService } from "../../../../services/notification.service";
import { EditorService } from "../../editor.service";

@Component({
  selector: "app-transaction-table",
  templateUrl: "./transaction-table.component.html",
  styleUrls: ["./transaction-table.component.scss"],
})
export class TransactionTableComponent extends BaseComponent {
  @Input() item: BaseWidget = {} as BaseWidget;
  @Input() isDisabled: boolean = false;
  tableData = [];
  totalRecords = 0;
  columns = [];
  constructor(private editorService: EditorService, private notificationService: NotificationService) {
    super();
  }
  get metaData(): any {
    return this.item.metaData;
  }

  getTransactionTableData(params: { applicationId: string; widgetId: string; pageNo: number; recordNo: number }) {
    this.editorService.getTransactionTableData(params).subscribe((result) => {
      const { data, error } = parseApiResponse(result);
      if (!error && data) {
        this.totalRecords = data.totalRecordCount;
        this.tableData = (data?.data || []).map((transaction) => {
          return {
            ...transaction,
            transactionStatusId: transaction?.transactionStatus?.id,
            transactionStatus: transaction?.transactionStatus?.name,
          };
        });
      } else {
        console.log("error occured while getting saved transactioon data");
      }
    });
  }
  onRowClick($event: any) {
    if ($event.id) {
      this.getTransactionDetails($event.id);
    } else {
      this.notificationService.error("Transaction not found");
    }
  }
  onPageChange($event: any) {
    const { page = 1, limit = 10 } = $event || {};
    const { applicationId } = this.editorService.getTransactionDetails();
    const { widgetId } = this.item;
    const params = { applicationId, widgetId, pageNo: page - 1, recordNo: limit };
    this.getTransactionTableData(params);
  }
  getTransactionDetails(id: string) {
    this.loading = true;
    this.editorService.fetchTransactionDetails(id).subscribe(
      (result) => {
        const { data: transactionDetails } = parseApiResponse(result);
        if (transactionDetails) {
          this.editorService.setTransactionDetails(transactionDetails);
        }
        this.loading = false;
      },
      (error) => {
        this.loading = false;
      }
    );
  }
}
