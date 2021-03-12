import React, { FC, Fragment, useMemo } from 'react';
import { Meta, Story } from '@storybook/react';
import { createConfigurableContext, createSetting, SettingComponent, useSetting } from '../src';

const ConfigurableContext = createConfigurableContext();
const SettingComp: FC<{ name: string; setting: SettingComponent<any> }> = ({ name = '', setting }) => {
  const value = useSetting(setting);

  return (
    <div>
      The value for "{name}" is "{value}".
    </div>
  );
};

type ConfigurableContextStoriesProps = { settingNames: string[]; settingValues: string[] };

const ConfigurableContextStory: FC<ConfigurableContextStoriesProps> = ({ settingNames = [], settingValues = [] }) => {
  const settings = useMemo(() => settingNames.map(() => createSetting(ConfigurableContext)), [settingNames]);

  return (
    <ConfigurableContext>
      {settings.map((CurrentSetting, index) => (
        <Fragment key={`SettingSet:${index}`}>
          <CurrentSetting>{settingValues[index]}</CurrentSetting>
          <SettingComp name={settingNames[index]} setting={CurrentSetting} />
        </Fragment>
      ))}
    </ConfigurableContext>
  );
};

const meta: Meta = {
  title: 'ConfigurableContext',
  component: ConfigurableContextStory,
  argTypes: {
    settingNames: {
      name: 'Setting Names',
      control: {
        type: 'array',
      },
    },
    settingValues: {
      name: 'Setting Values',
      control: {
        type: 'array',
      },
    },
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

const Template: Story<ConfigurableContextStoriesProps> = (args) => <ConfigurableContextStory {...args} />;

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});

Default.args = {
  settingNames: ['One', 'Two', 'Three'],
  settingValues: ['uno', 'dos', 'tres'],
};
