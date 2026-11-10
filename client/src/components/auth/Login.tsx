import { useState } from "react";

export default function LoginForm() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");

  return (
    <form>
      <input 
      type="text" 
      placeholder="Email or phone number" 
      value={identifier}
      onChange={(e) => setIdentifier(e.target.value)}/>
      <input
      type="password" 
      placeholder="Password" 
      value={password}
      onChange={(e) => setPassword(e.target.value)}/>
      <button type="submit">Login</button>
    </form>
  );
}