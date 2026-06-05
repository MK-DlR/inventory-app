<!-- ctrl+f: project_license -->

<a id="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![project_license][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/MK-DlR/inventory-app">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">HerbTrack</h3>

  <p align="center">
    Full-stack medicinal plant inventory web app where guests and an admin can manage plants based on stock and useage.
    <br />
    <a href="https://github.com/MK-DlR/inventory-app"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://inventory-app-e3zm.onrender.com/plants">View Demo</a>
    &middot;
    <a href="https://github.com/MK-DlR/inventory-app/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/MK-DlR/inventory-app/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#notes">Notes</a></li>
      </ul>
    </li>
    <li>
      <a href="#usage">Usage</a>
      <ul>
        <li><a href="#how-to-use-the-app">How to Use the App</a></li>
        <li><a href="#default-setup-behavior">Default Setup Behavior</a></li>
      </ul>
    </li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

[![HerbTrack Screen Shot][product-screenshot]](https://inventory-app-e3zm.onrender.com/plants)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

- [![EJS]][EJS-url]
- [![Express]][Express-url]
- [![Javascript][Javascript]][Javascript-url]
- [![Node.js]][Node-url]
- [![Postgres]][Postgres-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

- Node.js (recommended v22+)
- npm
- [Neon](https://neon.tech) account (free tier works)

### Installation

1. Clone the repository
   ```sh
   git clone https://github.com/MK-DlR/inventory-app.git
   cd inventory-app
   ```
2. Install dependencies
   ```sh
   npm install
   ```
3. Create a Neon database
   1. Sign up for a free account at https://neon.tech
   2. Create a new project
   3. Open the project dashboard and copy the PostgreSQL connection string
   4. The connection string should look similar to:
      ```text
      postgresql://username:password@host/database?sslmode=require
      ```
4. Set up environment variables
   ```sh
   cp .env.example .env
   ```
   Open `.env` and fill in:
   - `DATABASE_URL` (from Neon)
   - `SESSION_SECRET`
   - `ADMIN_PASSWORD`
   - `TREFLE_API_KEY` (optional)
5. Set up the database
   ```sh
   npm run setup
   ```
   This will create all tables and seed the database with a guest account, admin account, and sample plant data.<br />
   **Only run this once on a fresh install — it will wipe any existing data.**
6. Start the application
   ```sh
   npm run dev
   ```
7. Open the app at `http://localhost:3005`

### Notes

- Backend: Express + PostgreSQL
- Frontend: EJS
- Database: Neon (cloud PostgreSQL)
- Authentication: Session-based
- Trefle API is optional — the app works without it, but plant image fetching will be unavailable
- Default seed includes a guest account and admin account, plus sample plant data

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

## Usage

This is an Express based medicinal plant inventory management application where users can maintain their stock of plants along with any medicinal uses they may have.

The application allows filtering, sorting, and searching and includes a pre-seeded database with an admin account for actual stock management.

### How to Use the App

1. Open the app at http://localhost:3005 or visit the [live demo](https://inventory-app-e3zm.onrender.com/plants)
2. CRUD plants and medicinal uses on the live demo
   - Create new plants for the Trefle API to fetch images for
   - Alternatively, set up and run a copy locally to CRUD plants as an admin
3. Search by plant name, filter by medicinal use and/or stock, quantity, and order status, and sort by various options

### Default Setup Behavior

- Default plants and medicinal uses are created automatically via the setup script
- An admin account is created for management of plants separately from guest (logged out) view plants
- Admin and guest plants are managed separately, allowing guests to demo the functionality without damaging any in-use data

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->

## Roadmap

- [x] Add LICENSE.txt
- [x] Admin account
  - [x] Guest account
  - [x] Login page
- [x] Upgrade CSS
- [x] Add live demo link
- [ ] User supplied images
- [ ] Bug: API giving unrelated images

See the [open issues](https://github.com/MK-DlR/inventory-app/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

As this is a student project created for The Odin Project curriculum, it is currently not open for contributions.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Top contributors:

<a href="https://github.com/MK-DlR/inventory-app/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=MK-DlR/inventory-app" alt="contrib.rocks image" />
</a>

<!-- LICENSE -->

## License

Distributed under the project_license. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

Adrien Newman - [@MK_DlR](https://twitter.com/MK_DlR) - adriennewman92@gmail.com

Project Link: [Repository](https://github.com/MK-DlR/inventory-app) & [Live Demo](https://inventory-app-e3zm.onrender.com/plants)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGEMENTS -->

## Acknowledgements

- [The Odin Project](https://www.theodinproject.com/dashboard)
- [Font Awesome](https://fontawesome.com/)
- [Trolley Icon](https://icons8.com/icon/46115/trolley) by [Icons8](https://icons8.com/)
- [Favicon Converter](https://favicon.io/favicon-converter/)
- [Trefle - Global Plants API](https://trefle.io/)
- [Othneil Drew's Best README Template](https://github.com/othneildrew/Best-README-Template)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<p align="center"><img src="images/swipe.gif" alt="Majima weakly swiping a knife"></p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/MK-DlR/inventory-app.svg?style=for-the-badge
[contributors-url]: https://github.com/MK-DlR/inventory-app/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/MK-DlR/inventory-app.svg?style=for-the-badge
[forks-url]: https://github.com/MK-DlR/inventory-app/network/members
[stars-shield]: https://img.shields.io/github/stars/MK-DlR/inventory-app.svg?style=for-the-badge
[stars-url]: https://github.com/MK-DlR/inventory-app/stargazers
[issues-shield]: https://img.shields.io/github/issues/MK-DlR/inventory-app.svg?style=for-the-badge
[issues-url]: https://github.com/MK-DlR/inventory-app/issues
[license-shield]: https://img.shields.io/github/license/MK-DlR/inventory-app.svg?style=for-the-badge
[license-url]: https://github.com/MK-DlR/inventory-app/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/adrien-newman
[product-screenshot]: images/screenshot.gif

<!-- Shields.io badges. You can a comprehensive list with many more badges at: https://github.com/inttter/md-badges -->

[Angular.io]: https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white
[Angular-url]: https://angular.io/
[Bootstrap.com]: https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white
[Bootstrap-url]: https://getbootstrap.com
[EJS]: https://img.shields.io/badge/EJS-B4CA65?style=for-the-badge&logo=ejs&logoColor=fff
[EJS-url]: https://ejs.co/
[Express]: https://img.shields.io/badge/Express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB
[Express-url]: https://expressjs.com/en/
[Javascript]: https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=000
[Javascript-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript
[JQuery.com]: https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white
[JQuery-url]: https://jquery.com
[Laravel.com]: https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white
[Laravel-url]: https://laravel.com
[Next.js]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[Next-url]: https://nextjs.org/
[Node.js]: https://img.shields.io/badge/Node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white
[Node-url]: https://nodejs.org/en
[Postgres]: https://img.shields.io/badge/Postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white
[Postgres-url]: https://www.postgresql.org/
[Prisma]: https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white
[Prisma-url]: https://www.prisma.io/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[React-router]: https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white
[React-router-url]: https://reactrouter.com/
[Svelte.dev]: https://img.shields.io/badge/Svelte-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00
[Svelte-url]: https://svelte.dev/
[Vite]: https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=fff
[Vite-url]: https://vite.dev/
[Vue.js]: https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D
[Vue-url]: https://vuejs.org/
