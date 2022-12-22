import { localStorageConfig } from "../config/";

export const localStorageHandler = {
  get: ({ key }) => {
    let previous_LS_state =
      localStorage.getItem(
        localStorageConfig.fileSharingAppLocalStorageStateKey
      ) || "{}";
    previous_LS_state = JSON.parse(previous_LS_state);
    if (!previous_LS_state[key]) return null;
    return previous_LS_state[key];
  },
  set: ({ key, newVal }) => {
    let previous_LS_state =
      localStorage.getItem(
        localStorageConfig.fileSharingAppLocalStorageStateKey
      ) || "{}";
    previous_LS_state = JSON.parse(previous_LS_state);
    localStorage.setItem(
      localStorageConfig.fileSharingAppLocalStorageStateKey,
      JSON.stringify({ ...previous_LS_state, [key]: newVal })
    );
  },
};
