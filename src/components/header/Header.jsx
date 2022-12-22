// import { NavLink, Link } from "react-router-dom";
import { ImUpload3, ImDownload3 } from "react-icons/im";

import "./header.css";

// const NavLinkEl = ({ link, title, Logo }) => (
//   <>
//     <NavLink
//       className={({ isActive }) => (isActive ? "active-nav-link" : "")}
//       to={link}
//     >
//       <Logo className="Header_link_logo" /> {title}
//     </NavLink>
//   </>
// );

const handleClickPageNavigate = (e, route_navigateTo_pageName) => {
  e.preventDefault();
  if (window.location.pathname === `/${route_navigateTo_pageName}`) return;
  if (
    !window.confirm(
      `Are you sure, you want to leave as ${
        route_navigateTo_pageName === "send" ? "receiver" : "sender"
      }?`
    )
  )
    return;
  window.location.href = `/${route_navigateTo_pageName}`;
};

const Header = () => (
  <>
    <nav className="app-header-nav">
      <ul>
        <li>
          {/* <NavLinkEl link="/send" title="Send" Logo={ImUpload3} /> */}
          <a href="/send" onClick={(e) => handleClickPageNavigate(e, "send")}>
            <ImUpload3 className="Header_link_logo" /> send
          </a>
        </li>
        <li className="Header_appTitle">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            LexusFileShare
          </a>
        </li>
        <li>
          {/* <NavLinkEl link="/receive" title="Receive" Logo={ImDownload3} /> */}
          <a
            href="/receive"
            onClick={(e) => handleClickPageNavigate(e, "receive")}
          >
            <ImDownload3 className="Header_link_logo" /> receive
          </a>
        </li>
      </ul>
    </nav>
  </>
);

export default Header;
