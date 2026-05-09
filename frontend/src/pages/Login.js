import { useState } from "react";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const response = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem("isLogin", "true");
      localStorage.setItem("username", data.username);
      window.location.href = "/employees";
    } else {
      alert(data.message);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1f2937, #0d6efd)"
      }}
    >
      <div
        className="card shadow-lg p-4"
        style={{
          width: "380px",
          borderRadius: "16px"
        }}
      >
        <h2 className="text-center mb-2">Login</h2>

        <p className="text-center text-muted mb-4">
          Data Integration Dashboard
        </p>

        <div className="mb-3">
          <label className="form-label">Username</label>
          <input
            className="form-control"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="form-label">Password</label>
          <input
            className="form-control"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          className="btn btn-primary w-100"
          onClick={handleLogin}
        >
          Login
        </button>

        
      </div>
    </div>
  );
}

export default Login;