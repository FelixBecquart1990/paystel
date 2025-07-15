<script setup>
import countries from '@/data/pays.json'
import totals from '@/data/totals.json'
import { mdiAccountGroup, mdiCalendar, mdiDelete, mdiEarth, mdiFlag, mdiInformation, mdiMagnify, mdiMapMarker, mdiMapMarkerRadius, mdiParking, mdiPlus } from '@mdi/js'
import { computed, onMounted, ref } from 'vue'

// Reactive data
const dialog = ref(false)
const selectedCountry = ref(null)
const selectedYear = ref(new Date().getFullYear())
const visitedPlaces = ref([])
const userBirthYear = ref(null)
const showBirthYearInput = ref(true)

// Available years (from 1950 to current year)
const availableYears = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let year = currentYear;year >= 1950;year--) {
    years.push(year)
  }
  return years
})

// Sort countries alphabetically
const sortedCountries = computed(() => {
  return countries
    .filter(country => country.nom) // Filter out entries without names
    .sort((a, b) => a.nom.localeCompare(b.nom))
})

// Sort visited places by year (most recent first), then by name
const sortedVisitedPlaces = computed(() => {
  return visitedPlaces.value
    .slice()
    .sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year // Most recent year first
      }
      return a.country.nom.localeCompare(b.country.nom)
    })
})

// Statistics
const uniqueCountries = computed(() => {
  const countries = new Set(visitedPlaces.value.map(v => v.country.nom))
  return countries.size
})

const uniqueYears = computed(() => {
  const years = new Set(visitedPlaces.value.map(v => v.year))
  return years.size
})

// Paystel indicator: number of countries visited divided by user age
const paystelIndicator = computed(() => {
  if (!userBirthYear.value || userBirthYear.value <= 0) return 0
  const currentAge = new Date().getFullYear() - userBirthYear.value
  if (currentAge <= 0) return 0
  return (uniqueCountries.value / currentAge).toFixed(2).replace('.', ',')
})

// Population ratio: visited countries population / world population (%)
const populationRatio = computed(() => {
  const uniqueCountries = new Set()
  const visitedPopulation = visitedPlaces.value
    .filter(v => v.country.état && v.country.population)
    .reduce((total, visit) => {
      // Only count each country once
      if (!uniqueCountries.has(visit.country.nom)) {
        uniqueCountries.add(visit.country.nom)
        return total + visit.country.population
      }
      return total
    }, 0)

  return totals.populationsQuantité > 0 ?
    Math.round((visitedPopulation / totals.populationsQuantité) * 100) : 0
})

// Area ratio: visited countries area / world area (%)
const areaRatio = computed(() => {
  const uniqueCountries = new Set()
  const visitedArea = visitedPlaces.value
    .filter(v => v.country.état && v.country['km²'])
    .reduce((total, visit) => {
      // Only count each country once
      if (!uniqueCountries.has(visit.country.nom)) {
        uniqueCountries.add(visit.country.nom)
        return total + visit.country['km²']
      }
      return total
    }, 0)

  return totals.supérficiesQuantité > 0 ?
    Math.round((visitedArea / totals.supérficiesQuantité) * 100) : 0
})

// Calculate current age
const currentAge = computed(() => {
  if (!userBirthYear.value) return 0
  return new Date().getFullYear() - userBirthYear.value
})

// Load visited places from localStorage
const loadVisitedPlaces = () => {
  const stored = localStorage.getItem('visitedPlaces')
  if (stored) {
    try {
      visitedPlaces.value = JSON.parse(stored)
    } catch (error) {
      console.error('Error loading visited places:', error)
      visitedPlaces.value = []
    }
  }
}

// Load user age from localStorage
const loadUserAge = () => {
  const stored = localStorage.getItem('userBirthYear')
  if (stored) {
    try {
      userBirthYear.value = parseInt(stored)
      showBirthYearInput.value = false // Hide input if birth year is already set
    } catch (error) {
      console.error('Error loading user birth year:', error)
      userBirthYear.value = null
    }
  }
}

