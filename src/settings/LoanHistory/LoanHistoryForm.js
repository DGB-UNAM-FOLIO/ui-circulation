import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  injectIntl,
  intlShape,
  FormattedMessage,
} from 'react-intl';
import {
  Field,
  FieldArray,
  getFormValues,
} from 'redux-form';

import stripesForm from '@folio/stripes/form';
import { stripesShape } from '@folio/stripes/core';
import {
  Button,
  Checkbox,
  Col,
  Pane,
  Row,
  Headline,
} from '@folio/stripes/components';

import AnonymazingTypeSelectContainer from '../components/AnonymazingTypeSelect/AnonymazingTypeSelectContainer';
import ExceptionsList from './ExceptionsList';
import optionsGenerator from '../utils/options-generator';
import {
  closingTypes,
  intervalPeriods,
  closedLoansRules,
} from '../../constants';

class LoanHistoryForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    initialValues: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    stripes: stripesShape.isRequired,
  };

  constructor(props) {
    super(props);

    // eslint-disable-next-line react/no-unused-state
    this.state = { checked: false };
    this.generateOptions = optionsGenerator.bind(null, props.intl.formatMessage);
    this.selectedPeriods = intervalPeriods.filter(period => props.initialValues.selectedPeriodsValues.includes(period.value));
  }

  onSave = data => this.props.onSubmit({ loan_history: JSON.stringify(data) });

  getLastMenu = () => {
    const {
      pristine,
      submitting,
    } = this.props;

    return (
      <Button
        data-test-loan-history-save-button
        type="submit"
        disabled={pristine || submitting}
        marginBottom0
      >
        <FormattedMessage id="stripes-core.button.save" />
      </Button>
    );
  }

  toggleCheckbox = () => {
    this.setState(({ checked }) => ({
      // eslint-disable-next-line react/no-unused-state
      checked: !checked
    }));
  }

  getCurrentValues() {
    const { store } = this.props.stripes;
    const state = store.getState();

    return getFormValues('loanHistoryForm')(state) || {};
  }

  render() {
    const {
      handleSubmit,
      label,
    } = this.props;

    const loanHistoryValues = this.getCurrentValues();

    return (
      <form
        id="loan-history-form"
        onSubmit={handleSubmit(this.onSave)}
      >
        <Pane
          defaultWidth="fill"
          fluidContentWidth
          paneTitle={label}
          lastMenu={this.getLastMenu()}
        >
          <div data-test-closed-loans>
            <Headline
              size="large"
              margin="xx-large"
              tag="h5"
            >
              <FormattedMessage id="ui-circulation.settings.loanHistory.closedLoans" />
            </Headline>
            <FormattedMessage
              tagName="p"
              id="ui-circulation.settings.loanHistory.anonymize"
            />
            <AnonymazingTypeSelectContainer
              name={closedLoansRules.DEFAULT}
              path={closedLoansRules.DEFAULT}
              types={closingTypes}
            />
          </div>
          <br />
          <Row>
            <Col xs={12}>
              <Field
                label={<FormattedMessage id="ui-circulation.settings.loanHistory.treat" />}
                id="treatEnabled-checkbox"
                name="treatEnabled"
                component={Checkbox}
                type="checkbox"
                onChange={this.toggleCheckbox}
                normalize={value => !!value}
              />
            </Col>
          </Row>
          <br />
          {loanHistoryValues.treatEnabled &&
            <div data-test-closed-loans-feefine>
              <Headline
                size="large"
                margin="xx-large"
                tag="h5"
              >
                <FormattedMessage id="ui-circulation.settings.loanHistory.closedLoansFeesFines" />
              </Headline>
              <FormattedMessage
                tagName="p"
                id="ui-circulation.settings.loanHistory.anonymizeFeesFines"
              />
              <AnonymazingTypeSelectContainer
                name={closedLoansRules.WITH_FEES_FINES}
                path={closedLoansRules.WITH_FEES_FINES}
                types={closingTypes}
              />
              <br />
              <FieldArray
                name="loanExceptions"
                component={ExceptionsList}
              />
            </div>
          }
        </Pane>
      </form>
    );
  }
}

export default injectIntl(
  stripesForm({
    form: 'loanHistoryForm',
    navigationCheck: true,
    enableReinitialize: true,
  })(LoanHistoryForm)
);
