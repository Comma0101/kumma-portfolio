# Personal Website & Portfolio

This is a personal website and portfolio project built with Next.js. It showcases a variety of projects, a blog, and a gallery of creative work.

## Features

- **Project Showcase:** A dedicated section to display and detail various software and creative projects.
- **Blog:** A space for articles, tutorials, and thoughts on technology and design.
- **Gallery:** A visual collection of artwork, photography, or other creative endeavors.
- **Interactive 3D Elements:** Utilizes Three.js for engaging and dynamic visual components.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or later recommended)
- [npm](https://www.npmjs.com/)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/Comma0101/3D-Maze.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd p-website-next
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Automated Deployment (CI/CD)
This project is configured for seamless, automated deployment to **kumma.me** via GitHub Pages.
- **Trigger**: Any code pushed or merged into the `master` branch will automatically trigger the deployment pipeline.
- **Workflow**: The pipeline uses GitHub Actions (defined in `.github/workflows/deploy.yml`). It sets up a Node.js environment, installs dependencies, runs `npm run build` to generate a static export (`/out`), and publishes those artifacts directly to GitHub Pages.
- **Custom Domain**: A `CNAME` file is included in the project root to ensure GitHub Pages correctly routes traffic for `kumma.me`.

## Folder Structure Overview & Suggestions
The repository is structured as a standard modern Next.js 14+ application:

- `/app` - Contains the core Next.js App Router layout, page routing, and metadata configuration.
- `/components` - Houses modular React components.
  - `/components/home` - Highly specific, heavy sections (Hero, About/Manifesto, Skills, Projects) are perfectly co-located here.
  - `/components/Animations` - Contains reusable GSAP and frame-motion animation wrappers.
- `/styles` - Global CSS and component-specific CSS Modules.
- `/public` - Static assets (images, fonts, 3D models).
- `/_posts` - Markdown files for blog content.

**Architectural Suggestions for Scaling:**
1. **Three.js Extraction**: Currently, some complex WebGL components (like `TextTunnelTransition.tsx` and `RotatingCuboids`) mix heavy React state with low-level Three.js `useFrame` logic. As the app grows, consider moving the pure non-React WebGL logic into a dedicated `/webgl` or `/three` folder to separate the rendering mathematics from the React component lifecycle.
2. **Context Co-location**: The `/context` folder (e.g. `TransitionContext.tsx`) is currently at the root. Consider moving this inside `/components/context` or `/hooks` to keep state management closer to the UI components that consume them.
3. **CSS Modules**: The app currently uses a mix of global CSS (`/styles/index.css`) and modular CSS (`HeroSection.module.css`). Ensure that all new component-specific styling continues to use the `.module.css` pattern to prevent global namespace collisions.

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework for production
- [React](https://reactjs.org/) - A JavaScript library for building user interfaces
- [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript
- [Three.js](https://threejs.org/) - 3D graphics library
- [GSAP](https://greensock.com/gsap/) - JavaScript animation library
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
