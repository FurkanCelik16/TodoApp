import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where
} from 'firebase/firestore';

// Firebase konfigürasyonu
const firebaseConfig = {
  apiKey: "AIzaSyAYof0PaTikXpPUonALijMgltjw0CZiMk0",
  authDomain: "todoapp-cdfe7.firebaseapp.com",
  projectId: "todoapp-cdfe7",
  storageBucket: "todoapp-cdfe7.firebasestorage.app",
  messagingSenderId: "874490235986",
  appId: "1:874490235986:web:f281ad6bf3ecf9d600238b"
};

// Firebase uygulamasını başlat
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

// Google ile giriş yapma
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("Giriş yapan kullanıcı:", user);
  } catch (error) {
    console.error("Giriş hatası: ", error.message);
  }
};

// Görev ekleme
export const addTodoToFirestore = async (todoText, todoDate) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Kullanıcı giriş yapmamış");

  try {
    const docRef = await addDoc(collection(db, "todos"), {
      text: todoText,
      completed: false,
      dueDate: Timestamp.fromDate(todoDate),
      createdAt: Timestamp.now(),
      userId: user.uid
    });
    console.log("Yeni görev Firestore'a eklendi: ", docRef.id);
  } catch (error) {
    console.error("Görev eklerken hata oluştu: ", error);
    throw new Error("Görev eklenemedi");
  }
};

// Kullanıcıya ait görevleri getirme
export const getTodosFromFirestore = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("Kullanıcı giriş yapmamış");

  const todosRef = collection(db, "todos");
  const q = query(todosRef, where("userId", "==", user.uid));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Görev silme
export const deleteTodoFromFirestore = async (id) => {
  try {
    const todoRef = doc(db, "todos", id);
    await deleteDoc(todoRef);
    console.log("Görev Firestore'dan silindi: ", id);
  } catch (error) {
    console.error("Görev silinirken hata oluştu: ", error);
    throw new Error("Görev silinemedi");
  }
};

// Görev güncelleme (🔥 metin + tarih)
export const updateTodoInFirestore = async (id, updatedTodo) => {
  try {
    const todoRef = doc(db, "todos", id);
    await updateDoc(todoRef, {
      text: updatedTodo.text,
      dueDate: Timestamp.fromDate(updatedTodo.dueDate)
    });
    console.log("Görev Firestore'da güncellendi: ", id);
  } catch (error) {
    console.error("Görev güncellenirken hata oluştu: ", error);
    throw new Error("Görev güncellenemedi");
  }
};

// Tamamlandı durumu güncelleme
export const toggleTodoInFirestore = async (id, updatedTodo) => {
  try {
    const todoRef = doc(db, "todos", id);
    await updateDoc(todoRef, { completed: updatedTodo.completed });
    console.log("Görev tamamlandı durumu güncellendi: ", id);
  } catch (error) {
    console.error("Görev tamamlanırken hata oluştu: ", error);
    throw new Error("Görev tamamlanamadı");
  }
};

export { auth, provider, db };
