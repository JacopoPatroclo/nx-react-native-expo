import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';

const babelLoaderRules = {
  test: /\.tsx?$/,
  loader: 'babel-loader',
  options: {
    presets: ['babel-preset-expo'],
  },
};

export const WebpackConfigNxExpo = (prevConfig) => {
  const oldPlugins = prevConfig?.resolve?.plugins || [];
  const oldRules = prevConfig?.module?.rules || [];

  prevConfig.resolve = {
    ...prevConfig.resolve,
    plugins: [...oldPlugins, new TsconfigPathsPlugin()],
  };

  prevConfig.module.rules = [...oldRules, babelLoaderRules];

  return prevConfig;
};
