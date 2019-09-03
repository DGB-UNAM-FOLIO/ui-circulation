import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { noop } from 'lodash';

import { Checkbox } from '@folio/stripes/components';

import css from './TokensSection.css';

class TokensSection extends Component {
  static propTypes = {
    section: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    header: PropTypes.node,
    tokens: PropTypes.arrayOf(PropTypes.string),
    loopConfig: PropTypes.shape({
      enabled: PropTypes.bool,
      label: PropTypes.node,
      tag: PropTypes.string,
    }),
    onTokenSelect: PropTypes.func,
    onLoopSelect: PropTypes.func,
    onSectionInit: PropTypes.func,
  };

  static defaultProps = {
    disabled: false,
    header: null,
    tokens: [],
    loopConfig: {
      enabled: false,
      label: null,
      tag: null,
    },
    onTokenSelect: noop,
    onLoopSelect: noop,
    onSectionInit: noop,
  };

  componentDidMount() {
    const {
      loopConfig: { tag },
      section,
      onSectionInit,
    } = this.props;

    onSectionInit(section, tag);
  }

  onTokenChange = ({ target: { checked, value } }) => {
    const {
      section,
      onTokenSelect,
    } = this.props;

    onTokenSelect(value, checked, section);
  };

  onLoopChange = ({ target: { checked } }) => {
    const {
      section,
      onLoopSelect,
    } = this.props;

    onLoopSelect(section, checked);
  };

  render() {
    const {
      disabled,
      header,
      tokens,
      loopConfig: {
        enabled,
        label,
        tag,
      }
    } = this.props;

    return (
      <Fragment>
        <div className={css.categoryHeader}>
          {header}
        </div>
        <ul
          data-test-available-tokens
          className={css.tokensList}
        >
          {tokens.map((token) => {
            return (
              <li key={token}>
                <Checkbox
                  value={token}
                  label={token}
                  disabled={disabled}
                  onChange={this.onTokenChange}
                />
              </li>
            );
          })}
          { enabled && (
            <Fragment>
              <hr />
              <Checkbox
                value={tag}
                label={<strong>{label}</strong>}
                disabled={disabled}
                onChange={this.onLoopChange}
              />
            </Fragment>
          )}
        </ul>
      </Fragment>
    );
  }
}

export default TokensSection;
