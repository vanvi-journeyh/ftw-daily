import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape, injectIntl } from '../../util/reactIntl';
import classNames from 'classnames';
import { Modal } from '../../components';
import { PrimaryButton } from '../../components';

import css from './AskModal.css';

const AskModal = props => {
  const {
    className,
    rootClassName,
    id,
    isOpen,
    onCloseModal,
    onManageDisableScrolling,
    onOkay,
  } = props;

  const classes = classNames(rootClassName || css.root, className);

  return (
    <Modal
      id={id}
      containerClassName={classes}
      contentClassName={css.modalContent}
      isOpen={isOpen}
      onClose={onCloseModal}
      onManageDisableScrolling={onManageDisableScrolling}
      usePortal
    >
      <p className={css.modalTitle}>
        <FormattedMessage id="AskModal.title" />
      </p>
      <p className={css.modalMessage}>
        <FormattedMessage id="AskModal.description" />
      </p>
      <PrimaryButton className={css.modalButton} onClick={onOkay}>
        <FormattedMessage id="AskModal.okay" />
      </PrimaryButton>
    </Modal>
  );
};

const { bool, string, func } = PropTypes;

AskModal.defaultProps = {
  className: null,
  rootClassName: null,
};

AskModal.propTypes = {
  className: string,
  rootClassName: string,
  intl: intlShape.isRequired,
  id: string,
  isOpen: bool,
  onCloseModal: func,
  onManageDisableScrolling: func,
  onOkay: func,
};

export default injectIntl(AskModal);
