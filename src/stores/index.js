import AppStore from './AppStore';

let stores;

export function createStores(dispatcher) {
  stores = {
    appStore: new AppStore(dispatcher)
  };
};

export function getStore(name) {
  return stores[name];
};

export function getStores(names) {
  return names.map(name => getStore(name));
};

export function getState(name) {
  return getStore(name).getState();
};

export function dehydrateState() {
  return {
    appStore: getState('appStore')
  };
};
