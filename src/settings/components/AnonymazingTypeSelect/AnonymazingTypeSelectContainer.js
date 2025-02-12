import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  injectIntl,
  intlShape,
  FormattedMessage,
} from 'react-intl';

import AnonymazingTypeSelect from './AnonymazingTypeSelect';
import { Period } from '..';
import optionsGenerator from '../../utils/options-generator';
import {
  closingTypesMap,
  intervalPeriods,
} from '../../../constants';

import css from './AnonymazingTypeSelectContainer.css';

const selectedPeriodsValues = [
  'Days',
  'Weeks',
  'Months',
];

class AnonymazingTypeSelectContainer extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    name: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    types: PropTypes.arrayOf(PropTypes.object).isRequired,
  }

  constructor(props) {
    super(props);

    this.generateOptions = optionsGenerator.bind(null, props.intl.formatMessage);
    this.selectedPeriods = intervalPeriods.filter(period => selectedPeriodsValues.includes(period.value));
  }

  renderPeriod(name, path) {
    return (
      <div
        data-test-period-section
        className={css.periodContainer}
      >
        <Period
          inputValuePath={`${path}.duration`}
          selectValuePath={`${path}.intervalId`}
          intervalPeriods={this.generateOptions(this.selectedPeriods, 'ui-circulation.settings.loanHistory.selectInterval')}
          inputSize={4}
          selectSize={7}
        />
        <FormattedMessage
          tagName="div"
          id="ui-circulation.settings.loanHistory.afterClose"
          values={{ name: <FormattedMessage id={`ui-circulation.settings.loanHistory.${name}`} /> }}
        />
      </div>
    );
  }

  getClosingTypes(name, path) {
    return this.props.types.map(type => {
      if (type.value !== closingTypesMap.INTERVAL) {
        return {
          ...type,
          label: (
            <FormattedMessage
              id={type.label}
              values={{ name: <FormattedMessage id={`ui-circulation.settings.loanHistory.${name}`} /> }}
            />
          )
        };
      }

      return {
        label: this.renderPeriod(name, path),
        value: closingTypesMap.INTERVAL,
      };
    });
  }

  render() {
    const {
      name,
      path,
    } = this.props;

    return (
      <AnonymazingTypeSelect
        name={path}
        types={this.getClosingTypes(name, path)}
      />
    );
  }
}

export default injectIntl(AnonymazingTypeSelectContainer);
