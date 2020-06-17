/**
 * DateTimeRangeInput wraps DateRangePicker from React-dates and gives a list of all default props we use.
 * Styles for DateRangePicker can be found from 'public/reactDates.css'.
 *
 * N.B. *isOutsideRange* in defaultProps is defining what dates are available to booking.
 */
import React, { useState, useEffect, useRef } from 'react';
import { bool, func, instanceOf, oneOf, shape, string, arrayOf } from 'prop-types';
import { SingleDatePicker, isInclusivelyAfterDay, isInclusivelyBeforeDay } from 'react-dates';
import { intlShape, injectIntl } from '../../util/reactIntl';
import classNames from 'classnames';
import moment from 'moment';
import { START_DATE, END_DATE } from '../../util/dates';
import { LINE_ITEM_DAY, propTypes } from '../../util/types';
import config from '../../config';
import {
  isDayBlockedFn,
  isOutsideRangeFn,
  isBlockedBetween,
  apiEndDateToPickerDate,
  pickerEndDateToApiDate,
} from './DateRangeInput.helpers';
import TimeSelect from './TimeSelect';

import { IconArrowHead } from '../../components';
import css from './DateTimeRangeInput.css';

export const HORIZONTAL_ORIENTATION = 'horizontal';
export const ANCHOR_LEFT = 'left';
export const timeFormat = 'hh:mm a';

// Since final-form tracks the onBlur event for marking the field as
// touched (which triggers possible error validation rendering), only
// trigger the event asynchronously when no other input within this
// component has received focus.
//
// This prevents showing the validation error when the user selects a
// value and moves on to another input within this component.
const BLUR_TIMEOUT = 100;

// IconArrowHead component might not be defined if exposed directly to the file.
// This component is called before IconArrowHead component in components/index.js
const PrevIcon = props => (
  <IconArrowHead {...props} direction="left" rootClassName={css.arrowIcon} />
);
const NextIcon = props => (
  <IconArrowHead {...props} direction="right" rootClassName={css.arrowIcon} />
);

// Possible configuration options of React-dates
const defaultProps = {
  initialDates: null, // Possible initial date passed for the component
  value: null, // Value should keep track of selected date.

  // input related props
  startDateId: 'startDate',
  endDateId: 'endDate',
  startDatePlaceholderText: null, // Handled inside component
  endDatePlaceholderText: null, // Handled inside component
  disabled: false,
  required: false,
  readOnly: false,
  screenReaderInputMessage: null, // Handled inside component
  showClearDates: false,
  showDefaultInputIcon: false,
  customArrowIcon: <span />,
  customInputIcon: null,
  customCloseIcon: null,
  noBorder: true,
  block: false,

  // calendar presentation and interaction related props
  renderMonthText: null,
  orientation: HORIZONTAL_ORIENTATION,
  anchorDirection: ANCHOR_LEFT,
  horizontalMargin: 0,
  withPortal: false,
  withFullScreenPortal: false,
  appendToBody: false,
  disableScroll: false,
  daySize: 38,
  isRTL: false,
  initialVisibleMonth: null,
  firstDayOfWeek: config.i18n.firstDayOfWeek,
  numberOfMonths: 1,
  keepOpenOnDateSelect: false,
  reopenPickerOnClearDates: false,
  renderCalendarInfo: null,
  hideKeyboardShortcutsPanel: true,

  // navigation related props
  navPrev: <PrevIcon />,
  navNext: <NextIcon />,
  onPrevMonthClick() {},
  onNextMonthClick() {},
  transitionDuration: 200, // milliseconds between next month changes etc.

  renderCalendarDay: undefined, // If undefined, renders react-dates/lib/components/CalendarDay
  // day presentation and interaction related props
  renderDayContents: day => {
    return <span className="renderedDay">{day.format('D')}</span>;
  },
  minimumNights: 1,
  enableOutsideDays: false,
  isDayBlocked: () => false,

  // outside range -><- today ... today+available days -1 -><- outside range
  isOutsideRange: day => {
    const endOfRange = config.dayCountAvailableForBooking - 1;
    return (
      !isInclusivelyAfterDay(day, moment()) ||
      !isInclusivelyBeforeDay(day, moment().add(endOfRange, 'days'))
    );
  },
  isDayHighlighted: () => {},

  // Internationalization props
  // Multilocale support can be achieved with displayFormat like moment.localeData.longDateFormat('L')
  // https://momentjs.com/
  displayFormat: 'ddd, MMM D',
  monthFormat: 'MMMM YYYY',
  weekDayFormat: 'dd',
  phrases: {
    closeDatePicker: null, // Handled inside component
    clearDate: null, // Handled inside component
  },
};

