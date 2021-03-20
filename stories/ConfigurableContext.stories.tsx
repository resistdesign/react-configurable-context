import React, { FC } from 'react';
import { Meta, Story } from '@storybook/react';
import { createConfigurableContext, createSetting, useSetting } from '../src';

const ConfigurableContext = createConfigurableContext('MyConfigurableContext');
const BackgroundColor = createSetting(ConfigurableContext, 'BackgroundColor');
const Size = createSetting(ConfigurableContext, 'Size');
const BoxWithUseSetting: FC = ({}) => {
  const backgroundColor = useSetting(BackgroundColor);
  const size = useSetting(Size);

  return (
    <div
      style={{
        backgroundColor,
        width: `${size}em`,
        height: `${size}em`,
      }}
    >
      &nbsp;
    </div>
  );
};

const meta: Meta = {
  title: 'ConfigurableContext',
  component: ConfigurableContext,
  argTypes: {
    backgroundColor: {
      name: 'Background Color',
      control: {
        type: 'color',
      },
    },
    size: {
      name: 'Size',
      control: {
        type: 'number',
      },
    },
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

const Template: Story<{ backgroundColor: string; size: number }> = ({ backgroundColor, size }) => (
  <ConfigurableContext>
    <BackgroundColor>{backgroundColor}</BackgroundColor>
    <Size>{size}</Size>
    <BoxWithUseSetting />
  </ConfigurableContext>
);

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});

Default.args = {
  backgroundColor: '#ba1eb7',
  size: 5,
};