// Save visited places to localStorage
const saveVisitedPlaces = () => {
  localStorage.setItem('visitedPlaces', JSON.stringify(visitedPlaces.value))
}

// Save user age to localStorage
const saveUserAge = () => {
  if (userBirthYear.value && userBirthYear.value >= 1900 && userBirthYear.value <= new Date().getFullYear()) {
    localStorage.setItem('userBirthYear', userBirthYear.value.toString())
    showBirthYearInput.value = false // Hide input after saving
  }
}

// Show birth year input
const showBirthYearInputField = () => {
  showBirthYearInput.value = true
}

// Add a new visited place
const addVisit = () => {
  if (!selectedCountry.value) return

  const newVisit = {
    id: Date.now(),
    country: selectedCountry.value,
    year: selectedYear.value,
    addedAt: new Date().toISOString()
  }

  // Check if already visited in the same year
  const alreadyExists = visitedPlaces.value.some(
    visit => visit.country.nom === selectedCountry.value.nom && visit.year === selectedYear.value
  )

  if (alreadyExists) {
    alert('Vous avez déjà ajouté ce pays pour cette année !')
    return
  }

  visitedPlaces.value.push(newVisit)
  saveVisitedPlaces()

  // Reset form
  selectedCountry.value = null
  selectedYear.value = new Date().getFullYear()
  dialog.value = false
}

// Remove a visited place
const removeVisit = (visitId) => {
  visitedPlaces.value = visitedPlaces.value.filter(visit => visit.id !== visitId)
  saveVisitedPlaces()
}

// Open dialog
const openDialog = () => {
  dialog.value = true
}

// Close dialog
const closeDialog = () => {
  dialog.value = false
  selectedCountry.value = null
  selectedYear.value = new Date().getFullYear()
}

// Initialize on component mount
onMounted(() => {
  loadVisitedPlaces()
  loadUserAge()
})
</script>

