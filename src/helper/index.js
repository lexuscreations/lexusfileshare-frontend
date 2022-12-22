import toast from "react-hot-toast";

import { initSocket } from "./socketHelper.js";
import { localStorageHandler } from "./localStorageHelper.js";

const copyToClipBoard = async (value) => {
  try {
    await navigator.clipboard.writeText(value);
    toast.success("UUID copied to your clipboard!");
  } catch (err) {
    toast.error("Could not copy the Room ID");
    console.error(err);
  }
};

export { initSocket, localStorageHandler, copyToClipBoard };
