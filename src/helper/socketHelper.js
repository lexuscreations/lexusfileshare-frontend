import { io } from "socket.io-client";
import { socketConfig } from "../config";

export const initSocket = async () =>
  await io(socketConfig.backendSocketServerURL, socketConfig.initSocketOptions);

/* process.env.REACT_APP_BACKEND_URL || "https://lexus-codeconnect.herokuapp.com" */
