import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import App from './pages/App/App';
 
ReactDOM.render((<BrowserRouter>
  <Switch>
    <Route exact path="/:language" component={App}/>>
  </Switch>
</BrowserRouter>), document.getElementById('app'));
