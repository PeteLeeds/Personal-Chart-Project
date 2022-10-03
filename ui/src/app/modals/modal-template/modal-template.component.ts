import { Component, Directive, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalConfig } from '../modal.config';

@Component({
  selector: 'custom-modal',
  templateUrl: './modal-template.component.html',
  styleUrls: ['./modal-template.component.scss']
})
export class ModalTemplateComponent implements OnInit {
  @Input() public modalConfig: ModalConfig
  @ViewChild('modal') private modalContent: TemplateRef<ModalTemplateComponent>

  private modalRef: NgbModalRef;

  public modalService: NgbModal;

  constructor(modalService: NgbModal) {
    this.modalService = modalService
  }

  ngOnInit(): void {
  }

  open(): Promise<unknown> {
    return new Promise<boolean>(resolve => {
      this.modalRef = this.modalService.open(this.modalContent)
      // Resolve, resolve? Seems weird.
      this.modalRef.result.then((data) => {
        resolve(data);
      });
    })
  }

  async dismiss() {
    if (this.modalConfig.shouldDismiss === undefined || await this.modalConfig.shouldDismiss()) {
      if (this.modalConfig.onDismiss) {
        await this.modalConfig.onDismiss()
      }
      this.modalRef.dismiss()
    }
  }

  async close() {
    let returnVal: unknown;
    if (this.modalConfig.shouldClose === undefined || await this.modalConfig.shouldClose()) {
      if (this.modalConfig.onClose) {
        // Didn't think we were supposed to use promises in the UI? Time to think.
        returnVal = await this.modalConfig.onClose();
      }
      console.log("Closing with", returnVal)
      // Next step is to get this back into the main component
      this.modalRef.close(returnVal)
    }
  }

}

