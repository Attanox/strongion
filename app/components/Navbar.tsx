import { Link } from "@remix-run/react";

const Navbar = (props: { user: { name: string; id: string } }) => {
  const { user } = props;

  return (
    <div className="navbar bg-base-100">
      <Link to="/" className="btn btn-ghost normal-case text-xl">
        Strongion
      </Link>
      <div className="ml-auto font-semibold text-lg">{user.name}</div>
      <form action="/auth/logout" method="POST">
        <button name="_action" value="delete" className="btn btn-nav-sm ml-2">
          Log out
        </button>
      </form>
    </div>
  );
};

export default Navbar;
