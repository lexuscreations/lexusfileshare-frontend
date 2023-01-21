import { v4 as uuid } from "uuid";
import toast from "react-hot-toast";
import { CiBarcode } from "react-icons/ci";
import { TbCloudDataConnection } from "react-icons/tb";
import { useEffect, useCallback, memo, useState } from "react";

import "./roomCreationCom.css";
import { localStorageConfig, socketActions } from "../../../config/";
import { copyToClipBoard, localStorageHandler } from "../../../helper/";
import { Heading, Button } from "../../../components/commonSendReceivePageCom/";

const RoomCreationCom = ({ socketRef, UUID, setUUID }) => {
  const [enableSharingBtnContent, setEnableSharingBtnContent] = useState({
    btnText: "Enable Sharing",
    bgColor: "#212222",
  });

  const handleEnableSharing = useCallback(() => {
    socketRef.current.emit(
      "sender-requestToCheck-isSharingEnabled-isRoomCreated-isInTheRoomAlready",
      {
        sender_uid: UUID,
        justOnlyShowToast: false,
        isThisEnableSharingRequest: true,
      }
    );
  }, [socketRef, UUID]);

  const generateUUIDhandler = useCallback(() => {
    const generatedUUID = uuid();

    localStorageHandler.set({
      key: localStorageConfig.shareReceiveUUID,
      newVal: generatedUUID,
    });

    setEnableSharingBtnContent((prev) => {
      if (prev.btnText !== "Enable Sharing") {
        toast.error("Default: SharingDisabled");
      }
      return {
        btnText: "Enable Sharing",
        bgColor: "#212222",
      };
    });

    toast.success("New UUID Allocated Successfully!");

    setUUID(generatedUUID);
  }, [setUUID]);

  useEffect(() => {
    const socketRefCurrent = socketRef.current;

    socketRefCurrent.emit(
      "sender-requestToCheck-isSharingEnabled-isRoomCreated-isInTheRoomAlready",
      {
        sender_uid: UUID,
        justOnlyShowToast: true,
        isThisEnableSharingRequest: false,
      }
    );

    socketRefCurrent.on("sender-already-joined-with-same-UUID", (data) => {
      if (!data.justOnlyShowToast) {
        setEnableSharingBtnContent({
          btnText: "Already joined!",
          bgColor: "#e62121d9",
        });
      }
      toast.error("You are already joined with same UUID!");
    });

    socketRefCurrent.on(
      "sender-responseToCheck-isSharingEnabled-isRoomCreated-isInTheRoomAlready",
      (data) => {
        if (data.isSharingEnabled)
          return toast.success("Sharing Already Enabled!");

        if (data.isThisEnableSharingRequest) {
          toast.success("Sharing Enabled!");
          setEnableSharingBtnContent({
            btnText: "Sharing Enabled!",
            bgColor: "repeating-linear-gradient(45deg, #74bf23, #109c10 450px)",
          });

          socketRef.current.emit(socketActions.senderJoin, {
            uid: UUID,
          });
        }
      }
    );

    const state = localStorageHandler.get({
      key: localStorageConfig.shareReceiveUUID,
    });
    state && setUUID(state);

    return () => {
      socketRefCurrent.off(
        "sender-responseToCheck-isSharingEnabled-isRoomCreated-isInTheRoomAlready"
      );
      socketRefCurrent.off("sender-already-joined-with-same-UUID");
    };
  }, [UUID, setUUID, socketRef]);

  return (
    <>
      <section className="RoomCreationCom__container">
        <div className="RoomCreationCom_generateRoomID_Sec_Con">
          <Heading />
          <Button
            onClickFn={generateUUIDhandler}
            Icon={CiBarcode}
            btnValue={UUID ? "Get New UUID" : "Get Your UUID"}
          />
        </div>

        {UUID ? (
          <>
            <section
              style={{ margin: "4rem 1.3rem 0 1.3rem", textAlign: "center" }}
            >
              <label className="RoomCreationCom__uuidFld_label">
                Your Share / Receive Universally Unique Identifiers (UUID)
              </label>
              <div className="RoomCreationCom_copyAndEnableUUID_con">
                <input
                  className="RoomCreationCom__uuidFld"
                  title="Click To Copy UUID"
                  onClick={() => copyToClipBoard(UUID)}
                  value={UUID}
                  type="text"
                  readOnly={true}
                />
                <Button
                  onClickFn={handleEnableSharing}
                  Icon={TbCloudDataConnection}
                  btnValue={enableSharingBtnContent.btnText}
                  styles={{
                    background: enableSharingBtnContent.bgColor,
                    margin: "1rem",
                  }}
                />
              </div>
              <div style={{ marginTop: "2rem" }}>
                <mark>
                  Click on the `<code>Enable-Sharing</code>` button and then
                  just provide your UUID to the receiver, and as the receiver
                  joined, then you will see the options for file selection and
                  sharing.
                </mark>
              </div>
            </section>
          </>
        ) : null}
      </section>
    </>
  );
};

export default memo(RoomCreationCom);
