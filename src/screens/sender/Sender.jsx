import toast from "react-hot-toast";
import { useState, useEffect, useCallback } from "react";

import "./sender.css";
import { socketActions } from "../../config/";
import FileSelectCom from "./fileSelectCom/FileSelectCom";
import RoomCreationCom from "./roomCreationCom/RoomCreationCom";
import CustomModelPopup from "../../components/CustomModelPopup/CustomModelPopup";

const Sender = ({ socketRef }) => {
  const [UUID, setUUID] = useState("");
  const [receiverIDs, setReceiverIDs] = useState([]);
  const [isModelPopupOpen, setIsModelPopupOpen] = useState(false);
  const [tempReceiverDataForModel, setTempReceiverDataForModel] = useState([]);

  const acceptReceiverJoiningRequest = useCallback(() => {
    socketRef.current.emit(
      socketActions.sender_accept_receiver_joining_request,
      {
        sender_uid: UUID,
        receiverID: tempReceiverDataForModel.receiverID,
        receiver_socketId: tempReceiverDataForModel.receiver_socketId,
      }
    );
    setReceiverIDs((prev) => [...prev, tempReceiverDataForModel.receiverID]);
  }, [
    UUID,
    socketRef,
    tempReceiverDataForModel.receiverID,
    tempReceiverDataForModel.receiver_socketId,
  ]);

  const rejectReceiverJoiningRequest = useCallback(() => {
    socketRef.current.emit(
      socketActions.sender_reject_receiver_joining_request,
      {
        sender_uid: UUID,
        receiverID: tempReceiverDataForModel.receiverID,
        receiver_socketId: tempReceiverDataForModel.receiver_socketId,
      }
    );
  }, [
    UUID,
    socketRef,
    tempReceiverDataForModel.receiverID,
    tempReceiverDataForModel.receiver_socketId,
  ]);

  useEffect(() => {
    const socketRefCurrent = socketRef.current;

    socketRefCurrent.on(socketActions.receiver_joining_request, (data) => {
      setIsModelPopupOpen(true);
      setTempReceiverDataForModel({
        receiverID: data.receiverID,
        receiver_socketId: data.receiver_socketId,
      });
    });

    socketRefCurrent.on(
      socketActions.receiver_disconnected_from_the_room,
      (data) => {
        toast.error(`${data.receiverID} | receiver-disconnect`);
        setReceiverIDs((prev) => {
          const temp = [...prev];
          temp.splice(prev.indexOf(data.receiverID), 1);
          return temp;
        });
      }
    );

    return () => {
      socketRefCurrent.off(socketActions.receiver_joining_request);
      socketRefCurrent.off(socketActions.receiver_disconnected_from_the_room);
    };
  }, [socketRef]);

  useEffect(() => {
    const socketRefCurrent = socketRef.current;

    socketRefCurrent.off(
      socketActions.receiver_disconnect_during_sender_request_approval
    );

    socketRefCurrent.on(
      socketActions.receiver_disconnect_during_sender_request_approval,
      (data) => {
        setIsModelPopupOpen(false);
        setTempReceiverDataForModel([]);
        toast.error(`${data.receiverID} | receiver-disconnect`);
        receiverIDs.length < 2 && setReceiverIDs([]);
      }
    );

    return () => {
      socketRefCurrent.off(
        socketActions.receiver_disconnect_during_sender_request_approval
      );
    };
  }, [receiverIDs.length, socketRef]);

  return (
    <>
      <CustomModelPopup
        isModelPopupOpen={isModelPopupOpen}
        setIsModelPopupOpen={setIsModelPopupOpen}
      >
        <section>
          <div style={{ marginBottom: "1rem" }}>
            <p style={{ fontWeight: 600 }}>
              {tempReceiverDataForModel.receiverID} | some receiver want's to
              join
            </p>
          </div>
          <div>
            <button
              className="Sender_model_receiver_accept_button model_popup_buttons"
              onClick={() => {
                acceptReceiverJoiningRequest();
                setIsModelPopupOpen(false);
              }}
            >
              Admit
            </button>
            &nbsp;
            <button
              className="Sender_model_receiver_reject_button model_popup_buttons"
              onClick={() => {
                rejectReceiverJoiningRequest();
                setIsModelPopupOpen(false);
              }}
            >
              Deny
            </button>
          </div>
        </section>
      </CustomModelPopup>

      {receiverIDs.length > 0 ? (
        <>
          <FileSelectCom
            receiverIDs={receiverIDs}
            socketRef={socketRef}
            UUID={UUID}
          />
        </>
      ) : (
        <>
          <RoomCreationCom
            socketRef={socketRef}
            UUID={UUID}
            setUUID={setUUID}
          />
        </>
      )}
    </>
  );
};

export default Sender;
