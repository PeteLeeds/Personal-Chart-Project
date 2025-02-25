import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalConfig } from '../modal.config';
import { NgIf } from '@angular/common';

@Component({
    selector: 'custom-modal',
    templateUrl: './modal-template.component.html',
    styleUrls: ['../../styles/common-styles.css', './modal-template.component.scss'],
    imports: [NgIf]
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

  async complete() {
    let returnVal: unknown;
    if (this.modalConfig.shouldClose === undefined || await this.modalConfig.shouldClose()) {
      if (this.modalConfig.onClose) {
        returnVal = await this.modalConfig.onClose();
      }
      console.log("Completing with", returnVal)
      this.modalRef.close(returnVal)
    }
  }

}

