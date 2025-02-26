
![Tests](https://github.com/kristiania-pg6301-2023/pg6301-reexam-Mariusflores/actions/workflows/tests.yml/badge.svg)
![Deploy to Heroku](https://github.com/kristiania-pg6301-2023/pg6301-reexam-Mariusflores/actions/workflows/deploy.yml/badge.svg)

[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/nHPSu_dn)

* [Heroku App](https://pg-socialmedia-23bbe72a4666.herokuapp.com/)
* [Github Repo](https://github.com/kristiania-pg6301-2023/pg6301-reexam-Mariusflores)

#### icons created by Freepik - Flaticon

```
npm test 
```
*kjører tester med coverage*
```
npm run dev
```
*Kjører programmet i dev modus med nodemon*
```
npm run build 
```
*Bygger programmet*

```
npm start 
```
*Kjører programmet med node server.js*



### Om prosjektet

#### Workflows
Prosjektet tar i bruk CI/CD med github actions workflows. Det er 2 workflows en for å kjøre koden og en annen for å deploye til heroku som ikke settes i gang før testene har kjørt uten feil.
Workflow deployment til heroku skjer med akhileshns/heroku-deploy@v3.14.15 uten docker.

#### Heroku
Prosjektet kjører på Heroku og er tilgjengelig med linken over

#### Husky, Eslint og Prettier
Husky er configurert til å kjøre prettier og eslint ved git push for konsistent formattering og syntax

#### Mappe oppsett

både klient og server mappene har sin egne src mappe med kildekode filer satt opp i egne mapper
både klient og server mappene har sin egne \_\_tests\_\_ mappe med test filer satt opp i egne mapper med identiske navn som kildekode motparten


### Server siden

#### server.js

Kjører en Express server. Serveren er satt opp med CORS konfigurasjoner for å sikre at serveren tillater vite å kalle på den.
For session handling og autentisering har jeg valgt å bruke express-sessions og passport fordi det funker enkelt med OAuth. applikasjonen bruker også MongoStore for å lagre cookien opptil 14 dager
så dersom man kjører applikasjonen lokalt, og stopper serveren, vil bruker fortsatt være pålogget når man starter serveren igjen.

```
app.set('trust proxy', 1);
```
For at applikasjonen kan kjøre med Heroku default proxy

Serveren har 4 forskjellige route-prefikser
/auth -> for autentisetings kall
/post -> for kall i henhold til innlegg
/user -> for kall ved endring av bruker data
/comment -> for kall i henhold til kommentarer


```
  if (
    req.method === 'GET' &&
    !req.path.startsWith('/comment') &&
    !req.path.startsWith('/auth') &&
    !req.path.startsWith('/post') &&
    !req.path.startsWith('/user')
  ) {
    return res.sendFile(path.resolve('../client/dist/index.html')); 
  } else {
    next(); 
  }
});
```
for SPA. alle kall som ikke starter med API prefikser skal få tilsendt frontenden

For Autentisering så støtter applikasjonen Google, GitHub og Lokalt

### Klient siden

Klient siden kjører med Vite.
En navigasjons bar er på toppen av siden til enhver tid. Men ikke alle knappene er alltid tilgjengelige;
En bruker som ikke er logget inn vil kun bli vist home og login knappene i NavBaren, og om de prøver å skifte url til de ikke tilgjengelige rutene, vil de bli dirigert til login
en bruker som er logget inn vil bli vist home publish profile og logout knappene

en bruker i home seksjonen av siden vil bli vist alle innlegg og hvor mange reaksjoner hvert innlegg har. men vil ikke kunne se hvem som har reagert eller kommentarer.

## Funksjonelle Krav:

- [x] Anonyme brukere skal se de siste innleggene og reaksjoner (emojis) når de kommer til nettsiden
- Brukere kan logge seg inn. brukere skal kunne registrere med brukernavn og passord (anbefales ikke) eller logge inn
  med google eller Entra ID
  - [x] Logge seg inn med bruker navn og passord
  - [x] Logge seg inn med Google
  - [ ] Logge seg inn med GitHub
- [x] En bruker som er logget inn kan se på sin profilside
  - [x] Bruker kan se sine egne innlegg på profilsiden
- [x] Brukere skal forbli pålogget når de refresher websiden (cookies)
- [x] En bruker som er logget inn kan klikke på et innlegg for hvem som har reagert på innlegget og kommentarer.
      Detaljene skal inkludere en overskrift, tekst, navn, bilde(om tilgjengelig) på den som publiserte det
- [x] Brukere kan publisere nye inlegg. innlegg kan være mellom 10 ord og 1000 tegn
- [ ] Systemet hindrer en bruker fra å publisere mer enn 5 innlegg innenfor en time
- [x] Brukeren skal forhindres fra å sende inn en nyhetsartikkel som mangler tekst
- [x] En bruker skal kunne redigere et innlegg de selv har publisert
- [x] en bruker skal kunne slette et innlegg de selv har publisert
- [x] Brukere skal reagere på andres innlegg med en av flere emojis
- [ ] **Valgfritt**: Brukere kan legge til kommentarer til andres innlegg
- [ ] **Valgfritt**: Brukere kan legge til andre brukere som venner
- [x] Alle feil fra server skal presenteres til en bruker på en pen måte, med mulighet for brukeren til å prøve igjen

## Må-Krav til teknisk løsning

- [x] Besvarelsen skal inneholde en Readme-fil med link til heroku og test coverage
- [x] _npm start_ skal starte server og klient (concurrently og vite)
- [x] _npm test_ skal kjøre tester. testene skal ikke feile. Vitest anbefales
- [x] koden skal ha konsistent formattering. Prettier og husky anbefales
- [x] nettsidene skal ha god layout med CSS Grid og horisontal navigasjonsmeny. Brukeren må kunne navigere overalt uten
      å bruke "back" eller redigere URL
- [x] Serveren validerer at brukeren er logget inn
- [x] innleveringen skal være i form av en zip fil. maks størrelse på fila er 1MB
- [x] Data lagres i MongoDB
- [x] Applikasjonen skal deployes til Heroku
- [x] Testene skal kjøre på github actions

## Bør-krav til teknisk løsning

*[x] Brukere kan logge seg på med mer enn en OpenID Connect Provider (for eksempel Entra ID, Facebook, LinkedIn, Github)





