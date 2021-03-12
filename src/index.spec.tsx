import React, { FC } from 'react';
import { render } from '@testing-library/react';
import { createConfigurableContext, createSetting, useSetting } from './index';

const MOCK_SETTING_VALUE = {};
const Config = createConfigurableContext();
const Setting = createSetting(Config);

describe('useSetting', () => {
  it('should access the value of a setting', () => {
    let readSettingValue = undefined;

    const MockComponent: FC = () => {
      readSettingValue = useSetting(Setting);

      return <div>OK!</div>;
    };

    render(
      <Config>
        <Setting>{MOCK_SETTING_VALUE}</Setting>
        <MockComponent />
      </Config>
    );

    expect(readSettingValue).toStrictEqual(MOCK_SETTING_VALUE);
  });
});
