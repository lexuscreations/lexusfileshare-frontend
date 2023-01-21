import toast from "react-hot-toast";
import { useState, useEffect, memo } from "react";

import { localStorageHandler } from "../../helper/";
import FileAcceptCon from "./fileAcceptCon/FileAcceptCon";
import RoomJoiningCon from "./roomJoiningCon/RoomJoiningCon";
import { socketActions, localStorageConfig } from "../../config/";

const Receiver = ({ socketRef }) => {
  const [UUID, setUUID] = useState("");
  const [sender_uid, setSender_uid] = useState("");

  useEffect(() => {
    const socketRefCurrent = socketRef.current;

    socketRefCurrent.on(socketActions.receiverJoiningDone, (data) => {
      setSender_uid(data.sender_uid);
    });

    const localStateUUID = localStorageHandler.get({
      key: localStorageConfig.shareReceiveUUID,
    });

    socketRefCurrent.on(
      socketActions.sender_disconnected_from_the_room,
      (data) => {
        toast.error(`${data.sender_uid} | Sender disconnected from the room!`);
        setSender_uid("");
      }
    );

    setUUID(localStateUUID);

    return () => {
      socketRefCurrent.off(socketActions.receiverJoiningDone);
      socketRefCurrent.off(socketActions.sender_disconnected_from_the_room);
    };
  }, [socketRef]);

  return (
    <>
      {!sender_uid ? (
        <>
          <RoomJoiningCon UUID={UUID} socketRef={socketRef} setUUID={setUUID} />
        </>
      ) : (
        <>
          <section className="topStatusBarHeader">
            <h4>Your_ID: {UUID}</h4>
            <h4>Sender_ID: {sender_uid}</h4>
          </section>
          <FileAcceptCon
            UUID={UUID}
            sender_uid={sender_uid}
            socketRef={socketRef}
          />
        </>
      )}
    </>
  );
};

export default memo(Receiver);
