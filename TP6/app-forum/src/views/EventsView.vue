<!-- src/views/EventsView.vue -->
<template>
  <div class="events-container">
    <h1>Événements ENSA Safi</h1>

    <div v-if="authStore.loading || eventsStore.loading" class="loading">
      Chargement...
    </div>

    <div v-else>
      <!-- En-tête avec info utilisateur -->
      <div class="user-info">
        <p>Connecté en tant que: <strong>{{ authStore.userEmail }}</strong></p>
        <button @click="handleLogout">Déconnexion</button>
      </div>

      <!-- Liste des événements -->
      <div class="events-list">
        <h2>Événements à venir ({{ upcomingEvents.length }})</h2>

        <div v-if="upcomingEvents.length === 0">
          <p>Aucun événement à venir.</p>
        </div>

        <div v-else class="events-grid">
          <div v-for="event in upcomingEvents" :key="event.id" class="event-card">
            <h3>{{ event.title }}</h3>
            <p>{{ event.description }}</p>

            <div class="event-details">
              <p><strong>Date:</strong> {{ formatDate(event.date) }}</p>
              <p><strong>Prix:</strong> {{ event.isFree ? 'Gratuit' : event.price + ' DH' }}</p>
            </div>

            <!-- Système de vote -->
            <div class="voting-section">
              <div class="vote-stats">
                <span class="yes">👍 {{ event.yesVotes || 0 }} Oui</span>
                <span class="no">👎 {{ event.noVotes || 0 }} Non</span>
              </div>

              <div v-if="!hasVotedForEvent(event.id)" class="vote-buttons">
                <button @click="vote(event.id, 'yes')" class="btn-yes">Voter Oui</button>
                <button @click="vote(event.id, 'no')" class="btn-no">Voter Non</button>
              </div>
              <div v-else class="already-voted">
                ✅ Vous avez déjà voté
              </div>
            </div>
          </div>
        </div>

        <!-- Événements passés -->
        <h2>Événements passés ({{ pastEvents.length }})</h2>
        <div v-for="event in pastEvents" :key="event.id + '_past'" class="past-event">
          <h3>{{ event.title }}</h3>
          <p>Résultats: {{ event.yesVotes || 0 }} 👍 / {{ event.noVotes || 0 }} 👎</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth';
import { useEventsStore } from '@/stores/events';
import { useVotesStore } from '@/stores/votes';
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const authStore = useAuthStore();
    const eventsStore = useEventsStore();
    const votesStore = useVotesStore();
    const router = useRouter();

    // Initialiser les stores
    onMounted(() => {
      eventsStore.listenToEvents();
      votesStore.listenToUserVotes(authStore.user?.uid);
    });

    // Computed properties
    const upcomingEvents = computed(() => eventsStore.upcomingEvents);
    const pastEvents = computed(() => eventsStore.pastEvents);

    // Méthodes
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const hasVotedForEvent = (eventId) => {
      return votesStore.userVotes.some(vote => vote.eventId === eventId);
    };

    const vote = async (eventId, voteType) => {
      if (!authStore.user) {
        router.push('/login');
        return;
      }

      const success = await votesStore.addVote({
        eventId: eventId,
        userId: authStore.user.uid,
        vote: voteType
      });

      if (success) {
        alert(`Votre vote "${voteType}" a été enregistré !`);
      } else {
        alert('Erreur lors du vote. Vous avez peut-être déjà voté.');
      }
    };

    const handleLogout = async () => {
      await authStore.logout();
      router.push('/');
    };

    return {
      authStore,
      eventsStore,
      upcomingEvents,
      pastEvents,
      formatDate,
      hasVotedForEvent,
      vote,
      handleLogout
    };
  }
};
</script>

<style scoped>
.events-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.user-info {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.event-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.event-details {
  margin: 15px 0;
  color: #666;
}

.voting-section {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.vote-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 10px;
}

.yes { color: green; font-weight: bold; }
.no { color: red; font-weight: bold; }

.vote-buttons {
  display: flex;
  gap: 10px;
}

.btn-yes {
  flex: 1;
  background: green;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-no {
  flex: 1;
  background: red;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
}

.already-voted {
  text-align: center;
  color: green;
  font-weight: bold;
}

.past-event {
  background: #f9f9f9;
  padding: 10px;
  margin: 10px 0;
  border-radius: 4px;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 1.2em;
}
</style>
