/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import Checkmark_L from 'illustration:./S2_fill_checkmark_generic1_160.svg';
import Checkmark_M from 'illustration:./S2_fill_checkmark_generic1_96.svg';
import Checkmark_S from 'illustration:./S2_fill_checkmark_generic1_48.svg';
import {ReactNode} from 'react';
import {IconProps, IllustrationContext} from '../../../src/Icon';
import {useContextProps} from 'react-aria-components';

export default function Checkmark(props: IconProps & {size?: 'L' | 'S' | 'M'}): ReactNode {
  [props] = useContextProps(props, null, IllustrationContext);
  let {size = 'M', ...otherProps} = props;
  switch (size) {
    case 'L':
      return <Checkmark_L {...otherProps} />;
    case 'S':
      return <Checkmark_S {...otherProps} />;
    case 'M':
      return <Checkmark_M {...otherProps} />;
  }
}
