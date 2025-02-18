import { useState } from 'react';

export function RegisterPage() {


  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("")

  async function handleRegister(e) {
    e.preventDefault();

    const response = await fetch("http://localhost:8000/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, email }),
    });

    const data = await response.json();
    if (response.ok) {
      console.log("registration successful");
      if (confirm("Registration successful! Click OK to log in.")) {
        window.location.href = "http://localhost:5173/login";
      }
    }
    else {
      setMessage(data.message || "Registraion failed");
    }

  }

  return(
    <>
      <h3>Register new user</h3>

      <form onSubmit={handleRegister}>
        <div>
          <label>Username:</label>
          <input type="text"
                 value={username}
                 onChange={(e) => setUsername(e.target.value)}
                 required
          />
        </div>
        <div>
          <label>Password:</label>
          <input type="password"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 required
          />
        </div>
        <div>
          <label>Email(Optional):</label>
          <input type="email"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}/>


        </div>
        <button type={'submit'}>Register</button>
      </form>
      {message && <p>{message}</p>}
    </>
  );
}