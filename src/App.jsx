import { Toaster } from "react-hot-toast";
import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import { initSocket } from "./helper/";
import Sender from "./screens/sender/Sender";
import Header from "./components/header/Header";
import Receiver from "./screens/receiver/Receiver";
import { toastOptions, socketActions } from "./config/";
import CommonMessagePage from "./screens/commonMessagePage/CommonMessagePage";

const App = () => {
  const socketRef = useRef(null);
  const [isSocketConnected, setIsSocketConnected] = useState({
    state: false,
    isError: false,
  });

  useEffect(() => {
    let socketRefCurrent = socketRef.current;

    const init = async () => {
      const socketObj = await initSocket();

      socketRef.current = socketObj;
      socketRefCurrent = socketObj;

      const socketConnectionCheckInterval = setInterval(() => {
        if (socketObj.connected) {
          clearInterval(socketConnectionCheckInterval);
          setIsSocketConnected({
            state: true,
            isError: false,
          });
        }
      }, 100);

      socketRefCurrent.on(socketActions.connectError, (err) => {
        setIsSocketConnected({
          state: false,
          isError: true,
        });
        console.log("socketConnectionError: ", err);
      });

      socketRefCurrent.on(socketActions.connectFailed, (err) => {
        setIsSocketConnected({
          state: false,
          isError: true,
        });
        console.log("socketConnectionError: ", err);
      });
    };

    init();

    return () => {
      if (!socketRefCurrent) return;
      socketRefCurrent.off(socketActions.connectError);
      socketRefCurrent.off(socketActions.connectFailed);
      socketRefCurrent.off("joined");
      socketRefCurrent.off("disconnected");
      socketRefCurrent.disconnect();
    };
  }, []);

  return isSocketConnected?.state ? (
    <>
      <Toaster position="top-right" toastOptions={toastOptions} />
      <BrowserRouter>
        <div className="App">
          <header>
            <Header />
          </header>
          <main>
            <Routes>
              <Route exact path="/" element={<Navigate to="/send" />} />
              <Route path="/send" element={<Sender socketRef={socketRef} />} />
              <Route
                path="/receive"
                element={<Receiver socketRef={socketRef} />}
              />
              <Route
                exact
                path="*"
                element={
                  <CommonMessagePage title="404" description="Not-Found" />
                }
              />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </>
  ) : (
    <>
      <main>
        <CommonMessagePage
          title={isSocketConnected?.isError ? "connectionError" : "Loading..."}
          description={
            isSocketConnected?.isError
              ? "File-Transfer-Server Connection Failed, socketConnection_Error, Please Try After Sometime."
              : "Please Wait..."
          }
        />
      </main>
    </>
  );
};

export default App;
