import {
  interactor,
  scoped,
  Interactor,
  clickable,
  collection,
  property
} from '@bigtest/interactor';

import TextFieldInteractor from '@folio/stripes-components/lib/TextField/tests/interactor';
import SelectInteractor from '@folio/stripes-components/lib/Select/tests/interactor';

@interactor class AvailableTokens {
  items = collection('input[type="checkbox"]');
}

@interactor class TokensModal {
  defaultScope = '[data-test-template-editor-tokens-modal]';

  addTokensBtn = scoped('[data-test-add-tokens]');
  cancelBtn = scoped('[data-test-close-tokens-modal]');
  availbaleTokens = collection('[data-test-available-tokens]', AvailableTokens);
  multipleTokens = scoped('[data-test-multiple-tokens]');

  isAddTokenBtnDisabled = property('[data-test-add-tokens]', 'disabled');
}

@interactor class PatronNoticeForm {
  static defaultScope = ('[data-test-patron-notice-form]');

  whenLoaded() {
    return this.when(() => this.templateName.isPresent);
  }

  expandAll = scoped('[data-test-expand-all] button');
  templateName = new TextFieldInteractor('[data-test-patron-notice-template-name]');
  deletePatronNoticeTemplate = new Interactor('[data-test-delete-patron-notice-form-action]');
  deletePatronNoticeTemplateModal = new Interactor('#delete-item-confirmation');
  cancelEditingPatronNoticeTemplate = new Interactor('[data-test-cancel-patron-notice-form-action]');
  cancelEditingPatronNoticeTempateModal = new Interactor('#cancel-editing-confirmation');
  prohibitDeletion = new Interactor('[data-test-entity-in-use-modal]');

  templateCategory = new SelectInteractor('[data-test-template-category]');
  templateBody = new Interactor('#template-editor');
  indentBtn = new Interactor('[data-test-increase-indent]');
  errorContainer = new Interactor('#patron-notice-error-container');
  save = clickable('#clickable-save-patron-notice');

  showAvailbaleTokensBtn = new Interactor('[data-test-teplate-editor-tokens]');
  tokensModal = new TokensModal();
}

export default new PatronNoticeForm();
