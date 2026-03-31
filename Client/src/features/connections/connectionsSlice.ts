import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";

const initialState = {
    connections: [],
    pendingConnections: [],
    followers: [],
    following: [],
}

export const fetchConnections = createAsyncThunk('connections/fetchConnections', async () => {
    const { data } = await api.get('/api/user/connections')
    return data.success ? data : null;
})

const connectionsSlice = createSlice({
    name: "connections",
    initialState,   
    reducers: {
        clearConnections: (state) => {
            state.connections = [];
            state.pendingConnections = [];
            state.followers = [];
            state.following = [];
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchConnections.fulfilled, (state, action) => {
            if(action.payload){
                state.connections = action.payload.connections;
                state.pendingConnections= action.payload.pendingConnections;
                state.followers= action.payload.followers;
                state.following= action.payload.following
            }
        })
    }    
});

export const { clearConnections } = connectionsSlice.actions;
export default connectionsSlice.reducer;