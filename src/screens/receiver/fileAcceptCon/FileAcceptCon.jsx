import toast from "react-hot-toast";
import { useRef, useEffect, useState, useCallback } from "react";

import "./fileAcceptCon.css";
import { socketActions } from "../../../config/";

const bytes_To_Kb_Mb = (size) => {
  const bytes = size;
  const KB = (size / 1000).toFixed(2);
  const MB = (KB / 1000).toFixed(4);
  let retStr = `${bytes} bytes | ${KB} KB`;
  retStr +=
    parseInt(KB.toString().split(".")[0], 10) !== 0 ? ` | ${MB} MB` : "";
  return retStr;
};

const FileAcceptCon = ({ UUID, sender_uid, socketRef }) => {
  const [fileMetadata, setFileMetadata] = useState({
    total_buffer_size: "",
    max_buffer_size: "",
    fileType: "",
    filename: "",
  });

  const receivingFileRef = useRef({
    metadata: {},
    transmitted: 0,
    buffer: [],
    progress_node: {},
  });

  const imageElRef = useRef(null);
  const acceptBtnRef = useRef(null);

  const acceptFileStartSharing = useCallback(
    (targetEl__Btn) => {
      receivingFileRef.current.progress_node = targetEl__Btn;

      socketRef.current.emit(socketActions.fsStart, {
        receiverID: UUID,
        sender_uid,
      });
    },
    [UUID, sender_uid, socketRef]
  );

  if (
    fileMetadata.total_buffer_size &&
    fileMetadata.filename &&
    fileMetadata.fileType &&
    acceptBtnRef.current
  ) {
    acceptBtnRef.current.textContent = `Accept `;
    acceptBtnRef.current.style.color = "#000";
    acceptBtnRef.current.style.background = "hsl(210, 12%, 85%)";
    acceptBtnRef.current.disabled = false;
    acceptBtnRef.current.style.cursor = "pointer";
  }

  useEffect(() => {
    const socketRefCurrent = socketRef.current;

    socketRefCurrent.on(socketActions.fsMeta, (metadata) => {
      receivingFileRef.current.metadata = metadata;
      receivingFileRef.current.transmitted = 0;
      receivingFileRef.current.buffer = [];

      setFileMetadata({
        total_buffer_size: metadata.total_buffer_size,
        max_buffer_size: metadata.max_buffer_size,
        fileType: metadata.fileType,
        filename: metadata.filename,
      });
    });

    socketRefCurrent.on(socketActions.fsShare, (buffer) => {
      receivingFileRef.current.buffer.push(buffer);
      receivingFileRef.current.transmitted += buffer.byteLength;

      const progressPercentage = Math.trunc(
        (receivingFileRef.current.transmitted /
          receivingFileRef.current.metadata.total_buffer_size) *
          100
      );

      receivingFileRef.current.progress_node.textContent = `Received ${progressPercentage}%`;
      receivingFileRef.current.progress_node.style.color = "white";
      progressPercentage < 100 &&
        (receivingFileRef.current.progress_node.style.background = `repeating-linear-gradient(25deg, black, #000000a1 ${progressPercentage}px)`);

      if (
        receivingFileRef.current.transmitted >=
        receivingFileRef.current.metadata.total_buffer_size
      ) {
        toast.success("File Received Successfully!");
        receivingFileRef.current.progress_node.style.background = `repeating-linear-gradient(25deg, #74bf23, #109c10 100px)`;
        receivingFileRef.current.progress_node.style.cursor = "not-allowed";
        receivingFileRef.current.progress_node.disabled = true;
        const blogImg = new Blob(receivingFileRef.current.buffer);
        const imageUrl = URL.createObjectURL(blogImg);
        imageElRef.current.filePreview = imageUrl;
        imageElRef.current.src = imageUrl;
        // download(new Blob(receivingFileRef.current.buffer), receivingFileRef.current.metadata.filename);
        receivingFileRef.current = {};
      } else {
        socketRefCurrent.emit(socketActions.fsStart, {
          receiverID: UUID,
          sender_uid,
        });
      }
    });

    return () => {
      socketRefCurrent.off(socketActions.fsMeta);
      socketRefCurrent.off(socketActions.fsShare);
      socketRefCurrent.off(socketActions.fsStart);
    };
  }, [UUID, sender_uid, socketRef]);

  return (
    <>
      {fileMetadata.total_buffer_size &&
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
                  alt="preview__image-not-loaded"
                  className="FileAcceptCon_image_preview_img"
                  ref={imageElRef}
                  onError={() => {
                    console.log("Image loading Error");
                  }}
                  src={imageElRef.current?.filePreview}
                  style={{
                    width: "100%",
                  }}
                  onLoad={() => {
                    URL.revokeObjectURL(imageElRef.current.filePreview);
                  }}
                />
                <div>
                  <div
                    className="textOverflow-ellipsis"
                    title={fileMetadata.filename}
                  >
                    {fileMetadata.filename}
                  </div>
                  <h4>{bytes_To_Kb_Mb(fileMetadata.total_buffer_size)}</h4>
                  <h4 style={{ textAlign: "center" }}>
                    {fileMetadata.fileType}
                  </h4>
                </div>
              </div>
              <div>
                <button
                  className="FileAcceptCon_acceptBtn"
                  onClick={(e) => {
                    acceptFileStartSharing(e.target);
                  }}
                  ref={acceptBtnRef}
                >
                  Accept{" "}
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
