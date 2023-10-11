import React from 'react';
import {Provider} from 'react-redux';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import 'sanitize.css';
import './styles.css';

import store from '../../store';
import Posts from '../Posts';

const App = React.memo(() => (
  <Provider store={store}>
    <Posts />
  </Provider>
));

export default App;
