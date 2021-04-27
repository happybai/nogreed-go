import { RootState } from "slices";
import { buildGenericReducer } from "utils/reducers";

export const {
  asyncThunk: fetchUser,
  slice: userSlice,
} = buildGenericReducer<any>("problems/fetchUser", "/users/:id");

export const {
  asyncThunk: fetchProblem,
  slice: problemSlice,
} = buildGenericReducer<any>("problems/fetchProblem", "/problems/:id");

export const {
  asyncThunk: fetchProblemNext,
  slice: problemNextSlice,
} = buildGenericReducer<any>("problems/fetchProblemNext", "/problems/next");

export const selectProblems = (state: RootState) => state.problems;
export const selectProblem = (state: RootState) => state.problem;
