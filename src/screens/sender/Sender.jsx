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
  const [tempReceiverRequestDataForModel, setTempReceiverRequestDataForModel] =
    useState({});

  const acceptReceiverJoiningRequest = useCallback(
    (receiverID) => {
      socketRef.current.emit(
        socketActions.sender_accept_receiver_joining_request,
        {
          sender_uid: UUID,
          receiverID,
          receiver_socketId:
            tempReceiverRequestDataForModel[receiverID].receiver_socketId,
        }
      );
    },
    [UUID, socketRef, tempReceiverRequestDataForModel]
  );

  const rejectReceiverJoiningRequest = useCallback(
    (receiverID) => {
      socketRef.current.emit(
        socketActions.sender_reject_receiver_joining_request,
        {
          sender_uid: UUID,
          receiverID,
          receiver_socketId:
            tempReceiverRequestDataForModel[receiverID].receiver_socketId,
        }
      );
    },
    [UUID, socketRef, tempReceiverRequestDataForModel]
  );

  const receiverRequestHandlerMiddlewareFn = useCallback(
    (receiverID, action) => {
      if (action === "reject") {
        rejectReceiverJoiningRequest(receiverID);
      } else if (action === "accept") {
        acceptReceiverJoiningRequest(receiverID);
        setReceiverIDs((prev) => [...prev, receiverID]);
      }

      setTempReceiverRequestDataForModel((prev) => {
        const temp = { ...prev };
        delete temp[receiverID];
        return temp;
      });
    },
    [acceptReceiverJoiningRequest, rejectReceiverJoiningRequest]
  );

  useEffect(() => {
    const socketRefCurrent = socketRef.current;

    socketRefCurrent.on(socketActions.receiver_joining_request, (data) => {
      setIsModelPopupOpen(true);
      setTempReceiverRequestDataForModel((prev) => ({
        ...prev,
        [data.receiverID]: { receiver_socketId: data.receiver_socketId },
      }));
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

    if (!Object.keys(tempReceiverRequestDataForModel).length)
      setIsModelPopupOpen(false);

    socketRefCurrent.off(
      socketActions.receiver_disconnect_during_sender_request_approval
    );

    socketRefCurrent.on(
      socketActions.receiver_disconnect_during_sender_request_approval,
      (data) => {
        setTempReceiverRequestDataForModel((prev) => {
          const temp = { ...prev };
          delete temp[data.receiverID];
          return temp;
        });
        toast.error(`${data.receiverID} | receiver-disconnect`);
      }
    );

    return () => {
      socketRefCurrent.off(
        socketActions.receiver_disconnect_during_sender_request_approval
      );
    };
  }, [socketRef, tempReceiverRequestDataForModel]);

  return (
    <>
      <CustomModelPopup
        isModelPopupOpen={isModelPopupOpen}
        setIsModelPopupOpen={setIsModelPopupOpen}
      >
        <section>
          <div style={{ marginBottom: "1rem" }}>
            <span style={{ fontWeight: 600 }}>
              <h4>
                {Object.keys(tempReceiverRequestDataForModel).length > 1
                  ? "Multiple receivers"
                  : "Some receiver"}{" "}
                wants to join
              </h4>
            </span>
          </div>
          <hr style={{ marginBottom: "1rem" }} />
          {Object.keys(tempReceiverRequestDataForModel).map(
            (receiverID, ind, arr) => (
              <>
                <div
                  key={ind}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: arr.length - 1 !== ind ? "1rem" : "",
                  }}
                >
                  <span style={{ fontWeight: "bold", marginRight: "1.5rem" }}>
                    {receiverID}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <button
                      className="Sender_model_receiver_accept_button model_popup_buttons"
                      onClick={() => {
                        receiverRequestHandlerMiddlewareFn(
                          receiverID,
                          "accept"
                        );
                      }}
                    >
                      Admit
                    </button>
                    &nbsp;
                    <button
                      className="Sender_model_receiver_reject_button model_popup_buttons"
                      onClick={() => {
                        receiverRequestHandlerMiddlewareFn(
                          receiverID,
                          "reject"
                        );
                      }}
                    >
                      Deny
                    </button>
                  </div>
                </div>
                {arr.length - 1 !== ind ? (
                  <hr
                    style={{
                      marginBottom: "1rem",
                      background: "#ebe6e6",
                      height: "0.1px",
                      border: "none",
                    }}
                  />
                ) : null}
              </>
            )
          )}
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
