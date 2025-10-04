export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    avatar?: string;
  };
  publishedDate: string;
  readingTime: number;
  featuredImage?: string;
  featured: boolean;
}

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "generative-art-with-code",
    title: "The Art of Generative Design",
    excerpt: "Exploring the intersection of code and creativity to produce unique visual art through algorithms and mathematical beauty.",
    content: `# The Art of Generative Design

Generative art represents the perfect marriage between code and creativity. It's not just about writing algorithms—it's about teaching computers to be creative partners in the artistic process.

## The Power of Algorithms

When we write generative code, we're creating systems that can produce infinite variations. Each run creates something unique, yet bound by the rules we've defined. It's like being a composer rather than a performer.

## Tools of the Trade

Modern web technologies like Three.js, p5.js, and WebGL have made it easier than ever to create stunning generative art right in the browser. The GPU acceleration allows for real-time rendering of complex systems that would have been impossible just a few years ago.

## The Creative Process

The beauty of generative art lies in the discovery process. You start with an idea, implement the system, and then spend hours tweaking parameters to find those "happy accidents" that make your work unique.

## Conclusion

Generative art is more than just a technical exercise—it's a new form of artistic expression that blends mathematical precision with creative intuition.`,
    category: "Design",
    tags: ["Generative Art", "Creative Coding", "Three.js", "WebGL"],
    author: { name: "KUMMA" },
    publishedDate: "2025-01-15",
    readingTime: 8,
    featured: true,
  },
  {
    id: "2",
    slug: "mastering-gsap-animations",
    title: "Mastering GSAP for Web Animations",
    excerpt: "A comprehensive guide to creating buttery-smooth, performant animations using GreenSock Animation Platform.",
    content: `# Mastering GSAP for Web Animations

GSAP (GreenSock Animation Platform) is the gold standard for web animations. If you want silky-smooth, professional-grade animations, GSAP is your best friend.

## Why GSAP?

Unlike CSS animations or other JavaScript libraries, GSAP is built from the ground up for performance. It uses sub-pixel rendering, intelligent optimization, and works seamlessly across all browsers.

## ScrollTrigger Magic

The ScrollTrigger plugin revolutionized scroll-based animations. You can create complex, choreographed sequences that respond to user scrolling with incredible precision.

## Performance Tips

1. Use \`will-change\` for animated properties
2. Prefer transforms over position properties
3. Use \`scrub\` for scroll-linked animations
4. Batch your animations with timelines

## Advanced Techniques

GSAP's timeline feature allows you to orchestrate complex animation sequences with precise timing control. Combined with callbacks and labels, you can create truly cinematic experiences.`,
    category: "Development",
    tags: ["GSAP", "Animation", "JavaScript", "ScrollTrigger"],
    author: { name: "KUMMA" },
    publishedDate: "2025-01-10",
    readingTime: 12,
    featured: false,
  },
  {
    id: "3",
    slug: "future-of-3d-web",
    title: "The Future of UI/UX: 3D on the Web",
    excerpt: "How WebGL, Three.js, and WebGPU are revolutionizing user interfaces and creating immersive web experiences.",
    content: `# The Future of UI/UX: 3D on the Web

The web is evolving from flat, 2D interfaces to rich, immersive 3D experiences. Technologies like WebGL, Three.js, and the upcoming WebGPU are making this possible.

## The 3D Revolution

What was once the domain of native applications is now possible in the browser. Real-time 3D rendering, physics simulations, and complex visual effects are now accessible to web developers.

## Three.js: The Gateway

Three.js abstracts away the complexity of WebGL, making 3D development accessible to a wider audience. Its extensive ecosystem includes loaders, helpers, and community-created tools.

## Performance Considerations

3D on the web requires careful optimization:
- LOD (Level of Detail) systems
- Frustum culling
- Texture compression
- Efficient geometry management

## The WebGPU Future

WebGPU promises even better performance and more control. It's not just about graphics—it enables compute shaders for complex simulations and data processing.

## Conclusion

3D web experiences are no longer a novelty—they're becoming an expected part of modern web design. The tools are mature, the performance is there, and the possibilities are endless.`,
    category: "Development",
    tags: ["Three.js", "WebGL", "WebGPU", "3D", "UI/UX"],
    author: { name: "KUMMA" },
    publishedDate: "2025-01-05",
    readingTime: 10,
    featured: true,
  },
  {
    id: "4",
    slug: "react-19-new-features",
    title: "React 19: Game-Changing Features",
    excerpt: "Exploring the latest features in React 19, including the new compiler, improved Server Components, and enhanced performance.",
    content: `# React 19: Game-Changing Features

React 19 brings revolutionary changes that fundamentally improve how we build React applications. Let's dive into the most impactful features.

## The React Compiler

The new React compiler automatically optimizes your components, eliminating the need for manual memoization in many cases. This is a game-changer for performance.

## Server Components Maturity

React Server Components have matured significantly. They allow you to build faster, more efficient applications by rendering components on the server and streaming them to the client.

## Actions and Transitions

The new Actions API simplifies form handling and asynchronous state updates. Combined with useTransition, you can create responsive UIs that handle loading states elegantly.

## Improved Hydration

React 19 features smarter hydration that can handle mismatches more gracefully and provides better error messages for debugging.

## Migration Strategy

While React 19 is backward compatible, it's worth taking time to optimize your codebase to take advantage of the new features, especially the compiler optimizations.`,
    category: "Development",
    tags: ["React", "React 19", "Server Components", "Performance"],
    author: { name: "KUMMA" },
    publishedDate: "2025-01-01",
    readingTime: 9,
    featured: false,
  },
  {
    id: "5",
    slug: "design-systems-2025",
    title: "Building Modern Design Systems",
    excerpt: "Best practices for creating scalable, maintainable design systems that grow with your product and team.",
    content: `# Building Modern Design Systems

A well-crafted design system is the foundation of consistent, scalable product development. It's more than just a style guide—it's a living language that evolves with your product.

## Core Principles

1. **Consistency**: Every component should feel like it belongs to the same family
2. **Flexibility**: Design tokens and variants allow for customization
3. **Documentation**: If it's not documented, it doesn't exist
4. **Accessibility**: Built-in from the start, not bolted on later

## Token-Based Architecture

Design tokens are the atoms of your design system. Colors, spacing, typography—all defined as tokens that can be themed and customized.

## Component Library

Your component library should be:
- Type-safe (TypeScript)
- Well-tested (unit and visual regression)
- Documented (Storybook or similar)
- Accessible (WCAG 2.1 AA minimum)

## Tooling

Modern design systems leverage tools like:
- Figma for design
- TypeScript for type safety
- CSS-in-JS or CSS Modules for styling
- Storybook for documentation

## Maintenance

A design system is never "done." It requires continuous maintenance, updates, and refinement based on user feedback and product evolution.`,
    category: "Design",
    tags: ["Design Systems", "UI/UX", "Component Library", "Accessibility"],
    author: { name: "KUMMA" },
    publishedDate: "2024-12-20",
    readingTime: 11,
    featured: false,
  },
  {
    id: "6",
    slug: "typescript-advanced-patterns",
    title: "Advanced TypeScript Patterns",
    excerpt: "Deep dive into advanced TypeScript patterns, generics, and type manipulation techniques for building robust applications.",
    content: `# Advanced TypeScript Patterns

TypeScript's type system is incredibly powerful. Let's explore advanced patterns that will level up your TypeScript game.

## Conditional Types

Conditional types allow you to create types that depend on other types. They're the foundation of many advanced patterns.

\`\`\`typescript
type IsString<T> = T extends string ? true : false;
\`\`\`

## Mapped Types

Transform existing types into new ones with mapped types:

\`\`\`typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};
\`\`\`

## Template Literal Types

Combine string literal types with type manipulation:

\`\`\`typescript
type EventName = \`on\${Capitalize<string>}\`;
\`\`\`

## Utility Types

Master built-in utility types like Partial, Pick, Omit, and ReturnType to write more expressive code.

## Type Guards

Custom type guards help TypeScript understand your runtime checks:

\`\`\`typescript
function isUser(obj: any): obj is User {
  return 'name' in obj && 'email' in obj;
}
\`\`\`

## Best Practices

- Prefer types over interfaces for complex compositions
- Use const assertions for literal types
- Leverage discriminated unions for state management
- Document complex types with JSDoc comments`,
    category: "Development",
    tags: ["TypeScript", "JavaScript", "Type Safety", "Advanced Patterns"],
    author: { name: "KUMMA" },
    publishedDate: "2024-12-15",
    readingTime: 15,
    featured: false,
  },
  {
    id: "7",
    slug: "performance-optimization-nextjs",
    title: "Next.js Performance Optimization",
    excerpt: "Comprehensive guide to optimizing Next.js applications for lightning-fast load times and exceptional user experience.",
    content: `# Next.js Performance Optimization

Next.js is fast out of the box, but there's always room for optimization. Let's explore techniques to make your Next.js app blazingly fast.

## Image Optimization

Use next/image for automatic:
- Format conversion (WebP, AVIF)
- Responsive images
- Lazy loading
- Blur placeholders

## Code Splitting

Next.js automatically code-splits by route, but you can go further:
- Dynamic imports for heavy components
- Route-based code splitting
- Vendor chunk optimization

## Server Components

Leverage React Server Components to:
- Reduce client bundle size
- Fetch data server-side
- Improve Time to First Byte

## Caching Strategies

Implement intelligent caching:
- Static generation for static content
- Incremental Static Regeneration for dynamic data
- Client-side caching with SWR or React Query

## Bundle Analysis

Regularly analyze your bundle:
- Use @next/bundle-analyzer
- Identify large dependencies
- Consider alternatives or lazy loading

## Monitoring

Set up performance monitoring:
- Web Vitals tracking
- Real User Monitoring (RUM)
- Synthetic monitoring

## Conclusion

Performance optimization is an ongoing process. Regular audits and monitoring help you catch regressions early.`,
    category: "Development",
    tags: ["Next.js", "Performance", "Optimization", "React"],
    author: { name: "KUMMA" },
    publishedDate: "2024-12-10",
    readingTime: 13,
    featured: false,
  },
  {
    id: "8",
    slug: "creative-coding-mathematics",
    title: "The Mathematics of Creative Coding",
    excerpt: "Understanding the mathematical concepts that power stunning visual effects and generative art systems.",
    content: `# The Mathematics of Creative Coding

Behind every beautiful generative art piece lies elegant mathematics. Understanding these concepts unlocks infinite creative possibilities.

## Trigonometry: The Foundation

Sine and cosine waves are everywhere in creative coding:
- Circular motion
- Wave patterns
- Oscillating animations
- Organic movement

## Noise Functions

Perlin and Simplex noise create natural-looking randomness:
- Terrain generation
- Organic textures
- Flow fields
- Procedural content

## Vectors and Forces

Understanding vectors enables:
- Physics simulations
- Particle systems
- Flocking behaviors
- Force-based layouts

## Fractals and Recursion

Self-similar patterns create infinite complexity:
- Mandelbrot sets
- L-systems for plant growth
- Recursive tree structures
- Sierpinski triangles

## Easing Functions

Mathematical easing functions create natural motion:
- Exponential ease
- Elastic bounce
- Cubic bezier curves
- Custom easing

## Practical Applications

These concepts power:
- Game development
- Data visualization
- Interactive installations
- Motion graphics

## Resources for Learning

- The Nature of Code by Daniel Shiffman
- The Book of Shaders
- Math for Programmers
- Creative Coding YouTube channels`,
    category: "Tutorial",
    tags: ["Mathematics", "Creative Coding", "Algorithms", "Generative Art"],
    author: { name: "KUMMA" },
    publishedDate: "2024-12-05",
    readingTime: 14,
    featured: true,
  },
];

export const categories = ["All", "Development", "Design", "Tutorial", "Insights"];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}

export function getFeaturedPosts(): BlogPost[] {
  return blogPosts.filter(post => post.featured);
}

export function getPostsByCategory(category: string): BlogPost[] {
  if (category === "All") return blogPosts;
  return blogPosts.filter(post => post.category === category);
}

export function searchPosts(query: string): BlogPost[] {
  const lowercaseQuery = query.toLowerCase();
  return blogPosts.filter(post =>
    post.title.toLowerCase().includes(lowercaseQuery) ||
    post.excerpt.toLowerCase().includes(lowercaseQuery) ||
    post.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}
