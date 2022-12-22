import "./commonMessagePage.css";

const CommonMessagePage = ({ title, description }) => {
  return (
    <>
      <div className="CommonMessagePage">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </>
  );
};

export default CommonMessagePage;
