import { combineReducers, configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/user.js';
import memberReduer from '../features/members.js';
import courseReducer from '../features/courses.js';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user', 'members', 'courses']
};

const rootReducer = combineReducers({
  user: userReducer,
  members: memberReduer,
  courses: courseReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export const persistor = persistStore(store);
