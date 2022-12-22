import "./commonSendReceivePageButton.css";

const CommonSendReceivePageButton = ({ onClickFn, Icon, btnValue, styles }) => {
  return (
    <>
      <div
        className="CommonSendReceivePageButton_container"
        onClick={() => onClickFn()}
        style={{ ...styles }}
      >
        <Icon className="CommonSendReceivePageButton_icon" /> {btnValue}
      </div>
    </>
  );
};

export default CommonSendReceivePageButton;
