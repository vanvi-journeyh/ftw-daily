import React from 'react';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm } from 'react-final-form';
import arrayMutators from 'final-form-arrays';

import { intlShape, injectIntl, FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import { propTypes } from '../../util/types';
import { maxLength, required, composeValidators } from '../../util/validators';
import { Form, Button, FieldTextInput, FieldCheckboxGroup } from '../../components';
import CustomGeneralSelectFieldMaybe from './CustomGeneralSelectFieldMaybe';
import config from '../../config';

import css from './EditListingDescriptionForm.css';

const TITLE_MAX_LENGTH = 60;

const EditListingGeneralForm = props => (
  <FinalForm
    {...props}
    mutators={{ ...arrayMutators }}
    render={formRenderProps => {
      const {
        className,
        disabled,
        ready,
        handleSubmit,
        intl,
        invalid,
        pristine,
        saveActionMsg,
        updated,
        updateInProgress,
        fetchErrors,
      } = formRenderProps;

      const titleMessage = intl.formatMessage({ id: 'EditListingGeneralForm.title' });
      const titlePlaceholderMessage = intl.formatMessage({
        id: 'EditListingGeneralForm.titlePlaceholder',
      });
      const titleRequiredMessage = intl.formatMessage({
        id: 'EditListingGeneralForm.titleRequired',
      });
      const maxLengthMessage = intl.formatMessage(
        { id: 'EditListingGeneralForm.maxLength' },
        {
          maxLength: TITLE_MAX_LENGTH,
        }
      );

      const descriptionMessage = intl.formatMessage({
        id: 'EditListingGeneralForm.bio',
      });
      const descriptionPlaceholderMessage = intl.formatMessage({
        id: 'EditListingGeneralForm.bioPlaceholder',
      });
      const maxLength60Message = maxLength(maxLengthMessage, TITLE_MAX_LENGTH);
      const descriptionRequiredMessage = intl.formatMessage({
        id: 'EditListingGeneralForm.bioRequired',
      });

      const { updateListingError, createListingDraftError, showListingsError } = fetchErrors || {};
      const errorMessageUpdateListing = updateListingError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingGeneralForm.updateFailed" />
        </p>
      ) : null;

      // This error happens only on first tab (of EditListingWizard)
      const errorMessageCreateListingDraft = createListingDraftError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingGeneralForm.createListingDraftError" />
        </p>
      ) : null;

      const errorMessageShowListing = showListingsError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingGeneralForm.showListingFailed" />
        </p>
      ) : null;

      const classes = classNames(css.root, className);
      const submitReady = (updated && pristine) || ready;
      const submitInProgress = updateInProgress;
      const submitDisabled = invalid || disabled || submitInProgress;

      return (
        <Form className={classes} onSubmit={handleSubmit}>
          {errorMessageCreateListingDraft}
          {errorMessageUpdateListing}
          {errorMessageShowListing}
          <FieldTextInput
            id="title"
            name="title"
            className={css.title}
            type="text"
            label={titleMessage}
            placeholder={titlePlaceholderMessage}
            maxLength={TITLE_MAX_LENGTH}
            validate={composeValidators(required(titleRequiredMessage), maxLength60Message)}
            autoFocus
          />

          <FieldTextInput
            id="description"
            name="description"
            className={css.description}
            type="textarea"
            label={descriptionMessage}
            placeholder={descriptionPlaceholderMessage}
            validate={composeValidators(required(descriptionRequiredMessage))}
          />

          <div style={{ marginBottom: 32 }}>
            <FieldCheckboxGroup
              id="subject"
              name="subject"
              label={intl.formatMessage({ id: 'EditListingGeneralForm.subjectLabel' })}
              options={config.custom.subject}
            />
          </div>

          <div style={{ marginBottom: 32 }}>
            <FieldCheckboxGroup
              id="level"
              name="level"
              label={intl.formatMessage({ id: 'EditListingGeneralForm.levelLabel' })}
              options={config.custom.level}
            />
          </div>

          <CustomGeneralSelectFieldMaybe
            id="teachingHour"
            name="teachingHour"
            categories={config.custom}
            intl={intl}
          />

          <Button
            className={css.submitButton}
            type="submit"
            inProgress={submitInProgress}
            disabled={submitDisabled}
            ready={submitReady}
          >
            {saveActionMsg}
          </Button>
        </Form>
      );
    }}
  />
);

EditListingGeneralForm.defaultProps = { className: null, fetchErrors: null };

EditListingGeneralForm.propTypes = {
  className: string,
  intl: intlShape.isRequired,
  onSubmit: func.isRequired,
  saveActionMsg: string.isRequired,
  disabled: bool.isRequired,
  ready: bool.isRequired,
  updated: bool.isRequired,
  updateInProgress: bool.isRequired,
  fetchErrors: shape({
    createListingDraftError: propTypes.error,
    showListingsError: propTypes.error,
    updateListingError: propTypes.error,
  }),
  categories: arrayOf(
    shape({
      key: string.isRequired,
      label: string.isRequired,
    })
  ),
};

export default compose(injectIntl)(EditListingGeneralForm);
