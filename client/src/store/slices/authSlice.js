import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  isLoading: false,
  error: null,
  queueCount: 0,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.error = null;
      state.isLoading = false;
      localStorage.setItem('user', JSON.stringify(user));
      if (token) localStorage.setItem('token', token);
    },
    logout: (state) => {
      state.user = null;
      state.queueCount = 0;
      state.isLoading = false;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setQueueCount: (state, action) => {
      state.queueCount = action.payload;
    },
  },
});

export const { setCredentials, logout, setLoading, setError, setQueueCount } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => !!state.auth.user;
