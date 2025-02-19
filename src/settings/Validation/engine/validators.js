import React from 'react';
import { FormattedMessage } from 'react-intl';

import {
  isNotEmpty,
  isIntegerGreaterThanZero,
  isIntegerGreaterThanOrEqualToZero,
  isPositiveNumber,
  isInInterval,
  isNotEmptyEditor,
  isOverdueFindGreaterThan,
} from './handlers';

export default {
  isNotEmpty: {
    validate: isNotEmpty,
    message: <FormattedMessage id="ui-circulation.settings.validate.fillIn" />,
  },
  isNotEmptySelect: {
    validate: isNotEmpty,
    message: <FormattedMessage id="ui-circulation.settings.validate.select" />,
  },
  isIntegerGreaterThanZero: {
    validate: isIntegerGreaterThanZero,
    message: <FormattedMessage id="ui-circulation.settings.validate.greaterThanZero" />,
  },
  isIntegerGreaterThanOrEqualToZero: {
    validate: isIntegerGreaterThanOrEqualToZero,
    message: <FormattedMessage id="ui-circulation.settings.validate.greaterThanOrEqualToZero" />,
  },
  isPositiveNumber: {
    validate: isPositiveNumber,
    message: <FormattedMessage id="ui-circulation.settings.validate.isPositiveNumber" />,
  },
  isFromOneToHundred: {
    validate: isInInterval.bind(null, 1, 100),
    message: <FormattedMessage id="ui-circulation.settings.validate.isFromOneToHundred" />,
  },
  isNotEmptyEditor: {
    validate: isNotEmptyEditor,
    message: <FormattedMessage id="ui-circulation.settings.validate.fillIn" />,
  },
  isOverdueFindGreaterThan: {
    validate: isOverdueFindGreaterThan,
    message: <FormattedMessage id="ui-circulation.settings.validate.greaterThanZero" />,
  },
};
