import { useEffect, useState, useCallback } from "react";

import "./fileAcceptCon.css";
import { socketActions } from "../../../config/";

const bytes_To_Kb_Mb = ({ size }) => {
  const bytes = size;
  const KB = (size / 1000).toFixed(2);
  const MB = (KB / 1000).toFixed(4);
  let retStr = `${bytes} bytes | ${KB} KB`;
  retStr +=
    parseInt(KB.toString().split(".")[0], 10) !== 0 ? ` | ${MB} MB` : "";
  return retStr;
};

const FileAcceptCon = ({ sender_uid, socketRef }) => {
  const [fileMetadata, setFileMetadata] = useState({
    fileSize: "",
    total_buffer_size: "",
    fileType: "",
    filename: "",
  });

  const acceptFileStartSharing = useCallback(() => {
    socketRef.current.emit(socketActions.fsStart, { sender_uid });
  }, [sender_uid, socketRef]);

  useEffect(() => {
    const socketRefCurrent = socketRef.current;

    socketRefCurrent.on(socketActions.fsMeta, (metadata) => {
      setFileMetadata({
        fileSize: bytes_To_Kb_Mb({ size: metadata.total_buffer_size }),
        total_buffer_size: metadata.total_buffer_size,
        fileType: metadata.fileType,
        filename: metadata.filename,
      });
    });

    return () => {
      socketRefCurrent.off(socketActions.fsMeta);
    };
  }, [socketRef]);

  return (
    <>
      {fileMetadata.fileSize &&
      fileMetadata.filename &&
      fileMetadata.fileType ? (
        <>
          <section
            className="FileAcceptCon_previewContainer"
            style={{
              justifyContent: "center",
            }}
          >
            <div>
              <div className="FileAcceptCon_image_preview_container">
                <img
                  alt="preview_image_not_loaded"
                  className="FileAcceptCon_image_preview_img"
                  // onError={() => setIsImageError(true)}
                  // src={file.preview}
                  style={{
                    width: "100%",
                  }}
                  onLoad={() => {
                    // URL.revokeObjectURL(file.preview);
                  }}
                />
                <div>
                  <div
                    className="textOverflow-ellipsis"
                    title={fileMetadata.filename}
                  >
                    {fileMetadata.filename}
                  </div>
                  <h4>{fileMetadata.fileSize}</h4>
                </div>
              </div>
              <div>
                <button
                  className="FileAcceptCon_acceptBtn"
                  onClick={(e) => {
                    acceptFileStartSharing();
                  }}
                >
                  Accept{" "}
                  {/*after complete download need to show download instate of accept btn and need to changes on click listener as well*/}
                </button>
              </div>
            </div>
          </section>
        </>
      ) : null}
    </>
  );
};

export default FileAcceptCon;
