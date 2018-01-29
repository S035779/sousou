import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
//import { renderRoutes } from 'react-router-config';
//import getRoutes from './routes';
import { createDispatcher } from './dispatcher';
import { rehydrateState } from './actions';
import { createStores } from './stores';
import App from './pages/App/App';

const pspid = 'main';

const dispatcher = createDispatcher();
createStores(dispatcher);
rehydrateState(JSON.parse(document.getElementById('initial-data')
  .getAttribute('data-stat')
));

const render = () => {
  const props = JSON.parse(document.getElementById('initial-data')
    .getAttribute('data-init'));
  ReactDOM.render(<AppContainer>
      <App {...props}/>
    </AppContainer>, document.getElementById('app'));
};

render();

// Webpack Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./pages/App/App' , () => {
    console.info(`${pspid}>`, 'Update!!');
    render();
  });
};

