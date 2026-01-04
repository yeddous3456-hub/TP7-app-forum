// src/stores/events.js
import { defineStore } from 'pinia';
import { ref, get, onValue } from 'firebase/database';
import { db } from '@/firebase/config';

export const useEventsStore = defineStore('events', {
  state: () => ({
    events: [],
    loading: true
  }),

  actions: {
    // Charger tous les événements
    async fetchEvents() {
      try {
        const eventsRef = ref(db, 'events');
        const snapshot = await get(eventsRef);

        if (snapshot.exists()) {
          const eventsData = snapshot.val();
          this.events = Object.keys(eventsData).map(key => ({
            id: key,
            ...eventsData[key]
          }));
        } else {
          this.events = [];
        }
      } catch (error) {
        console.error('Erreur chargement événements:', error);
        this.events = [];
      } finally {
        this.loading = false;
      }
    },

    // Écouter les changements en temps réel
    listenToEvents() {
      const eventsRef = ref(db, 'events');

      onValue(eventsRef, (snapshot) => {
        if (snapshot.exists()) {
          const eventsData = snapshot.val();
          this.events = Object.keys(eventsData).map(key => ({
            id: key,
            ...eventsData[key]
          }));
        } else {
          this.events = [];
        }
        this.loading = false;
      });
    },

    // Récupérer un événement spécifique
    async getEventById(eventId) {
      try {
        const eventRef = ref(db, `events/${eventId}`);
        const snapshot = await get(eventRef);

        if (snapshot.exists()) {
          return {
            id: eventId,
            ...snapshot.val()
          };
        }
        return null;
      } catch (error) {
        console.error('Erreur:', error);
        return null;
      }
    }
  },

  getters: {
    // Événements à venir
    upcomingEvents: (state) => {
      const now = new Date().toISOString();
      return state.events
        .filter(event => event.date > now)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    },

    // Événements passés
    pastEvents: (state) => {
      const now = new Date().toISOString();
      return state.events
        .filter(event => event.date <= now)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  }
});
