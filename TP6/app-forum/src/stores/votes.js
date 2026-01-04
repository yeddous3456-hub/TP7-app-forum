// src/stores/votes.js
import { defineStore } from 'pinia';
import { ref, set, get, onValue, update } from 'firebase/database';
import { db } from '@/firebase/config';

export const useVotesStore = defineStore('votes', {
  state: () => ({
    userVotes: [], // Votes de l'utilisateur connecté
    allVotes: []   // Tous les votes (admin seulement)
  }),

  actions: {
    // Ajouter un vote
    async addVote(voteData) {
      try {
        const voteId = `${voteData.eventId}_${voteData.userId}`;
        const voteRef = ref(db, `votes/${voteId}`);

        // Vérifier si l'utilisateur a déjà voté
        const existingVote = await get(voteRef);
        if (existingVote.exists()) {
          return false; // Déjà voté
        }

        // Ajouter le vote
        await set(voteRef, {
          ...voteData,
          timestamp: new Date().toISOString()
        });

        // Mettre à jour les compteurs de l'événement
        await this.updateEventCounters(voteData.eventId, voteData.vote);

        return true;
      } catch (error) {
        console.error('Erreur ajout vote:', error);
        return false;
      }
    },

    // Mettre à jour les compteurs d'un événement
    async updateEventCounters(eventId, voteType) {
      try {
        const eventRef = ref(db, `events/${eventId}`);
        const eventSnapshot = await get(eventRef);

        if (eventSnapshot.exists()) {
          const event = eventSnapshot.val();
          const updates = {};

          if (voteType === 'yes') {
            updates['yesVotes'] = (event.yesVotes || 0) + 1;
          } else {
            updates['noVotes'] = (event.noVotes || 0) + 1;
          }

          updates['updatedAt'] = new Date().toISOString();

          await update(eventRef, updates);
        }
      } catch (error) {
        console.error('Erreur mise à jour compteurs:', error);
      }
    },

    // Écouter les votes de l'utilisateur
    listenToUserVotes(userId) {
      if (!userId) return;

      const userVotesRef = ref(db, 'votes');

      onValue(userVotesRef, (snapshot) => {
        if (snapshot.exists()) {
          const votesData = snapshot.val();
          this.userVotes = Object.keys(votesData)
            .filter(key => votesData[key].userId === userId)
            .map(key => ({
              id: key,
              ...votesData[key]
            }));
        } else {
          this.userVotes = [];
        }
      });
    },

    // Récupérer tous les votes (admin)
    async fetchAllVotes() {
      try {
        const votesRef = ref(db, 'votes');
        const snapshot = await get(votesRef);

        if (snapshot.exists()) {
          const votesData = snapshot.val();
          this.allVotes = Object.keys(votesData).map(key => ({
            id: key,
            ...votesData[key]
          }));
        }
      } catch (error) {
        console.error('Erreur récupération votes:', error);
      }
    }
  },

  getters: {
    // Nombre total de votes par événement
    eventVoteCount: (state) => (eventId) => {
      return state.allVotes.filter(vote => vote.eventId === eventId).length;
    },

    // Pourcentage de votes "oui" par événement
    eventYesPercentage: (state) => (eventId) => {
      const eventVotes = state.allVotes.filter(vote => vote.eventId === eventId);
      if (eventVotes.length === 0) return 0;

      const yesVotes = eventVotes.filter(vote => vote.vote === 'yes').length;
      return Math.round((yesVotes / eventVotes.length) * 100);
    }
  }
});
