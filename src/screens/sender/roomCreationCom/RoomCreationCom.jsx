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
  const [isSharingEnabled, setIsSharingEnabled] = useState(false);

  const handleEnableSharing = useCallback(() => {
    if (isSharingEnabled) return toast.success("Sharing Already Enabled!");

    toast.success("Sharing Enabled!");

    setIsSharingEnabled(true);

    socketRef.current.emit(socketActions.senderJoin, {
      uid: UUID,
    });
  }, [socketRef, UUID, isSharingEnabled]);

  const generateUUIDhandler = useCallback(() => {
    const generatedUUID = uuid();

    localStorageHandler.set({
      key: localStorageConfig.shareReceiveUUID,
      newVal: generatedUUID,
    });

    if (isSharingEnabled) {
      setIsSharingEnabled(false);
      toast.error("Default: SharingDisabled");
    }

    toast.success("New UUID Allocated Successfully!");

    setUUID(generatedUUID);
  }, [setUUID, isSharingEnabled]);

  useEffect(() => {
    const state = localStorageHandler.get({
      key: localStorageConfig.shareReceiveUUID,
    });
    state && setUUID(state);
  }, [setUUID]);

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
                Your Share / Receive Universally Unique Identifiers (ID)
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
                  btnValue={"Enable Sharing"}
                  styles={{
                    background: isSharingEnabled
                      ? "repeating-linear-gradient(45deg, #74bf23, #109c10 450px)"
                      : "#212222",
                    margin: "1rem",
                  }}
                />
              </div>
              <div style={{ marginTop: "2rem" }}>
                <mark>
                  Click on the `<code>Enable-Sharing</code>
                  `, button and then just provide your UUID to the receiver, and
                  as the receiver joined, then you will see the options for file
                  selection and sharing.
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
