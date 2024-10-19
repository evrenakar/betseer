import React, { useState, useEffect } from "react";
import { auth, provider, signInWithPopup } from "./firebase";
import { TypeAnimation } from "react-type-animation";
import "./App.css";
import data from "./data.json";
import Logo from "./assets/logo1.png";

function App() {
  const [user, setUser] = useState(null);
  const [gameData, setGameData] = useState(data);
  const [selectedGame, setSelectedGame] = useState(null);
  const [disabled, setDisabled] = useState(false);
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
    setDisabled(true);
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
    const twentyFourHours = 86400000; // 24 saat = 86400000 ms

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
      <img width={360} src={Logo} className="logo" alt="Logo" />
      {user ? (
        <div className="user-container">
          <h2>Merhaba, {user.displayName}!</h2>
          {/* <img src={user.photoURL} alt="Profile" /> */}
          <button className="login-button" onClick={handleRandomGame} disabled={disabled}>Şansını Dene!</button>
          {selectedGame && <div className="slot-item">
            <span className="spin">
              <TypeAnimation
                sequence={[
                  selectedGame.name, // Types 'One'
                  1000,
                  `${selectedGame.name} / Şansın: %${selectedGame.percentage}`,// Deletes 'One' and types 'Two'
                  () => {
                    setDisabled(false);
                  },
                ]}
                wrapper="span"
                style={{ fontSize: "1.5em", display: "inline-block" }}
                repeat={false}
                cursor={false}
                key={selectedGame.name}
              />
            </span>
          </div>}
          <p className="info">Buradaki verilerin tamamı casinolardaki müşteri sayıları ve kazanma oranlarına göre tahmin edilmektedir.</p>
        </div>
      ) : (
        <div className="login-container">
          <h2>Kazanma İhtimalini Görmek İçin</h2>
          <button className="login-button" onClick={signInWithGoogle}>
            Giriş Yap
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
