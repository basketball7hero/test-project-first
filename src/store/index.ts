import createStore from './createStore';
import postsModel from './models/postsModel';

const store = createStore({
  [postsModel.id]: postsModel.reduce,
});

export default store;
