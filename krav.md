## Funksjonelle Krav:

- [ ] Anonyme brukere skal se de siste innleggene og reaksjoner (emojis) når de kommer til nettsiden
- Brukere kan logge seg inn. brukere skal kunne registrere med brukernavn og passord (anbefales ikke) eller logge inn
  med google eller Entra ID
  - [x] Logge seg inn med bruker navn og passord
  - [x] Logge seg inn med google
- [ ] En bruker som er logget inn kan se på sin profilside
- [x] Brukere skal forbli pålogget når de refresher websiden (cookies)
- [ ] En bruker som er logget inn kan klikke på et innlegg for hvem som har reagert på innlegget og kommentarer.
      Detaljene skal inkludere en overskrift, tekst, navn, bilde(om tilgjengelig) på den som publiserte det
- [ ] Brukere kan publisere nye inlegg. innlegg kan være mellom 10 ord og 1000 tegn
- [ ] Systemet hindrer en bruker fra å publisere mer enn 5 innlegg innenfor en time
- [ ] Brukeren skal forhindres fra å sende inn en nyhetsartikkel som mangler tekst
- [ ] En bruker skal kunne redigere et innlegg de selv har publisert
- [ ] en bruker skal kunne slette et innlegg de selv har publisert
- [ ] Brukere skal reagere på andres innlegg med en av flere emojis
- [ ] **Valgfritt**: Brukere kan legge til kommentarer til andres innlegg
- [ ] **Valgfritt**: Brukere kan legge til andre brukere som venner
- [ ] Alle feil fra server skal presenteres til en bruker på en pen måte, med mulighet for brukeren til å prøve igjen

## Må-Krav til teknisk løsning

- [ ] Besvarelsen skal inneholde en Readme-fil med link til heroku og test coverage
- [ ] _npm start_ skal starte server og klient (concurrently og vite)
- [ ] _npm test_ skal kjøre tester. testene skal ikke feile. Vitest anbefales
- [ ] koden skal ha konsistent formattering. Prettier og husky anbefales
- [ ] nettsidene skal ha god layout med CSS Grid og horisontal navigasjonsmeny. Brukeren må kunne navigere overalt uten
      å bruke "back" eller redigere URL
- [ ] Serveren validerer at brukeren er logget inn
- [ ] innleveringen skal være i form av en zip fil. maks størrelse på fila er 1MB
- [ ] Data lagres i MongoDB
- [ ] Applikasjonen skal deployes til Heroku
- [ ] Testene skal kjøre på github actions

## Bør-krav til teknisk løsning

\*[ ] Brukere kan logge seg på med mer enn en OpenID Connect Provider (for eksempel Entra ID, Facebook, LinkedIn, Github)
