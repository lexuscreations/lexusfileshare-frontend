import { v4 as uuid } from "uuid";
import toast from "react-hot-toast";
import Dropzone from "react-dropzone";
import { useState, useCallback, memo, useEffect } from "react";

import "./fileSelectCom.css";
import { dropzoneConfig, socketActions } from "../../../config/";

const bytes_To_Kb_Mb = ({ path, size }) => {
  const bytes = size;
  const KB = (size / 1000).toFixed(2);
  const MB = (KB / 1000).toFixed(4);
  let retStr = path
    ? `${path} - ${bytes} bytes | ${KB} KB`
    : `${bytes} bytes | ${KB} KB`;
  retStr +=
    parseInt(KB.toString().split(".")[0], 10) !== 0 ? ` | ${MB} MB` : "";
  return retStr;
};

const FileSelectCom = ({ receiverIDs, socketRef, UUID }) => {
  const [selectedFile, setSelectedFile] = useState([]);
  const [isImageError, setIsImageError] = useState(false);

  const dropzoneOnDropHandler = useCallback((acceptedFiles) => {
    if (Array.isArray(acceptedFiles) && acceptedFiles.length < 1) return;
    setSelectedFile(
      acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
          uuid: uuid(),
        })
      )
    );
  }, []);

  const shareFileFn = useCallback(
    (metadata, buffer, progress_node) => {
      socketRef.current.emit(socketActions.fileMeta, {
        sender_uid: UUID,
        metadata: metadata,
      });

      progress_node.innerHTML = "Request Sent<br />Ask Receiver to accept";

      socketRef.current.on(socketActions.fsShare, () => {
        const chunk = buffer.slice(0, metadata.max_buffer_size);

        buffer = buffer.slice(metadata.max_buffer_size, buffer.length);

        const progressPercentage = Math.trunc(
          ((metadata.total_buffer_size - buffer.length) /
            metadata.total_buffer_size) *
            100
        );

        progress_node.textContent = `Shared ${progressPercentage}%`;
        progress_node.style.color = "white";
        progressPercentage < 101 &&
          (progress_node.style.background = `repeating-linear-gradient(45deg, black, #000000a1 ${progressPercentage}px)`);

        if (chunk.length !== 0) {
          socketRef.current.emit(socketActions.fileRaw, {
            receiverIDs,
            sender_uid: UUID,
            buffer: chunk,
          });
        } else {
          progress_node.style.background = `repeating-linear-gradient(45deg, #74bf23, #109c10 100px)`;
          toast.success("File Sent Successfully!");
        }
      });
    },
    [socketRef, receiverIDs, UUID]
  );

  const handleShareClick = useCallback(
    (targetEl, fileUUID) => {
      const [file] = selectedFile.filter((file) => file.uuid === fileUUID);

      const reader = new FileReader();
      reader.onload = (e) => {
        const buffer = new Uint8Array(reader.result);

        shareFileFn(
          {
            filename: file.name,
            fileType: file.type,
            total_buffer_size: buffer.length,
            max_buffer_size: 1024,
          },
          buffer,
          targetEl
        );
      };
      reader.readAsArrayBuffer(file);
    },
    [selectedFile, shareFileFn]
  );

  useEffect(() => {
    const socketRefCurrent = socketRef.current;

    return () => {
      socketRefCurrent.off(socketActions.fsShare);
    };
  }, [socketRef]);

  return (
    <>
      <section>
        <h4>Your_ID: {UUID}</h4>
        {receiverIDs.length > 1 ? (
          <>
            <h4>Receivers</h4>
            <div style={{ paddingLeft: "1rem" }}>
              {receiverIDs.map((receiverID, ind) => (
                <h4 key={ind}>
                  {ind + 1}). {receiverID}
                </h4>
              ))}
            </div>
          </>
        ) : (
          <>
            <h4>ReceiverID: {receiverIDs[0]}</h4>
          </>
        )}
      </section>
      <Dropzone
        maxSize={dropzoneConfig.maxSize}
        multiple={dropzoneConfig.multiple}
        accept={dropzoneConfig.accept}
        onDrop={dropzoneOnDropHandler}
        noClick={true}
        noKeyboard={true}
      >
        {({
          getRootProps,
          getInputProps,
          isDragActive,
          open: openFileSelectionFn,
          fileRejections,
        }) => (
          <>
            <div className="FileSelectCom_Container">
              <section className="FileSelectCom_dropZoneContainer">
                <div {...getRootProps()} className="FileSelectCom_dropZone">
                  <input {...getInputProps()} />
                  {!isDragActive ? (
                    <>
                      <p>
                        Drag 'n' drop some file here, or{" "}
                        <span
                          id="openFileSelectionDialogueBtn"
                          onClick={openFileSelectionFn}
                        >
                          Click to select file
                        </span>
                      </p>
                    </>
                  ) : (
                    <>
                      <p>Drop your file here</p>
                    </>
                  )}
                </div>
              </section>

              {Array.isArray(selectedFile) && selectedFile.length > 0 ? (
                <>
                  <section
                    className="FileSelectCom_previewContainer"
                    style={{
                      justifyContent:
                        selectedFile.length > 1 ? "space-around" : "center",
                    }}
                  >
                    {selectedFile.map((file) => (
                      <div key={file.uuid}>
                        <div className="FileSelectCom_image_preview_container">
                          <img
                            alt="preview_if_file_is_image"
                            className="FileSelectCom_image_preview_img"
                            onError={() => setIsImageError(true)}
                            src={file.preview}
                            style={{
                              width: "100%",
                            }}
                            onLoad={() => {
                              URL.revokeObjectURL(file.preview);
                            }}
                          />
                          <div>
                            <div
                              className="textOverflow-ellipsis"
                              title={file.name}
                            >
                              {file.name}
                            </div>
                            <h4>{bytes_To_Kb_Mb({ size: file.size })}</h4>
                          </div>
                        </div>
                        {!isImageError ? (
                          <>
                            <div>
                              <button
                                className="FileSelectCom_shareBtn"
                                onClick={(e) => {
                                  handleShareClick(e.target, file.uuid);
                                }}
                              >
                                Share
                              </button>
                            </div>
                          </>
                        ) : null}
                      </div>
                    ))}
                  </section>
                </>
              ) : null}

              {Array.isArray(fileRejections) && fileRejections.length > 0 ? (
                <>
                  <section className="FileSelectCom_errorContainer">
                    <div>
                      <h2 style={{ color: "#e11c54" }}>Error: </h2>
                      <ul style={{ marginLeft: "3rem" }}>
                        {fileRejections.map(({ file, errors }) => (
                          <li key={file.uuid}>
                            {bytes_To_Kb_Mb({
                              path: file.path,
                              size: file.size,
                            })}
                            <ul style={{ marginLeft: "1rem" }}>
                              {errors.map((e) => (
                                <li key={e.code}>{e.message}</li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>
                </>
              ) : null}
            </div>
          </>
        )}
      </Dropzone>
    </>
  );
};

export default memo(FileSelectCom);
