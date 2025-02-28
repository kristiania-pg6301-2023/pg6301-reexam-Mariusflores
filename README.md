![Tests](https://github.com/kristiania-pg6301-2023/pg6301-reexam-Mariusflores/actions/workflows/tests.yml/badge.svg)
![Deploy to Heroku](https://github.com/kristiania-pg6301-2023/pg6301-reexam-Mariusflores/actions/workflows/deploy.yml/badge.svg)

[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/nHPSu_dn)

[Heroku App](https://pg-socialmedia-23bbe72a4666.herokuapp.com/)

[Github Repo](<https://pg-socialmedia-23bbe72a4666.herokuapp.com/](https://github.com/kristiania-pg6301-2023/pg6301-reexam-Mariusflores)>)

#### icons created by Freepik - Flaticon

#### Fra rot mappen

Følgende scripts bruker Concurrently.

```
npm test
```

_kjører tester_

```
npm run test:coverage
```

_kjører tester med coverage_

```
npm run dev
```

_Kjører programmet i dev modus med nodemon_

```
npm run build
```

_Bygger programmet_

```
npm start
```

_Kjører programmet med node server.js_

![image](https://github.com/user-attachments/assets/74fa8d7a-17b1-43c0-961c-67158e56f3fc)

Jeg prøvde å laste opp coverage på codecov og ble møtt på denne meldingen da siden jeg ikke kan gi tilgang til organisasjonen dette repoet er del av og måtte prøve å uploade som anonym med public repo. prøvde flere ganger men ble møtt på samme feil 429 selv om jeg ventet ut ventetiden.
så jeg legger ved test coverage som bilde her.

### Server

![image](https://github.com/user-attachments/assets/13a09fdd-db70-461c-a1f8-db7853b429ba)

### Klient

![image](https://github.com/user-attachments/assets/09312583-4f34-437a-b693-5ee6922c0161)

Det oppsto også et problem med å kjøre testene lokalt på min maskin. Når jeg concurrently kjører testene for klient og server sammen. testene under api mappen får ikke kjørt før timeout stopper dem. jeg har gjort tiltak for å utsette timeout i vitest.config.js og lokalt i testfilene hvor dette er et problem
og etter et par forsøk er dette problemet tilsynelatende fikset. Testene kjører feilfritt i github actions med coverage.

### Om prosjektet

#### Workflows

Prosjektet tar i bruk CI/CD med github actions workflows. Det er 2 workflows en for å kjøre koden og en annen for å deploye til heroku som ikke settes i gang før testene har kjørt uten feil.
Workflow deployment til heroku skjer med akhileshns/heroku-deploy@v3.14.15 uten docker.

#### Heroku

Prosjektet kjører på Heroku og er tilgjengelig med linken over

#### Husky, Eslint og Prettier

Husky er configurert til å kjøre prettier og eslint ved git push for konsistent formattering og syntax

#### Mappe oppsett

Både klient og server mappene har sin egne src mappe med kildekode filer satt opp i egne mapper.

Både klient og server mappene har sin egne \_\_tests\_\_ mappe med test filer satt opp i egne mapper med identiske navn som kildekode motparten

#### Kode

Mesteparten av koden kommer med kommentarer som kjør det lett å navigere rundt filer.

### Server siden

#### server.js

Kjører en Express server. Serveren er satt opp med CORS konfigurasjoner for å sikre at serveren tillater vite å kalle på den.
For session handling og autentisering har jeg valgt å bruke _express-sessions_ og _passport.js_ med OAuth. applikasjonen bruker også MongoStore for å lagre session opptil 3 dager.

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
Id'er til innlegg og kommentarer lagres som standard MongoDB Object id.
for brukere blir den lagret automatisk men id'en som blir brukt av applikasjonen er en tilrettelagt <provider>:<string>
som da har github, google, eller local som provider. ved github og google, brukes id stringen som blir hentet ved innlogging. ved lokal registrering genereres et 8 sifret tall.
registrering sørger for at lokale brukere ikke kan ha identiske id'er

### Klient siden

Klient siden kjører med Vite.
En navigasjons bar er på toppen av siden til enhver tid. Men ikke alle knappene er alltid tilgjengelige;
En bruker som ikke er logget inn (min tolkning av anonym bruker) vil kun bli vist home og login knappene i NavBaren, og om de prøver å skifte url til de ikke tilgjengelige rutene, vil de bli dirigert til login

En bruker som er logget inn vil bli vist home publish profile og logout knappene

En bruker i home seksjonen av siden vil bli vist alle innlegg og hvor mange reaksjoner hvert innlegg har. men vil ikke kunne se hvem som har reagert eller kommentarer.

En bruker kan legge ut et innlegg med tittel og innhold

En registrert bruker har full tilgang til alle sidene på nettsiden. Men dersom vedkommende prøver å publisere et innlegg vil en popup notifikasjon komme opp som sier at vedkommende må være verifisert for å kunne publisere.

For å bli verifisert, må brukeren gå inn på profilsiden og klikke på tannhjul ikonet. da dukker det opp en popup side hvor man enten kan skifte brukernavn eller bli verifisert. trykk på bli verifisert så kan du publisere innlegg

alle knapper som viser frem ekstra elementer på siden, må man klikke igjen for å lukke. man kan ikke trykke hvor som helst på siden, da dette ble nedprioritert ovenfor generell funksjonalitet

## Funksjonelle Krav:

- [x] Anonyme brukere skal se de siste innleggene og reaksjoner (emojis) når de kommer til nettsiden
- Brukere kan logge seg inn. brukere skal kunne registrere med brukernavn og passord (anbefales ikke) eller logge inn
  med google eller Entra ID
  - [x] Logge seg inn med bruker navn og passord
  - [x] Logge seg inn med Google
  - [x] Logge seg inn med GitHub
- [x] En bruker som er logget inn kan se på sin profilside
  - [x] Bruker kan se sine egne innlegg på profilsiden
- [x] Brukere skal forbli pålogget når de refresher websiden (cookies)
- [x] En bruker som er logget inn kan klikke på et innlegg for hvem som har reagert på innlegget og kommentarer.
      Detaljene skal inkludere en overskrift, tekst, navn, bilde(om tilgjengelig) på den som publiserte det
- [x] Brukere kan publisere nye inlegg. innlegg kan være mellom 10 ord og 1000 tegn
- [x] Systemet hindrer en bruker fra å publisere mer enn 5 innlegg innenfor en time
- [x] Brukeren skal forhindres fra å sende inn en nyhetsartikkel som mangler tekst
- [x] En bruker skal kunne redigere et innlegg de selv har publisert
- [x] en bruker skal kunne slette et innlegg de selv har publisert
- [x] Brukere skal reagere på andres innlegg med en av flere emojis
- [x] **Valgfritt**: Brukere kan legge til kommentarer til andres innlegg
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

- [x] Brukere kan logge seg på med mer enn en OpenID Connect Provider (for eksempel Entra ID, Facebook, LinkedIn, Github)
