/**
 * @format
 */

import React from 'react';
import {AppRegistry} from 'react-native';

import {PrifinaProvider, PrifinaContext} from '@prifina/hooks-v2';

// import {default as App} from './App';

import ErrorBoundary from './ErrorBoundary';

import App from './App';
import {name as appName} from './app.json';

const prifinaID = '6145b3af07fa22f66456e20eca49e98bfe35';

const AppWrapper = () => (
  //   <React.StrictMode>
  //     <ErrorBoundary>
  <PrifinaProvider
    stage={'dev'}
    Context={PrifinaContext}
    activeUser={{uuid: prifinaID}}
    activeApp={'Sandbox'}>
    <App />
  </PrifinaProvider>
  //     </ErrorBoundary>
  //   </React.StrictMode>
);

AppRegistry.registerComponent(appName, () => AppWrapper); // Wrap App component in ErrorBoundary and PrifinaProvider
