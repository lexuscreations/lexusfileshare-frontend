export const toastOptions = {
  success: {
    theme: {
      primary: "#4aed88",
    },
  },
};

export const socketActions = {
  connectError: "connect_error",
  connectFailed: "connect_failed",

  senderJoin: "sender-join",
  receiver_joining_request: "receiver-joining-request",
  sender_accept_receiver_joining_request:
    "sender-accept-receiver-joining-request",
  sender_reject_receiver_joining_request:
    "sender-reject-receiver-joining-request",
  receiver_disconnect_during_sender_request_approval:
    "receiver-disconnect-during-sender-request-approval",
  receiver_disconnected_from_the_room: "receiver-disconnected-from-the-room",

  receiverJoin: "receiver-join",
  receiverJoinFailed_sender404: "receiver-join-failed-sender404",
  receiverOnePreviousRequestIsAlreadyInPendingState:
    "receiver-one-previous-request-is-already-in-pending-state",
  joining_request_sent_confirmation: "joining-request-sent-confirmation",
  receiver_joining_decline: "receiver-joining-decline",
  receiver_already_joined_with_same_UUID:
    "receiver-already-joined-with-same-UUID",
  receiver_sender_UUID_can_not_be_same: "receiver-sender-UUID-can_not-be-same",
  receiverJoiningDone: "receiver-joining-done",
  sender_disconnect_during_receiver_request_approval:
    "sender-disconnect-during-receiver-request-approval",
  sender_disconnected_from_the_room: "sender-disconnected-from-the-room",

  fileMeta: "file-meta",
  fsMeta: "fs-meta",

  fsStart: "fs-start",

  fsShare: "fs-share",
  // ^ from fileRaw to fsShare again and again till whole file shared
  fileRaw: "file-raw",
};

export const socketConfig = {
  backendSocketServerURL: "http://localhost:5000",
  initSocketOptions: {
    timeout: 10000,
    transports: ["websocket"],
    "force new connection": true,
    reconnectionAttempt: "Infinity",
  },
};

export const dropzoneConfig = {
  multiple: false,
  maxSize: 1000000,
  accept: { "image/*": [".png", ".jpg", ".jpeg"] },
};

export const localStorageConfig = {
  shareReceiveUUID: "ShareReceiveUUID",
  fileSharingAppLocalStorageStateKey: "fileSharingAppState",
};
