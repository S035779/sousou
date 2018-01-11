import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import App from 'Pages/App/App';
 
const pspid = 'main';

const render = Component => {
  const args = JSON.parse(
    document.getElementById('initialProps').getAttribute('data-json')
  );
  ReactDOM.render((<AppContainer>
    <Component language={args.language}
      length={args.length} weight={args.weight} from={args.from}
      usd={args.usd} jpy={args.jpy}/>
  </AppContainer>), document.getElementById('app'));
};

render(App)

// Webpack Hot Module Replacement API
if (module.hot) {
  module.hot.accept('./pages/App/App', () => {
    console.info(`${pspid}>`, 'Update!!');
    render(App);
  });
};
