import App from './pages/App/App';

export default function getRoutes() {
  return [
    { component: App,
      routes: [
      {
        path: '/api',
        exact: true,
        component: App
      }
      ]
    }
  ];
};
