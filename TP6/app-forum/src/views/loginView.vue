<!-- src/views/LoginView.vue -->
<template>
  <div class="login-container">
    <h2>{{ isLoginMode ? 'Connexion' : 'Inscription' }}</h2>

    <form @submit.prevent="handleSubmit">
      <div>
        <label>Email universitaire :</label>
        <input
          v-model="email"
          type="email"
          placeholder="prenom.nom@uca.ac.ma ou prenom.nom@ensas.uca.ac.ma"
          required
          :disabled="loading"
        >
      </div>

      <div>
        <label>Mot de passe :</label>
        <input
          v-model="password"
          type="password"
          placeholder="Minimum 6 caractères"
          required
          :disabled="loading"
          minlength="6"
        >
      </div>

      <button type="submit" :disabled="loading" class="submit-btn">
        <span v-if="loading">⏳ Chargement...</span>
        <span v-else>{{ isLoginMode ? 'Se connecter' : 'S\'inscrire' }}</span>
      </button>

      <div v-if="error" class="error-message">
        ⚠️ {{ error }}
      </div>

      <div v-if="successMessage" class="success-message">
        ✅ {{ successMessage }}
      </div>
    </form>

    <button @click="toggleMode" class="toggle-btn" :disabled="loading">
      {{ isLoginMode ? 'Pas de compte UCA/ENSA ? Inscrivez-vous' : 'Déjà un compte ? Connectez-vous' }}
    </button>

    <div class="help-text">
      <p>Formats d'email acceptés :</p>
      <ul>
        <li>prenom.nom@uca.ac.ma</li>
        <li>prenom.nom@ensas.uca.ac.ma</li>
        <li>prenom.nom@etud.uca.ac.ma</li>
      </ul>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();

    const email = ref('');
    const password = ref('');
    const isLoginMode = ref(true);
    const loading = ref(false);
    const error = ref('');
    const successMessage = ref('');

    // Fonction de validation d'email UCA/ENSA
    const isValidEnsaEmail = (email) => {
      const validDomains = [
        '@uca.ac.ma',
        '@etud.uca.ac.ma',
        '@ensas.uca.ac.ma',
        '@uca.ma'
      ];

      const emailLower = email.toLowerCase().trim();
      return validDomains.some(domain => emailLower.endsWith(domain));
    };

    const handleSubmit = async () => {
      // Réinitialiser les messages
      loading.value = true;
      error.value = '';
      successMessage.value = '';

      // Validation basique
      if (!email.value.trim() || !password.value.trim()) {
        error.value = 'Veuillez remplir tous les champs';
        loading.value = false;
        return;
      }

      if (password.value.length < 6) {
        error.value = 'Le mot de passe doit contenir au moins 6 caractères';
        loading.value = false;
        return;
      }

      // ✅ UNIQUEMENT CETTE VALIDATION D'EMAIL
      if (!isValidEnsaEmail(email.value)) {
        error.value = 'Veuillez utiliser votre email universitaire UCA/ENSA (ex: prenom.nom@uca.ac.ma)';
        loading.value = false;
        return;
      }

      try {
        let result;

        if (isLoginMode.value) {
          // Mode CONNEXION
          result = await authStore.signIn(email.value, password.value);
          if (result.success) {
            successMessage.value = 'Connexion réussie ! Redirection...';
            setTimeout(() => router.push('/events'), 1500);
          }
        } else {
          // Mode INSCRIPTION
          result = await authStore.signUp(email.value, password.value);
          if (result.success) {
            successMessage.value = 'Compte créé avec succès ! Vous allez être redirigé...';
            setTimeout(() => router.push('/events'), 2000);
          }
        }

        if (!result.success) {
          // Gestion des erreurs Firebase courantes
          const errorMsg = result.error || 'Une erreur est survenue';

          if (errorMsg.includes('auth/email-already-in-use')) {
            error.value = 'Cet email est déjà utilisé. Connectez-vous ou utilisez un autre email.';
          } else if (errorMsg.includes('auth/user-not-found')) {
            error.value = 'Aucun compte trouvé avec cet email. Inscrivez-vous d\'abord.';
          } else if (errorMsg.includes('auth/wrong-password')) {
            error.value = 'Mot de passe incorrect. Réessayez.';
          } else if (errorMsg.includes('auth/too-many-requests')) {
            error.value = 'Trop de tentatives. Veuillez réessayer plus tard.';
          } else {
            error.value = errorMsg;
          }
        }
      } catch (err) {
        error.value = 'Erreur inattendue. Veuillez réessayer.';
        console.error('Erreur auth:', err);
      } finally {
        loading.value = false;
      }
    };

    const toggleMode = () => {
      isLoginMode.value = !isLoginMode.value;
      error.value = '';
      successMessage.value = '';
      email.value = '';
      password.value = '';
    };

    // Auto-remplissage pour le développement
    const isDevelopment = import.meta.env.DEV;
    if (isDevelopment) {
      email.value = 'test.etudiant@ensas.uca.ac.ma';
      password.value = 'test123';
    }

    return {
      email,
      password,
      isLoginMode,
      loading,
      error,
      successMessage,
      handleSubmit,
      toggleMode
    };
  }
};
</script>

<style scoped>
.login-container {
  max-width: 450px;
  margin: 40px auto;
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 1.8em;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #34495e;
}

input {
  width: 100%;
  padding: 12px 15px;
  margin: 5px 0 20px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #42b883;
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
}

input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.submit-btn {
  background: linear-gradient(135deg, #42b883 0%, #35495e 100%);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s, opacity 0.3s;
  margin-top: 10px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  opacity: 0.95;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.toggle-btn {
  background: transparent;
  color: #42b883;
  border: 2px solid #42b883;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.3s;
}

.toggle-btn:hover:not(:disabled) {
  background: #42b883;
  color: white;
}

.toggle-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  margin: 15px 0;
  border-left: 4px solid #c33;
  font-size: 14px;
}

.success-message {
  background: #e8f7ef;
  color: #2a7a4c;
  padding: 12px;
  border-radius: 8px;
  margin: 15px 0;
  border-left: 4px solid #42b883;
  font-size: 14px;
}

.help-text {
  margin-top: 25px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 13px;
  color: #666;
}

.help-text p {
  margin: 0 0 8px 0;
  font-weight: 600;
}

.help-text ul {
  margin: 0;
  padding-left: 20px;
}

.help-text li {
  margin: 4px 0;
}

/* Responsive */
@media (max-width: 480px) {
  .login-container {
    margin: 20px;
    padding: 20px;
  }

  h2 {
    font-size: 1.5em;
  }
}
</style>
