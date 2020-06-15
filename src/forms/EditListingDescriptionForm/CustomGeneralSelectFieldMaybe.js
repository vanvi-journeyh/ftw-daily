import React from 'react';
import { required } from '../../util/validators';
import { FieldSelect } from '../../components';

import css from './EditListingDescriptionForm.css';

const CustomCategorySelectFieldMaybe = props => {
  const { name, id, intl ,categories} = props;
  const categoryLabel = intl.formatMessage({
    id: `EditListingGeneralForm.${name}Label`,
  });
  const categoryPlaceholder = intl.formatMessage({
    id: `EditListingGeneralForm.${name}Placeholder`,
  });
  const categoryRequired = required(
    intl.formatMessage({
      id: `EditListingGeneralForm.${name}Required`,
    })
  );
  return categories[name] ? (
    <FieldSelect
      className={css.category}
      name={name}
      id={id}
      label={categoryLabel}
      validate={categoryRequired}
    >
      <option disabled value="">
        {categoryPlaceholder}
      </option>
      {categories[name].map(c => (
        <option key={c.key} value={c.key}>
          {c.label}
        </option>
      ))}
    </FieldSelect>
  ) : null;
};

export default CustomCategorySelectFieldMaybe;
