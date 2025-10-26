# How to Add a New Blog Post

This guide provides instructions for adding a new article to the website, including support for bilingual (English/Chinese) content. Follow these steps to ensure your post is formatted correctly and publishes automatically.

## 1. Create a New File

All blog posts are stored as Markdown files in the `/_posts` directory.

### For English Posts:
- **Action:** Create a new file inside the `/_posts` directory.
- **File Name:** The name of the file will become the URL slug for the post. It should be all lowercase, with words separated by hyphens.
  - **Example:** For an article titled "My New Awesome Post", the file name should be `my-new-awesome-post.md`.

### For Chinese Posts:
- **Action:** Create a new file inside the `/_posts/zh` directory.
- **File Name:** Use the **same filename** as the English version for proper language switching.
  - **Example:** If you have `/_posts/my-new-awesome-post.md` in English, create `/_posts/zh/my-new-awesome-post.md` for Chinese.

## 2. Add the Frontmatter

At the very top of your new file, you must include a "frontmatter" block. This block contains all the metadata for your post. It is crucial that you follow this format exactly.

- **Action:** Copy the template below and paste it at the top of your `.md` file.

```yaml
---
title: "Your Full Article Title Here"
excerpt: "A brief, one-to-two-sentence summary of the article. This is shown on the main blog page."
date: "YYYY-MM-DD"
author: "Your Name"
category: "Choose One Category"
tags: ["Tag One", "Tag Two", "Another Tag"]
---
```

### Frontmatter Fields Explained:

- `title`: The full title of your article.
- `excerpt`: A short summary used for previews. Keep it concise.
- `date`: The publication date in `YYYY-MM-DD` format.
- `author`: The name of the author.
- `category`: The main category of the post. Must be one of the existing categories (e.g., "Insights", "Design", "Development", "Tutorial") unless you intend to create a new one.
- `tags`: A list of relevant keywords or tags for the article, enclosed in square brackets and with each tag in quotes.

## 3. Write Your Content

- **Action:** Write your full article content directly below the closing `---` of the frontmatter block.
- **Format:** You can use standard Markdown for formatting (e.g., `#` for headings, `**bold**` for bold text, `*italic*` for italic text, etc.).

## 4. Writing Bilingual Content

The blog system now supports both English and Chinese content. Here's how to create bilingual articles:

### Benefits of Bilingual Posts:
- **Automatic Language Switching:** A language switcher appears on posts with both English and Chinese versions
- **SEO-Friendly:** Each language has its own URL (`/blog/en/slug` and `/blog/zh/slug`)
- **Flexible Content:** Chinese and English versions can differ in length and style as needed

### Creating a Bilingual Article:

1. **Create the English version** in `/_posts/your-article.md`
2. **Create the Chinese version** in `/_posts/zh/your-article.md` with the **exact same filename**
3. Both files should have matching frontmatter structure but translated content

### Example: Chinese Frontmatter

```yaml
---
title: "生成设计的艺术"
excerpt: "探索代码与创造力的交集，通过算法和数学之美产生独特的视觉艺术。"
date: "2025-01-15"
author: "KUMMA"
tags: ["生成艺术", "创意编程", "Three.js", "WebGL"]
category: "设计"
readingTime: 5
---
```

### Writing Chinese Content:
- Write Chinese directly in the Markdown file - UTF-8 encoding is fully supported
- No special tools or encoding needed
- Use Chinese characters naturally for titles, headings, and content

### Language Switcher:
- When both English and Chinese versions exist with the same filename, a language switcher automatically appears
- Users can toggle between EN/中文 versions seamlessly
- If only one language version exists, the switcher won't appear

## 5. Publish Your Article

- **Action:** Once your file is created and saved, commit and push it to the `master` branch on GitHub.
- **Automation:** The website is configured to automatically detect the new file, rebuild the site, and publish your article. No further action is needed.

## Quick Reference: File Structure

```
_posts/
├── my-article.md              # English version (URL: /blog/en/my-article)
├── another-post.md            # English only
└── zh/
    └── my-article.md          # Chinese version (URL: /blog/zh/my-article)
```

**Note:** The Chinese version must have the exact same filename as the English version for the language switcher to work properly.