<template>
  <div class="travel-app">
    <v-container fluid class="pa-6">
      <v-row justify="center">
        <v-col cols="12" lg="8" xl="6">
          <!-- Header Section -->
          <div class="text-center mb-10 mt-6">
            <!-- <v-icon size="48" color="primary" class="mb-3">{{ mdiEarth }}</v-icon> -->
            <h1 class="text-h3 font-weight-light mb-2 text-primary">Paystel</h1>
            <p class="text-h6 text-grey-darken-1 font-weight-light">Suivez vos aventures à travers le monde</p>

            <!-- Age Input -->
            <div v-if="showBirthYearInput && visitedPlaces.length" class="mt-6 d-flex justify-center">
              <v-card class="pa-4" elevation="2" rounded="xl" max-width="400">
                <div class="text-center mb-4">
                  <v-icon size="24" color="info" class="mb-2">{{ mdiInformation }}</v-icon>
                  <p class="text-body-2 text-grey-darken-1 mb-3">
                    Pour afficher votre <strong>Indicateur Paystel</strong>, renseignez votre année de naissance.
                  </p>
                  <p class="text-body-2 text-grey mb-0">
                    <em>Calcul : Nombre de pays visités ÷ Âge actuel</em>
                  </p>
                </div>
                <v-text-field v-model.number="userBirthYear" label="Année de naissance" type="number" variant="outlined"
                  rounded="lg" :min="1900" :max="new Date().getFullYear()" hide-details="auto" class="age-input mb-4" />
                <div class="text-center">
                  <v-btn color="primary" variant="elevated" rounded="lg"
                    :disabled="!userBirthYear || userBirthYear < 1900 || userBirthYear > new Date().getFullYear()"
                    @click="saveUserAge">
                    Enregistrer
                  </v-btn>
                </div>
              </v-card>
            </div>
          </div>

          <!-- Stats Cards -->
          <v-row v-if="visitedPlaces.length > 0" class="mb-6">
            <v-col cols="12" md="4">
              <v-card class="text-center pa-4" elevation="2" rounded="xl" style="position: relative;">
                <v-btn icon size="x-small" variant="text" color="info" style="position: absolute; top: 8px; right: 8px;"
                  @click="showBirthYearInputField">
                  <v-icon size="16">{{ mdiInformation }}</v-icon>
                </v-btn>
                <v-icon size="32" color="info" class="mb-2">{{ mdiParking }}</v-icon>
                <div class="text-h4 font-weight-bold text-grey-darken-1">
                  {{ userBirthYear ? paystelIndicator : '?' }}
                </div>
                <div class="text-body-2 text-grey-darken-1">Indicateur Paystel</div>
                <div v-if="userBirthYear" class="text-caption text-grey mt-1">
                  {{ uniqueCountries }} pays ÷ {{ currentAge }} ans
                </div>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card class="text-center pa-4" elevation="2" rounded="xl">
                <v-icon size="32" color="success" class="mb-2">{{ mdiFlag }}</v-icon>
                <div class="text-h4 font-weight-bold text-grey-darken-1">{{ uniqueCountries }}</div>
                <div class="text-body-2 text-grey-darken-1">Pays & Territoires</div>
              </v-card>
            </v-col>
            <v-col cols="6" md="4">
              <v-card class="text-center pa-4" elevation="2" rounded="xl">
                <v-icon size="32" color="orange" class="mb-2">{{ mdiAccountGroup }}</v-icon>
                <div class="text-h4 font-weight-bold text-grey-darken-1">{{ populationRatio }}%</div>
                <div class="text-body-2 text-grey-darken-1">Ratio Population</div>
              </v-card>
            </v-col>
            <v-col cols="6" md="4">
              <v-card class="text-center pa-4" elevation="2" rounded="xl">
                <v-icon size="32" color="purple" class="mb-2">{{ mdiMapMarkerRadius }}</v-icon>
                <div class="text-h4 font-weight-bold text-grey-darken-1">{{ areaRatio }}%</div>
                <div class="text-body-2 text-grey-darken-1">Ratio Superficie</div>
              </v-card>
            </v-col>
          </v-row>

          <!-- Visited Places List -->
          <div v-if="visitedPlaces.length === 0" class="empty-state">
            <v-card class="text-center pa-12" elevation="0" color="grey-lighten-5" rounded="xl">
              <v-icon size="80" color="grey-lighten-1" class="mb-4">{{ mdiEarth }}</v-icon>
              <h3 class="text-h5 text-grey-darken-1 mb-3 font-weight-medium">Prêt pour votre première aventure ?</h3>
              <p class="text-body-1 text-grey mb-6">Commencez à construire vos souvenirs de voyage en ajoutant votre
                première destination
              </p>
              <v-btn color="primary" size="large" rounded="pill" @click="openDialog">
                Ajouter
              </v-btn>
            </v-card>
          </div>

          <v-card v-else elevation="3" rounded="xl" class="overflow-hidden mb-16">
            <v-card-title class="pa-6 pb-4">
              <div class="d-flex align-center">
                <v-icon class="mr-3" color="primary">{{ mdiMapMarker }}</v-icon>
                <span class="text-h5 font-weight-medium">{{ visitedPlaces.length > 1 ? 'Voyages' : 'Voyage' }}</span>
                <v-spacer></v-spacer>
                <v-chip variant="tonal" color="primary" size="small">
                  {{ visitedPlaces.length }} {{ visitedPlaces.length === 1 ? 'lieu' : 'lieux' }}
                </v-chip>
              </div>
            </v-card-title>

            <v-divider></v-divider>

            <v-list class="pa-0">
              <v-list-item v-for="(visit, index) in sortedVisitedPlaces" :key="visit.id" class="visit-item pa-6"
                :class="{ 'border-bottom': index < sortedVisitedPlaces.length - 1 }">


                <div class="flex-grow-1 ml-4">
                  <v-list-item-title class="text-h6 font-weight-medium mb-1">
                    {{ visit.country.nom }}
                  </v-list-item-title>

                  <div class="d-flex flex-wrap gap-2 mb-2">
                    <v-chip size="small" class="mr-2" variant="tonal" color="primary" :prepend-icon="mdiCalendar">
                      {{ visit.year }}
                    </v-chip>
                    <v-chip size="small" :color="visit.country.état ? 'success' : 'warning'" variant="flat">
                      {{ visit.country.état ? 'Pays' : 'Territoire' }}
                    </v-chip>
                  </div>

                  <div v-if="visit.country.population" class="text-body-2 text-grey-darken-1">
                    Population : {{ visit.country.population.toLocaleString('fr-FR') }}
                  </div>
                </div>

                <template #append>
                  <v-btn icon size="small" variant="text" color="error" class="delete-btn"
                    @click="removeVisit(visit.id)">
                    <v-icon size="20">{{ mdiDelete }}</v-icon>
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Floating Action Button -->
    <v-btn v-if="visitedPlaces.length" color="primary" icon style="position: fixed; bottom: 16px; right: 16px;z-index:1"
      size="large" class="fab-custom" @click="openDialog">
      <v-icon size="28">{{ mdiPlus }}</v-icon>
    </v-btn>

    <!-- Add Visit Dialog -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card rounded="xl" elevation="8">
        <v-card-title class="pa-6 pb-4">
          <div class="d-flex align-center">
            <span class="text-h5 font-weight-medium">Ajouter un voyage</span>
          </div>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="pa-6">
          <v-form @submit.prevent="addVisit">
            <v-autocomplete v-model="selectedCountry" :items="sortedCountries" item-title="nom" item-value="nom"
              label="Destination" placeholder="
              Pays ou territoire..." variant="outlined" class="mb-6" return-object required rounded="lg"
              hide-details="auto" :prepend-inner-icon="mdiMagnify" :menu-props="{ maxHeight: 180 }">
              <template #item="{ props, item }">
                <v-list-item v-bind="props" class="pa-3">
                  <v-list-item-subtitle>
                    <v-chip size="x-small" class="mt-1" :color="item.raw.état ? 'success' : 'warning'" variant="flat">
                      {{ item.raw.état ? 'Pays' : 'Territoire' }}
                    </v-chip>
                  </v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-autocomplete>

            <v-select v-model="selectedYear" :items="availableYears" label="Année de visite" variant="outlined" required
              rounded="lg" hide-details="auto" :prepend-inner-icon="mdiCalendar" />
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-6">
          <v-spacer />
          <v-btn variant="text" size="large" @click="closeDialog" class="mr-3" rounded="lg">
            Annuler
          </v-btn>
          <v-btn color="primary" variant="elevated" size="large" :disabled="!selectedCountry" @click="addVisit"
            rounded="lg">
            Ajouter
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.travel-app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-attachment: fixed;
  position: relative;
}