const DateTimeRangeInputComponent = props => {
  const {
    intl,
    className,
    useMobileMargins,
    endDateId,
    startDateId,
    startDatePlaceholderText,
    endDatePlaceholderText,
    onChange,
    onFocus,
    onBlur,
    focusedInput: originFocusedInput,
    startDateLabel,
    endDateLabel,
    initialDates,
    value,
    unitType,
    timeSlots,
    ...datePickerProps
  } = props;

  const [focusedInput, setFocusedInput] = useState(null);
  // const blurTimeoutId = useRef();

  // useEffect(() => {
  //   setFocusedInput(originFocusedInput);
  //   return () => {
  //     window.clearTimeout(blurTimeoutId.current);
  //   };
  // }, [originFocusedInput]);

  useEffect(() => {
    if (originFocusedInput) {
      setFocusedInput(originFocusedInput);
    }
  }, [originFocusedInput]);

  const onDateChange = type => date => {
    let clearEndDate =
      date &&
      type === START_DATE &&
      value &&
      value.endDate &&
      (!date.isBefore(moment(value.endDate)) ||
        isBlockedBetween(timeSlots, date, moment(value.endDate)))
        ? { [END_DATE]: null }
        : {};

    onChange({ ...value, [type]: date ? date.toDate() : null, ...clearEndDate });
  };

  const onFocusChange = type => ({ focused }) => {
    setFocusedInput(focused ? type : null);

    // if (focusedInputChange && focused) {
    //   window.clearTimeout(blurTimeoutId.current);
    //   onFocus(type);
    // } else {
    //   window.clearTimeout(blurTimeoutId.current);
    //   onBlur();
    // }
    if (!focused) {
      onBlur();
    } else {
      onFocus(type);
    }
  };

  const classes = classNames(css.inputRoot, className, {
    [css.mobileMargin]: useMobileMargins,
  });

  const startDatePlaceholderTxt =
    startDatePlaceholderText ||
    intl.formatMessage({ id: 'FieldDateRangeInput.startDatePlaceholderText' });
  const endDatePlaceholderTxt =
    endDatePlaceholderText ||
    intl.formatMessage({ id: 'FieldDateRangeInput.endDatePlaceholderText' });

  const initialStartMoment = initialDates ? moment(initialDates.startDate) : null;
  const initialEndMoment = initialDates ? moment(initialDates.endDate) : null;
  const startDate =
    value && value.startDate instanceof Date ? moment(value.startDate) : initialStartMoment;
  const endDate =
    apiEndDateToPickerDate(unitType, value ? value.endDate : null) || initialEndMoment;

  const isDayBlocked = isDayBlockedFn(timeSlots, startDate, endDate, focusedInput, unitType);
  const isOutsideRange = isOutsideRangeFn(timeSlots, startDate, endDate, focusedInput, unitType);

  return (
    <div className={classes}>
      <label htmlFor={startDateId}>{startDateLabel}</label>
      <div className={css.dateTimeInputWrapper}>
        <SingleDatePicker
          {...datePickerProps}
          date={startDate}
          numberOfMonths={1}
          id={startDateId}
          placeholder={startDatePlaceholderTxt}
          onFocusChange={onFocusChange(START_DATE)}
          onDateChange={onDateChange(START_DATE)}
          focused={focusedInput === START_DATE}
          isDayBlocked={isDayBlocked}
          isOutsideRange={isOutsideRange}
        />
        <TimeSelect
          onChange={time => {
            console.log(time);
          }}
        />
      </div>
      <label htmlFor={endDateLabel}>{endDateLabel}</label>
      <div className={css.dateTimeInputWrapper}>
        <SingleDatePicker
          {...datePickerProps}
          date={endDate}
          numberOfMonths={1}
          id={endDateId}
          placeholder={endDatePlaceholderTxt}
          onFocusChange={onFocusChange(END_DATE)}
          onDateChange={onDateChange(END_DATE)}
          focused={focusedInput === END_DATE}
          isDayBlocked={day => {
            return (
              (value && value.startDate && day.diff(moment(value.startDate)) <= 0) ||
              isDayBlocked(day)
            );
          }}
          isOutsideRange={isOutsideRange}
        />
        <TimeSelect
          onChange={time => {
            console.log(time);
          }}
        />
      </div>
    </div>
  );
};

DateTimeRangeInputComponent.defaultProps = {
  className: null,
  useMobileMargins: false,
  timeSlots: null,
  ...defaultProps,
};

DateTimeRangeInputComponent.propTypes = {
  className: string,
  startDateId: string,
  endDateId: string,
  unitType: propTypes.bookingUnitType.isRequired,
  focusedInput: oneOf([START_DATE, END_DATE]),
  initialDates: instanceOf(Date),
  intl: intlShape.isRequired,
  name: string.isRequired,
  isOutsideRange: func,
  onChange: func.isRequired,
  onBlur: func.isRequired,
  onFocus: func.isRequired,
  phrases: shape({
    closeDatePicker: string,
    clearDate: string,
  }),
  useMobileMargins: bool,
  startDatePlaceholderText: string,
  endDatePlaceholderText: string,
  screenReaderInputMessage: string,
  value: shape({
    startDate: instanceOf(Date),
    endDate: instanceOf(Date),
  }),
  timeSlots: arrayOf(propTypes.timeSlot),
  startDateLabel: string,
  endDateLabel: string,
};

export default injectIntl(DateTimeRangeInputComponent);
