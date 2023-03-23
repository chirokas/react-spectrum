/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {AriaDateFieldProps, AriaTimeFieldProps, DateValue, TimeValue, useDateField, useDateSegment, useLocale, useTimeField} from 'react-aria';
import {ContextValue, forwardRefType, Provider, RenderProps, SlotProps, StyleProps, useContextProps, useRenderProps, useSlot} from './utils';
import {createCalendar} from '@internationalized/date';
import {DateFieldState, DateSegmentType, DateSegment as IDateSegment, useDateFieldState, useTimeFieldState} from 'react-stately';
import {filterDOMProps, useObjectRef} from '@react-aria/utils';
import {LabelContext} from './Label';
import React, {cloneElement, createContext, ForwardedRef, forwardRef, HTMLAttributes, ReactElement, useContext, useRef} from 'react';
import {TextContext} from './Text';

export interface DateFieldProps<T extends DateValue> extends Omit<AriaDateFieldProps<T>, 'label' | 'description' | 'errorMessage'>, RenderProps<DateFieldState>, SlotProps {}
export interface TimeFieldProps<T extends TimeValue> extends Omit<AriaTimeFieldProps<T>, 'label' | 'description' | 'errorMessage'>, RenderProps<DateFieldState>, SlotProps {}

interface DateInputContextValue extends SlotProps {
  state: DateFieldState,
  fieldProps: HTMLAttributes<HTMLElement>
}

export const DateFieldContext = createContext<ContextValue<DateFieldProps<any>, HTMLDivElement>>(null);
export const TimeFieldContext = createContext<ContextValue<TimeFieldProps<any>, HTMLDivElement>>(null);
export const DateInputContext = createContext<ContextValue<DateInputContextValue, HTMLDivElement>>(null);

function DateField<T extends DateValue>(props: DateFieldProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, DateFieldContext);
  let {locale} = useLocale();
  let state = useDateFieldState({
    ...props,
    locale,
    createCalendar
  });

  let fieldRef = useRef<HTMLDivElement>(null);
  let [labelRef, label] = useSlot();
  let {labelProps, fieldProps, descriptionProps, errorMessageProps} = useDateField({...props, label}, state, fieldRef);

  let renderProps = useRenderProps({
    ...props,
    values: state,
    defaultClassName: 'react-aria-DateField'
  });

  return (
    <Provider
      values={[
        [DateInputContext, {state, fieldProps, ref: fieldRef}],
        [LabelContext, {...labelProps, ref: labelRef}],
        [TextContext, {
          slots: {
            description: descriptionProps,
            errorMessage: errorMessageProps
          }
        }]
      ]}>
      <div {...renderProps} ref={ref} slot={props.slot}>
        {props.children}
      </div>
    </Provider>
  );
}

/**
 * A date field allows users to enter and edit date and time values using a keyboard.
 * Each part of a date value is displayed in an individually editable segment.
 */
const _DateField = (forwardRef as forwardRefType)(DateField);
export {_DateField as DateField};

function TimeField<T extends TimeValue>(props: TimeFieldProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, TimeFieldContext);
  let {locale} = useLocale();
  let state = useTimeFieldState({
    ...props,
    locale
  });

  let fieldRef = useRef<HTMLDivElement>(null);
  let [labelRef, label] = useSlot();
  let {labelProps, fieldProps, descriptionProps, errorMessageProps} = useTimeField({...props, label}, state, fieldRef);

  let renderProps = useRenderProps({
    ...props,
    values: state,
    defaultClassName: 'react-aria-TimeField'
  });

  return (
    <Provider
      values={[
        [DateInputContext, {state, fieldProps, ref: fieldRef}],
        [LabelContext, {...labelProps, ref: labelRef, elementType: 'span'}],
        [TextContext, {
          slots: {
            description: descriptionProps,
            errorMessage: errorMessageProps
          }
        }]
      ]}>
      <div {...renderProps} ref={ref} slot={props.slot}>
        {props.children}
      </div>
    </Provider>
  );
}

/**
 * A time field allows users to enter and edit time values using a keyboard.
 * Each part of a time value is displayed in an individually editable segment.
 */
const _TimeField = (forwardRef as forwardRefType)(TimeField);
export {_TimeField as TimeField};

const InternalDateInputContext = createContext<DateFieldState| null>(null);

export interface DateInputProps extends SlotProps, StyleProps {
  children: (segment: IDateSegment) => ReactElement
}

function DateInput({children, style, className, slot, ...otherProps}: DateInputProps, ref: ForwardedRef<HTMLDivElement>) {
  let [{state, fieldProps}, fieldRef] = useContextProps({slot} as DateInputProps & DateInputContextValue, ref, DateInputContext);
  return (
    <InternalDateInputContext.Provider value={state}>
      <div
        {...filterDOMProps(otherProps)}
        {...fieldProps}
        ref={fieldRef}
        slot={slot}
        style={style}
        className={className ?? 'react-aria-DateInput'}>
        {state.segments.map((segment, i) => cloneElement(children(segment), {key: i}))}
      </div>
    </InternalDateInputContext.Provider>
  );
}

/**
 * A date input groups the editable date segments within a date field.
 */
const _DateInput = forwardRef(DateInput);
export {_DateInput as DateInput};

export interface DateSegmentRenderProps extends Omit<IDateSegment, 'isEditable'> {
  /**
   * Whether the value is a placeholder.
   * @selector [data-placeholder]
   */
  isPlaceholder: boolean,
  /**
   * Whether the segment is read only.
   * @selector [aria-readonly]
   */
  isReadOnly: boolean,
  /**
   * Whether the date field is in an invalid state.
   * @selector [aria-invalid]
   */
  isInvalid: boolean,
  /**
   * The type of segment. Values include `literal`, `year`, `month`, `day`, etc.
   * @selector [data-type="..."]
   */
  type: DateSegmentType
}

export interface DateSegmentProps extends RenderProps<DateSegmentRenderProps> {
  segment: IDateSegment
}

function DateSegment({segment, ...otherProps}: DateSegmentProps, ref: ForwardedRef<HTMLDivElement>) {
  let state = useContext(InternalDateInputContext)!;
  let domRef = useObjectRef(ref);
  let {segmentProps} = useDateSegment(segment, state, domRef);
  let renderProps = useRenderProps({
    ...otherProps,
    values: {
      ...segment,
      isReadOnly: !segment.isEditable,
      isInvalid: state.validationState === 'invalid'
    },
    defaultChildren: segment.text,
    defaultClassName: 'react-aria-DateSegment'
  });

  return (
    <div
      {...segmentProps}
      {...renderProps}
      ref={domRef}
      data-type={segment.type} />
  );
}

/**
 * A date segment displays an individual unit of a date and time, and allows users to edit
 * the value by typing or using the arrow keys to increment and decrement.
 */
const _DateSegment = forwardRef(DateSegment);
export {_DateSegment as DateSegment};