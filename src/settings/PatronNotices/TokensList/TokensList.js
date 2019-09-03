import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';
import { FormattedMessage } from 'react-intl';

import {
  Col,
  Row,
} from '@folio/stripes/components';

import { TokensSection } from '../../components';
import { patronNoticeCategoryIds } from '../../../constants';

class TokensList extends React.Component {
  static propTypes = {
    selectedCategory: PropTypes.string.isRequired,
    tokens: PropTypes.object.isRequired,
    onTokenSelect: PropTypes.func.isRequired,
    onLoopSelect: PropTypes.func.isRequired,
    onSectionInit: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.loansLoopConfig = {
      enabled: true,
      label: <FormattedMessage id="ui-circulation.settings.patronNotices.multipleLoans" />,
      tag: 'loans',
    };

    this.requestsLoopConfig = {
      enabled: true,
      label: <FormattedMessage id="ui-circulation.settings.patronNotices.multipleLoans" />,
      tag: 'requests',
    };
  }

  disableSection = (allowedCategories = []) => {
    const { selectedCategory } = this.props;

    return !allowedCategories.includes(selectedCategory);
  };

  render() {
    const {
      tokens,
      onLoopSelect,
      onSectionInit,
      onTokenSelect,
    } = this.props;

    return (
      <Row>
        <Col xs={4}>
          <TokensSection
            section="item"
            header={<FormattedMessage id="ui-circulation.settings.patronNotices.itemTokenHeader" />}
            tokens={Object.keys(tokens.item)}
            onLoopSelect={onLoopSelect}
            onSectionInit={onSectionInit}
            onTokenSelect={onTokenSelect}
          />
        </Col>
        <Col xs={4}>
          <Row>
            <Col xs={12}>
              <TokensSection
                section="loan"
                disabled={this.disableSection([patronNoticeCategoryIds.LOAN, patronNoticeCategoryIds.REQUEST])}
                header={<FormattedMessage id="ui-circulation.settings.patronNotices.loanTokenHeader" />}
                tokens={Object.keys(tokens.loan)}
                loopConfig={this.loansLoopConfig}
                onLoopSelect={onLoopSelect}
                onSectionInit={onSectionInit}
                onTokenSelect={onTokenSelect}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <TokensSection
                section="effectiveLocation"
                header={<FormattedMessage id="ui-circulation.settings.patronNotices.effectiveLocationTokenHeader" />}
                tokens={Object.keys(tokens.effectiveLocation)}
                onLoopSelect={onLoopSelect}
                onSectionInit={onSectionInit}
                onTokenSelect={onTokenSelect}
              />
            </Col>
          </Row>
        </Col>
        <Col xs={4}>
          <Row>
            <Col xs={12}>
              <TokensSection
                section="request"
                disabled={this.disableSection([patronNoticeCategoryIds.REQUEST])}
                header={<FormattedMessage id="ui-circulation.settings.patronNotices.requestTokenHeader" />}
                tokens={Object.keys(tokens.request)}
                loopConfig={this.requestsLoopConfig}
                onLoopSelect={onLoopSelect}
                onSectionInit={onSectionInit}
                onTokenSelect={onTokenSelect}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <TokensSection
                section="user"
                header={<FormattedMessage id="ui-circulation.settings.patronNotices.userTokenHeader" />}
                tokens={Object.keys(tokens.user)}
                onLoopSelect={onLoopSelect}
                onSectionInit={onSectionInit}
                onTokenSelect={onTokenSelect}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

const mapStateToProps = (state) => {
  const patronNotice = getFormValues('patronNoticeForm')(state);

  return { selectedCategory: patronNotice.category };
};

export default connect(mapStateToProps)(TokensList);
