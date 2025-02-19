import {
  clickable,
  interactor,
  scoped,
  Interactor,
} from '@bigtest/interactor';

import TextFieldInteractor from '@folio/stripes-components/lib/TextField/tests/interactor';
import SelectInteractor from '@folio/stripes-components/lib/Select/tests/interactor';
import { AccordionInteractor } from '@folio/stripes-components/lib/Accordion/tests/interactor';

@interactor class AboutSection {
  static defaultScope = ('[data-test-fine-policy-form-about-section]');

  header = scoped('[data-test-about-section-header]');
  policyName = new TextFieldInteractor('[data-test-about-section-policy-name]');
  policyDescription = new TextFieldInteractor('[data-test-about-section-policy-description]');
  policyNameValue = scoped('#input-policy-name');
}

@interactor class OverdueDurationSection {
  quantity = new TextFieldInteractor('#data-test-quantity-overdue-fine-quantity')
  interval = new SelectInteractor('[data-test-quantity-interval]');
}

@interactor class OverdueRecallSection {
  quantity = new TextFieldInteractor('#data-test-quantity-overdue-recall-fine-quantity')
  interval = new SelectInteractor('[data-test-quantity-interval]');
}
@interactor class OverdueFineSection {
  static defaultScope = ('[data-test-fine-policy-form-overdue-fines-section]');

  header = scoped('[data-test-overdue-fines-section-header]');
  overdue = new OverdueDurationSection();
  overdueRecall = new OverdueRecallSection('[data-test-fine-section-overdue]');
  countClosed = new SelectInteractor('[data-test-fine-section-count-closed]');
  maxOverdue = new TextFieldInteractor('[data-test-fine-section-max-overdue]')
  forgiveOverdue = new SelectInteractor('[data-test-fine-section-forgive-overdue]');
  overdueRecall = new OverdueDurationSection('[data-test-fine-section-overdue-recall]');
  gracePeriodRecall = new SelectInteractor('[data-test-fine-section-grace-period-recall]');
  maxOverdueRecall = new TextFieldInteractor('[data-test-fine-section-max-overdue-recall]')
}

@interactor class FinePolicyForm {
  static defaultScope = ('[data-test-fine-policy-form]');

  whenLoaded(policyName) {
    return this.when(() => this.aboutSection.scoped('#input-policy-name').value === policyName);
  }

  aboutSection = new AboutSection();
  overdueFineSection = new OverdueFineSection();

  overdueAccordion = new AccordionInteractor('#fineSection');
  deleteFinePolicy = new Interactor('[data-test-delete-loan-policy-form-action]');
  deleteFinePolicyModal = new Interactor('#delete-item-confirmation');
  deleteFinePolicyCancel= new Interactor('[data-test-confirmation-modal-cancel-button]');
  deleteFinePolicyConfirm = new Interactor('[data-test-confirmation-modal-confirm-button]');
  expandAll = scoped('[data-test-expand-all] button');
  cancelEditingFinePolicy = new Interactor('[data-test-cancel-loan-policy-form-action]');
  cancelEditingFinePolicyModal = new Interactor('#cancel-editing-confirmation');

  save = clickable('#clickable-save-entry');
}

export default new FinePolicyForm();
