import React from "react";
import Navbar from "./Navbar";

const Layout: React.FC<{ user: { name: string; id: string } }> = (props) => {
  const { user, children } = props;

  return (
    <div className="h-screen bg-base-100">
      <Navbar user={user} />
      {children}
    </div>
  );
};

export default Layout;
