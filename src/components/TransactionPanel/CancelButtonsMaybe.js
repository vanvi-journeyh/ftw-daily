import React from 'react';
import PropTypes from 'prop-types';

import { FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import { SecondaryButton } from '../../components';
import { propTypes } from '../../util/types';

import css from './TransactionPanel.css';

const CancelButtonsMaybe = props => {
  const { className, rootClassName, showButton, cancelInProgress, cancelError, onCancel } = props;

  const classes = classNames(rootClassName || css.actionButtons, className);

  return showButton ? (
    <div className={classes}>
      <div className={css.actionErrors}>
        {cancelError && (
          <p className={css.actionError}>
            <FormattedMessage id="TransactionPanel.cancelFailed" />
          </p>
        )}
      </div>
      <div className={css.actionButtonWrapper}>
        <SecondaryButton
          inProgress={cancelInProgress}
          disabled={cancelInProgress}
          onClick={onCancel}
        >
          <FormattedMessage id="TransactionPanel.cancelButton" />
        </SecondaryButton>
      </div>
    </div>
  ) : null;
};

CancelButtonsMaybe.propTypes = {
  className: PropTypes.any,
  rootClassName: PropTypes.any,
  showButton: PropTypes.bool,
  cancelInProgress: PropTypes.bool,
  cancelError: propTypes.error,
  onCancel: PropTypes.func,
};

export default CancelButtonsMaybe;
