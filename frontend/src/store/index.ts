import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import customersSlice from './slices/customersSlice';
import agentsSlice from './slices/agentsSlice';
import productsSlice from './slices/productsSlice';
import ordersSlice from './slices/ordersSlice';
import stockSlice from './slices/stockSlice';
import statisticsSlice from './slices/statisticsSlice';
import usersSlice from './slices/usersSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    users: usersSlice,
    customers: customersSlice,
    agents: agentsSlice,
    products: productsSlice,
    orders: ordersSlice,
    stock: stockSlice,
    statistics: statisticsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 