// App.js
import React, { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { signInWithGoogle, auth } from './firebase';
import TodoPage from './TodoPage';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Kullanıcıyı dinle (sayfa yenilense bile kullanıcıyı kaybetme)
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        navigate('/todo-list');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Google ile giriş başarısız", error.message);
      toast.error("Giriş başarısız!");
    }
  };

  return (
    <div className="App">

      <div className="login-header">
        <div className="left-side">
          <img src="/logo.png" alt="Logo" className="logo" />
        </div>
        <div className="right-side">
          <div className="welcome-title">To-Do List'e Hoşgeldiniz
            <p style={{ fontWeight: 'normal' }}>Yapılacak işlerini kaydet,düzenle ve listele!</p></div>
          <img src="/google.png" alt="Google Logo" className="google-logo" />
          <button className="login-button" onClick={handleGoogleLogin}>
            Google ile Giriş Yap
          </button>
        </div>

      </div>
      <ToastContainer />
    </div>
  );

}


function MainApp() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/todo-list" element={<TodoPage />} />
      </Routes>
    </Router>
  );
}

export default MainApp;
