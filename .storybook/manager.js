import { addons } from '@storybook/addons';
import StorybookTheme from './StorybookTheme';

addons.setConfig({
  isToolshown: false,
  theme: StorybookTheme,
});