.travel-app::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.v-container {
  position: relative;
  z-index: 1;
}

/* Glassmorphism Cards */
.v-card {
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.v-card:hover {
  background: rgba(255, 255, 255, 0.15) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
  transform: translateY(-2px) !important;
}

/* Stats Cards */
.v-card.text-center {
  background: rgba(255, 255, 255, 0.12) !important;
  border: 1px solid rgba(255, 255, 255, 0.25) !important;
}

.v-card.text-center:hover {
  background: rgba(255, 255, 255, 0.18) !important;
  transform: translateY(-4px) scale(1.02) !important;
}

/* Empty State Card */
.empty-state .v-card {
  background: rgba(255, 255, 255, 0.08) !important;
  border: 2px dashed rgba(255, 255, 255, 0.3) !important;
  backdrop-filter: blur(15px) !important;
}

/* Visit Items */
.visit-item {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 0 !important;
}

.visit-item:hover {
  background: rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(10px);
}

.border-bottom {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}

/* Avatars with glassmorphism */
.v-avatar {
  background: rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
}

/* Chips with glassmorphism */
.v-chip {
  background: rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(10px) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

.v-chip.v-chip--variant-flat {
  background: rgba(var(--v-theme-surface), 0.2) !important;
  color: rgba(255, 255, 255, 0.95) !important;
}

.v-chip.v-chip--variant-tonal {
  background: rgba(var(--v-theme-primary), 0.2) !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

/* Delete button */
.delete-btn {
  opacity: 0.6;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

.delete-btn:hover {
  opacity: 1;
  background: rgba(244, 67, 54, 0.2) !important;
  border: 1px solid rgba(244, 67, 54, 0.3) !important;
}

.visit-item:hover .delete-btn {
  opacity: 1;
}

/* Floating Action Button */
.fab-custom {
  background: rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2) !important;
}

.fab-custom:hover {
  background: rgba(255, 255, 255, 0.25) !important;
  transform: scale(1.05) !important;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25) !important;
}

/* Dialog glassmorphism with gradient background */
.v-dialog .v-card {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%) !important;
  backdrop-filter: blur(25px) !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2) !important;
  position: relative;
}

