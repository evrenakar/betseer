import React, { useState, useEffect } from "react";
import { auth, provider, signInWithPopup } from "./firebase";
import { TypeAnimation } from "react-type-animation";
import "./App.css";
import data from "./data.json";

function App() {
  const [user, setUser] = useState(null);
  const [gameData, setGameData] = useState(data);
  const [selectedGame, setSelectedGame] = useState(null);
  const tokenExpiryTime = 15 * 60 * 1000; // 15 dakika = 15 * 60 * 1000 ms

  // Google ile giriş fonksiyonu
  const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        setUser(result.user);
        localStorage.setItem("user", JSON.stringify(result.user)); // Kullanıcıyı localStorage'a kaydet
        // Token'ı sakla ve süre başlat
        const tokenExpiration = Date.now() + tokenExpiryTime; // Şu anki zaman + 15 dakika
        localStorage.setItem("tokenExpiration", tokenExpiration); // Token süresini localStorage'a kaydet
        console.log(result.user);
      })
      .catch((error) => {
        console.log(error.message);
      });
  };
  const handleRandomGame = () => {
    const randomIndex = Math.floor(Math.random() * gameData.games.length); // Rastgele bir oyun seç
    setSelectedGame(gameData.games[randomIndex]); // Animasyonu durdur
  };

  // Yüzdelik değeri %20 artı/eksi olacak şekilde rastgele değiştir
  const adjustPercentages = () => {
    const updatedGames = gameData.games.map((game) => {
      const change = Math.floor(Math.random() * 41) - 20; // -20 ile +20 arasında rastgele bir sayı
      const newPercentage = Math.max(
        0,
        Math.min(100, game.percentage + change)
      ); // Yüzde değeri 0 ile 100 arasında kalmalı
      return { ...game, percentage: newPercentage };
    });
    setGameData({ games: updatedGames });
  };

  // LocalStorage'dan zamanı kontrol eden fonksiyon
  const checkAndAdjustPercentages = () => {
    const lastUpdateTime = localStorage.getItem("lastUpdateTime");
    const now = new Date().getTime();
    const twentyFourHours = 10000; // 24 saat = 86400000 ms

    // Eğer son güncelleme 24 saatten eskiyse yüzdelikleri güncelle ve zamanı localStorage'a kaydet
    if (!lastUpdateTime || now - lastUpdateTime > twentyFourHours) {
      adjustPercentages();
      localStorage.setItem("lastUpdateTime", now); // Zamanı güncelle
    }
  };

  useEffect(() => {
    checkAndAdjustPercentages();
  });

  // Sayfa ilk açıldığında localStorage'daki süreyi kontrol et
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const tokenExpiration = localStorage.getItem("tokenExpiration");
    if (storedUser && tokenExpiration) {
      const now = Date.now();
      if (now < tokenExpiration) {
        setUser(JSON.parse(storedUser)); // Kullanıcıyı state'e yükle
      }
    }
  }, []);

  console.log(selectedGame);
  return (
    <div className="container">
      {user ? (
        <div className="user-container">
          <h2>Merhaba, {user.displayName}!</h2>
          <img src={user.photoURL} alt="Profile" />
          <button onClick={handleRandomGame}>Çevir</button>
          <div className="slot-item">
            <span className="spin">
              {selectedGame && <TypeAnimation
                sequence={[
                  selectedGame.name, // Types 'One'
                  1000,
                  `${selectedGame.name} %${selectedGame.percentage}`,// Deletes 'One' and types 'Two'
                  2000, // Types 'Three' without deleting 'Two'
                  () => {
                    console.log("Sequence completed");
                  },
                ]}
                wrapper="span"
                style={{ fontSize: "2em", display: "inline-block" }}
                repeat={1}
                cursor={false}
              />}
            </span>
          </div>
        </div>
      ) : (
        <div className="login-container">
          <h2>Oranları görmek için giriş yapın</h2>
          <button className="login-button" onClick={signInWithGoogle}>
            Giriş Yap
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
