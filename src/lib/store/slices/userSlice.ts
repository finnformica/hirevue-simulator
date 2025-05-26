import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Theme = "light" | "dark" | "system";

interface UserState {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
  theme: Theme;
}

const initialState: UserState = {
  isAuthenticated: false,
  user: null,
  theme: "system",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
      } | null>
    ) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
    },
  },
});

export const { setUser, setTheme } = userSlice.actions;
export default userSlice.reducer;
