# React Native Expo Plugin for Nx

<p align="center"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-react.png" width="600"></p>

<div align="center">

[![License](https://img.shields.io/npm/l/@nrwl/workspace.svg?style=flat-square)]()
[![NPM Version](https://badge.fury.io/js/%40nrwl%2Freact-native.svg)](https://www.npmjs.com/nx-react-native-expo)
[![Join the chat at https://gitter.im/nrwl-nx/community](https://badges.gitter.im/nrwl-nx/community.svg)](https://gitter.im/nrwl-nx/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Join us @nrwl/community on slack](https://img.shields.io/badge/slack-%40nrwl%2Fcommunity-brightgreen)](https://join.slack.com/t/nrwlcommunity/shared_invite/enQtNzU5MTE4OTQwOTk0LTgxY2E0ZWYzMWE0YzA5ZDA2MWM1NDVhNmI2ZWMyYmZhNWJiODk3MjkxZjY3MzU5ZjRmM2NmNWU1OTgyZmE4Mzc)

</div>

## Getting started

### Create a new Nx workspace:

```
npx create-nx-workspace --cli=nx --preset=empty
```

### Install React Native Expo plugin

```
# Using npm
npm install --save-dev nx-react-native-expo

# Using yarn
yarn -D nx-react-native-expo
```

### Create an app

```
npx nx g nx-react-native-expo:app <app-name>
```

When using Nx, you can create multiple applications and themes in the same workspace. If you don't want to prefix your commands with npx, install `@nrwl/cli` globally.

### Start the bundler

```
npx nx start <app-name>
```

### Run on devices

Android:

```
npx nx run-android <app-name>
```

iOS:

```
npx nx run-ios <app-name>
```

Web:

```
npx nx run-web <app-name>
```

### Build the app

```
npx nx bundle <app-name>
npx nx bundle <app-name> --platform=ios
npx nx bundle <app-name> --platform=android
```

## Using components from React library

You can use a component from React library generated using Nx package for React. Once you run:

```
npx nx g nx-react-native-expo:lib ui-button
```

This will generate the `UiButton` component, which you can use in your app.

```jsx
import { UiButton } from '@myorg/ui-button';
```

## Learn more

Visit the [Nx Documentation](https://nx.dev) to learn more.
