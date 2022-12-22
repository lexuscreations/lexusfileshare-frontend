import React from "react";
import Modal from "react-modal";

import "./customModelPopup.css";

Modal.setAppElement("#root");

const CustomModelPopup = (props) => {
  return (
    <>
      <Modal
        isOpen={props.isModelPopupOpen}
        onRequestClose={() => props.setIsModelPopupOpen(false)}
        contentLabel="My dialog"
        className="myCustomModal-popup"
        overlayClassName="myCustomPopup-Overlay"
        closeTimeoutMS={500}
        shouldCloseOnOverlayClick={false}
      >
        {props.children}
      </Modal>
    </>
  );
};

export default React.memo(CustomModelPopup);