.v-dialog .v-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
  border-radius: inherit;
}

/* Form inputs with glassmorphism */
.v-field {
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

.v-field:hover {
  background: rgba(255, 255, 255, 0.15) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
}

.v-field--focused {
  background: rgba(255, 255, 255, 0.2) !important;
  border: 2px solid rgba(var(--v-theme-primary), 0.5) !important;
}

/* Age input specific styling */
.age-input .v-field {
  background: rgba(255, 255, 255, 0.08) !important;
}

.age-input .v-field:hover {
  background: rgba(255, 255, 255, 0.12) !important;
}

/* Info button styling */
.v-btn.v-btn--size-x-small {
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  opacity: 0.7;
  transition: all 0.3s ease;
}

.v-btn.v-btn--size-x-small:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  opacity: 1;
  transform: scale(1.1);
}

/* Buttons with glassmorphism */
.v-btn.v-btn--variant-elevated {
  background: rgba(var(--v-theme-primary), 0.8) !important;
  backdrop-filter: blur(15px) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: white !important;
}

.v-btn.v-btn--variant-elevated:hover {
  background: rgba(var(--v-theme-primary), 0.9) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 25px rgba(var(--v-theme-primary), 0.3) !important;
}

.v-btn.v-btn--variant-text {
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: rgba(255, 255, 255, 0.9) !important;
}

.v-btn.v-btn--variant-text:hover {
  background: rgba(255, 255, 255, 0.2) !important;
}

/* Typography adjustments for better contrast */
.text-primary {
  color: rgba(255, 255, 255, 0.95) !important;
}

.text-grey-darken-1 {
  color: rgba(255, 255, 255, 0.8) !important;
}

.text-grey {
  color: rgba(255, 255, 255, 0.7) !important;
}

.v-list-item-title,
.v-list-item-subtitle {
  color: rgba(255, 255, 255, 0.9) !important;
}

/* List with glassmorphism */
.v-list {
  background: transparent !important;
}

/* Icons adjustments */
.v-icon {
  color: rgba(255, 255, 255, 0.9) !important;
}

/* Animation */
.empty-state {
  animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Dividers */
.v-divider {
  border-color: rgba(255, 255, 255, 0.12) !important;
}

/* Card titles */
.v-card-title {
  color: rgba(255, 255, 255, 0.95) !important;
}

/* Scrollbar styling for webkit browsers */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  backdrop-filter: blur(10px);
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}
</style>