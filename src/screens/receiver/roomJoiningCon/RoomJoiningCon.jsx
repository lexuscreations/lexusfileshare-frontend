import { v4 as uuid } from "uuid";
import toast from "react-hot-toast";
import { CiBarcode } from "react-icons/ci";
import { TbPlugConnected } from "react-icons/tb";
import { useCallback, useState, useEffect, useRef } from "react";

import "./roomJoiningCon.css";
import { localStorageHandler } from "../../../helper/";
import { socketActions, localStorageConfig } from "../../../config/";
import { Heading, Button } from "../../../components/commonSendReceivePageCom/";

const RoomJoiningCon = ({ UUID, socketRef, setUUID }) => {
  const requestSendSandStatusBtnRef = useRef(null);

  const [sender_uid, setSender_uid] = useState("");
  const [connectBtnState, setConnectBtnState] = useState("Join");

  const handleJoinSenderRoom = useCallback(() => {
    if (!sender_uid) return toast.error("Please Fill Sender UUID!");

    socketRef.current.emit(socketActions.receiverJoin, {
      sender_uid,
      receiverID: UUID,
    });
  }, [socketRef, sender_uid, UUID]);

  const generateUUIDhandler = useCallback(() => {
    const generatedUUID = uuid();

    localStorageHandler.set({
      key: localStorageConfig.shareReceiveUUID,
      newVal: generatedUUID,
    });

    toast.success("New UUID Allocated Successfully!");

    setUUID(generatedUUID);
  }, [setUUID]);

  useEffect(() => {
    const socketRefCurrent = socketRef.current;

    socketRefCurrent.on(socketActions.receiverJoinFailed_sender404, () => {
      toast.error(
        "Incorrect UUID or Sender isn't in the room, Ask Sender to enable sharing and try again!"
      );
      setConnectBtnState("Try Join Again");
    });

    socketRefCurrent.on(socketActions.joining_request_sent_confirmation, () => {
      toast.success("Request send, Sender Approval pending!");
      requestSendSandStatusBtnRef.current.style.background = "rgb(199 137 54)";
      setConnectBtnState("Approval Pending...");
    });

    socketRefCurrent.on(socketActions.receiver_joining_decline, (data) => {
      toast.error("Sender Declined Your joining request!");
      requestSendSandStatusBtnRef.current.style.background = "#e62121d9";
      setConnectBtnState("Sender Declined! - Try again!");
    });

    socketRefCurrent.on(
      socketActions.receiver_already_joined_with_same_UUID,
      () => {
        toast.error("You already joined with same UUID!");
        requestSendSandStatusBtnRef.current.style.background = "#e62121d9";
        setConnectBtnState("Already in the room!");
      }
    );

    socketRefCurrent.on(
      socketActions.receiver_sender_UUID_can_not_be_same,
      () => {
        toast.error("Sender UUID and Receiver UUID can't be same!");
        requestSendSandStatusBtnRef.current.style.background = "#e62121d9";
        setConnectBtnState("Found Same UUID as Sender!");
      }
    );

    socketRefCurrent.on(
      socketActions.sender_disconnect_during_receiver_request_approval,
      (data) => {
        toast.error(`${data.sender_uid} | Sender Disconnected!`);
        requestSendSandStatusBtnRef.current.style.background = "#e62121d9";
        setConnectBtnState("Sender Disconnected!");
      }
    );

    return () => {
      socketRefCurrent.off(socketActions.receiver_joining_decline);
      socketRefCurrent.off(socketActions.receiverJoinFailed_sender404);
      socketRefCurrent.off(socketActions.joining_request_sent_confirmation);
      socketRefCurrent.off(
        socketActions.receiver_already_joined_with_same_UUID
      );
      socketRefCurrent.off(socketActions.receiver_sender_UUID_can_not_be_same);
      socketRefCurrent.off(
        socketActions.sender_disconnect_during_receiver_request_approval
      );
    };
  }, [socketRef]);

  return (
    <>
      <section className="RoomJoiningCon_container">
        <div style={{ textAlign: "center", width: "100%" }}>
          <div className="RoomJoiningCon_generateRoomID_Sec_Con">
            <Heading />
            <Button
              onClickFn={generateUUIDhandler}
              Icon={CiBarcode}
              btnValue={UUID ? "Get New UUID" : "Get Your UUID"}
            />
          </div>
          <div style={{ marginTop: "2.5rem" }}>
            {UUID ? (
              <>
                <label className="RoomJoiningCon__uuidFld_label">
                  Your UUID: {UUID}
                </label>
              </>
            ) : null}
            <div className="RoomJoiningCon_Enter_SenderUUID_form_container">
              <input
                value={sender_uid}
                placeholder="Enter Sender UUID"
                type="text"
                className="RoomJoiningCon_Enter_SenderUUID_input"
                onChange={(e) => setSender_uid(e.target.value)}
              />
              <div
                className="RoomJoiningCon_connectJoinBtn"
                onClick={(e) => handleJoinSenderRoom()}
                ref={requestSendSandStatusBtnRef}
              >
                <span style={{ position: "relative", top: "-2px" }}>
                  <TbPlugConnected
                    style={{
                      position: "relative",
                      top: "3px",
                      right: "3px",
                    }}
                  />{" "}
                  {connectBtnState}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default RoomJoiningCon;
