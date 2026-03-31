import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { type User } from '../../assets/assets'

interface UserState {
  value: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
    value: null,
    loading: false,
    error: null
}

export const fetchUser = createAsyncThunk('user/fetchUser', async () => {
    const { data } = await api.get('/api/user/data')
    return data.success ? data.user : null;
})

interface UpdateUserArgs {
  userData: FormData;
}

export const updateUser = createAsyncThunk(
    'user/update', 
    async ({ userData }: UpdateUserArgs, { rejectWithValue }) => {
        try {
            // Log FormData contents for debugging
            console.log('FormData entries:');
            for (const pair of userData.entries()) {
                console.log(pair[0], pair[1]);
            }
            
            const { data } = await api.post('/api/user/update', userData, {
                headers: { 
                    'Content-Type': 'multipart/form-data'
                }
            })
            
            if(data.success) {
                toast.success(data.message)
                return data.user;
            } else {
                toast.error(data.message)
                return rejectWithValue(data.message);
            }
            } catch (error) {
            const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
            console.error('Update user error:', axiosError.response?.data || axiosError.message);
            toast.error(axiosError.response?.data?.message || 'Failed to update profile');
            return rejectWithValue(axiosError.response?.data?.message || axiosError.message);
        }
    }
)

const userSlice = createSlice({
    name: "user",
    initialState,   
    reducers: {
        // Add a reducer to clear user state if needed
        clearUser: (state) => {
            state.value = null;
            state.loading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.loading = false;
                state.value = action.payload;
            })
            .addCase(fetchUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch user';
            })
            .addCase(updateUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload) {
                    state.value = action.payload;
                }
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'Failed to update user';
            });
    }
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;