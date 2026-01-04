<!-- src/views/HomeView.vue -->
<template>
  <div class="home-container">
    <div class="hero">
      <h1>Bienvenue sur ENSA Vote</h1>
      <p>La plateforme de vote des étudiants de l'ENSA Safi</p>

      <div class="cta-buttons">
        <router-link to="/login" class="btn-primary">
          Commencer à voter
        </router-link>
        <router-link to="/events" class="btn-secondary" v-if="authStore.isAuthenticated">
          Voir les événements
        </router-link>
      </div>
    </div>

    <div class="features">
      <div class="feature">
        <h3>🗳️ Votez simplement</h3>
        <p>Donnez votre avis sur les événements de l'école en un clic</p>
      </div>
      <div class="feature">
        <h3>👥 Résultats en direct</h3>
        <p>Suivez les résultats des votes en temps réel</p>
      </div>
      <div class="feature">
        <h3>🔐 Sécurisé</h3>
        <p>Authentification avec votre email ENSA uniquement</p>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth';

export default {
  setup() {
    const authStore = useAuthStore();

    return {
      authStore
    };
  }
};
</script>

<style scoped>
.home-container {
  text-align: center;
  padding: 50px 20px;
}

.hero {
  max-width: 800px;
  margin: 0 auto 50px;
}

.hero h1 {
  font-size: 3em;
  color: #2c3e50;
  margin-bottom: 20px;
}

.hero p {
  font-size: 1.2em;
  color: #666;
  margin-bottom: 30px;
}

.cta-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.btn-primary, .btn-secondary {
  padding: 15px 30px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  transition: transform 0.2s;
}

.btn-primary {
  background: #42b883;
  color: white;
}

.btn-secondary {
  background: #35495e;
  color: white;
}

.btn-primary:hover, .btn-secondary:hover {
  transform: translateY(-2px);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  max-width: 1000px;
  margin: 0 auto;
}

.feature {
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: white;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.feature h3 {
  color: #42b883;
  margin-bottom: 10px;
}
</style>
