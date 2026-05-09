export default function Header() {
  const handleLogout = () => {

    localStorage.removeItem("isLogin");
    localStorage.removeItem("username");

    window.location.href = "/login";
  };

  return (
    <nav className="navbar navbar-dark bg-dark px-4 d-flex justify-content-between">

      <span className="navbar-brand mb-0 h1 text-white">
        Data Integration Dashboard
      </span>

      <button
        className="btn btn-danger"
        onClick={handleLogout}
      >
        Logout
      </button>

    </nav>
  );
}