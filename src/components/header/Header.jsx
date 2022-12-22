import { NavLink, Link } from "react-router-dom";
import { ImUpload3, ImDownload3 } from "react-icons/im";

import "./header.css";

const NavLinkEl = ({ link, title, Logo }) => (
  <>
    <NavLink
      className={({ isActive }) => (isActive ? "active-nav-link" : "")}
      to={link}
    >
      <Logo className="Header_link_logo" /> {title}
    </NavLink>
  </>
);

const Header = () => (
  <>
    <nav className="app-header-nav">
      <ul>
        <li>
          <NavLinkEl link="/send" title="Send" Logo={ImUpload3} />
        </li>
        <li className="Header_appTitle">
          <Link to="/">LexusFileShare</Link>
        </li>
        <li>
          <NavLinkEl link="/receive" title="Receive" Logo={ImDownload3} />
        </li>
      </ul>
    </nav>
  </>
);

export default Header;
