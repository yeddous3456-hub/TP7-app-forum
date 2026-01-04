// src/stores/auth.js
import { defineStore } from 'pinia';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { auth } from '@/firebase/config';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: true
  }),

  actions: {
    // Inscription
    async signUp(email, password) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        this.user = userCredential.user;
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Connexion
    async signIn(email, password) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        this.user = userCredential.user;
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Déconnexion
    async logout() {
      try {
        await signOut(auth);
        this.user = null;
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },

    // Écouter les changements d'état
    init() {
      onAuthStateChanged(auth, (user) => {
        this.user = user;
        this.loading = false;
      });
    }
  },

  getters: {
    isAuthenticated: (state) => !!state.user,
    userEmail: (state) => state.user?.email,
    isAdmin: (state) => state.user?.email?.endsWith('@ensas.uca.ma') // Exemple
  }
});
