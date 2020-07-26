import './src/config/reactotronConfig';
import React, {useEffect} from 'react';
import {PersistGate} from 'redux-persist/integration/react';
import {Provider, useSelector} from 'react-redux';
import {StatusBar} from 'react-native';
import {Provider as PaperProvider} from 'react-native-paper';
import {darken} from 'polished';
import OneSignal from 'react-native-onesignal';
import {appStore, appPersistor} from './src/appStore/appStore';
import createRouter from './routes';
import {appColors} from './src/utils/appColors';
import appConstants from './src/utils/appConstants';

function DevDoido() {
  const signed = useSelector(state => state.auth.signed);
  const Routes = createRouter(signed);
  const onIds = data => {};
  useEffect(() => {
    OneSignal.init(appConstants.ONE_SIGNAL_KEY);
    OneSignal.addEventListener('ids', onIds);
    return () => OneSignal.removeEventListener('ids', onIds);
  }, []);
  return <Routes />;
}

const App = () => {
  return (
    <Provider store={appStore}>
      <PersistGate persistor={appPersistor}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={darken(0.2, appColors.primary)}
        />
        <PaperProvider>
          <DevDoido />
        </PaperProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
