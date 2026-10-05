import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { login } from "../api/auth";
import { useAuth } from "../auth/AuthContext";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 p-8 shadow-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Game Library</h1>

          <p className="mt-2 text-sm text-gray-400">Sign in to your library</p>
        </div>

        <form
          className="space-y-5"
          onSubmit={async (event) => {
            event.preventDefault();

            await login(username, password);
            await refreshUser();
            navigate("/");
          }}
        >
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Username
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
              autoComplete="username"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500"
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}

export default LoginPage;
