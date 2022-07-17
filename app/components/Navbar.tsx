const Navbar = (props: { user: { name: string; id: string } }) => {
  const { user } = props;

  return (
    <nav className="relative w-full flex flex-wrap items-center justify-between py-4 bg-gray-100 text-gray-500 hover:text-gray-700 focus:text-gray-700 shadow-lg">
      <div className="container-fluid w-full flex flex-wrap items-center justify-between px-6">
        <div className="w-full flex container-fluid">
          <a
            className="flex items-center text-gray-900 hover:text-gray-900 focus:text-gray-900 mt-2 lg:mt-0 mr-1"
            href="/"
          >
            Strongion
          </a>
          <div className="ml-auto">{user.name}</div>
          <form action="/auth/logout" method="POST">
            <button
              name="_action"
              value="delete"
              className="font-medium text-red-600 hover:text-red-500 ml-1"
            >
              Log out
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
