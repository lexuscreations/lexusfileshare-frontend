import toast from "react-hot-toast";
import { useState, useEffect, memo } from "react";

import { localStorageHandler } from "../../helper/";
import FileAcceptCon from "./fileAcceptCon/FileAcceptCon";
import RoomJoiningCon from "./roomJoiningCon/RoomJoiningCon";
import { socketActions, localStorageConfig } from "../../config/";

const Receiver = ({ socketRef }) => {
  const [UUID, setUUID] = useState("");
  const [sender_uid, setSender_uid] = useState("");

  // const receivedFileRef = useRef({
  //   transmitted: 0,
  //   buffer: [],
  // });

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

  // socketRefCurrent.on("fs-share", function (buffer) {
  //   console.log("Buffer", buffer);
  //   receivedFileRef.current.buffer.push(buffer);
  //   receivedFileRef.current.transmitted += buffer.byteLength;
  //   // progress_node.innerText = Math.trunc((receivedFileRef.current.transmitted / fileMetadata.total_buffer_size) * 100);
  //   if (
  //     receivedFileRef.current.transmitted === fileMetadata.total_buffer_size
  //   ) {
  //     console.log("Download file: ", receivedFileRef.current);
  //     // download(new Blob(receivedFileRef.current.buffer), fileMetadata.filename);
  //     receivedFileRef.current = {
  //       transmitted: 0,
  //       buffer: [],
  //     };
  //   } else {
  //     socketRefCurrent.emit("fs-start", { sender_uid });
  //   }
  // });

  return (
    <>
      {!sender_uid ? (
        <>
          <RoomJoiningCon UUID={UUID} socketRef={socketRef} setUUID={setUUID} />
        </>
      ) : (
        <>
          <section>
            <h4>Your_ID: {UUID}</h4>
            <h4>Sender_ID: {sender_uid}</h4>
          </section>
          <FileAcceptCon sender_uid={sender_uid} socketRef={socketRef} />
        </>
      )}
    </>
  );
};

export default memo(Receiver);
