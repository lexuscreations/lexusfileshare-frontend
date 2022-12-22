import { FcTreeStructure } from "react-icons/fc";

import "./commonSendReceivePageHeading.css";

const commonSendReceivePageHeading = () => {
  return (
    <>
      <h1 className="commonSendReceivePageHeading">
        Share And Receive Files{" "}
        <FcTreeStructure style={{ position: "relative", top: "5px" }} />
      </h1>
    </>
  );
};

export default commonSendReceivePageHeading;
