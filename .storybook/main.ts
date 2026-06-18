import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  addons: ['@chromatic-com/storybook', {
    name: '../dist/preset.cjs',
    options: { addonMetadata: { debug: true, generateTree: false } },
  }, '@storybook/addon-docs'],
  core: {
    disableTelemetry: true,
  },
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
};
export default config;
