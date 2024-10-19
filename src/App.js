import React, { useState } from "react";
import { auth, provider, signInWithPopup } from "./firebase";
import logo from "./logo.svg";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);

  // Google ile giriş fonksiyonu
  const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        setUser(result.user);
        console.log(result.user); // Kullanıcı bilgileri
      })
      .catch((error) => {
        console.log(error.message);
      });
  };
  return (
    <div className="App">
      <header className="App-header">
        {user ? (
          <div>
            <h2>Welcome, {user.displayName}</h2>
            <img src={user.photoURL} alt="Profile" />
          </div>
        ) : (
          <button onClick={signInWithGoogle}>Sign in with Google</button>
        )}
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
