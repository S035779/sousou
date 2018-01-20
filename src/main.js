import React from 'react';
import ReactDOM from 'react-dom';
//import { BrowserRouter } from 'react-router-dom';
//import { renderRoutes } from 'react-router-config';
import { AppContainer } from 'react-hot-loader';
import { createDispatcher } from './dispatcher';
import { rehydrateState } from './actions';
import { createStores } from './stores';
//import getRoutes from './routes';
import App from './pages/App/App';

const pspid = 'main';

const dispatcher = createDispatcher();
createStores(dispatcher);

rehydrateState(JSON.parse(
  document.getElementById('initial-data').getAttribute('data-stat')));

const render = () => {
  ReactDOM.render(
    <AppContainer>
      <App />
    </AppContainer>
    , document.getElementById('app'));
};
//const render = () => {
//  const routes = getRoutes();
//  ReactDOM.render(
//    <AppContainer>
//      <BrowserRouter>{renderRoutes(routes)}</BrowserRouter>;
//    </AppContainer>
//    , document.getElementById('app'));
//};

render();
// Webpack Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./pages/App/App' , () => {
    console.info(`${pspid}>`, 'Update!!');
    render();
  });
};

