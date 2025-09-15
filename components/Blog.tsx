"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/blog.module.css";
import Link from "next/link";
import {
  getAccessTokenFromCode,
  fetchArticles,
  getRequestTokenAndAuthUrl,
} from "../app/api/PocketApi";
import BackButton from "./BackButton";

// Define a type for Pocket articles
interface PocketArticle {
  item_id: string;
  resolved_title: string;
  resolved_url: string;
  excerpt: string;
  time_added: string;
  top_image_url?: string;
}

const Blog = () => {
  const router = useRouter();
  const [articles, setArticles] = useState<PocketArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handlePocketAuth = async () => {
      try {
        // Check if we're returning from Pocket authorization
        const urlParams = new URLSearchParams(window.location.search);
        // Check if we're returning from Pocket authorization with a code in the URL
        const authCode = urlParams.get("code");
        const storedRequestToken = localStorage.getItem("pocketRequestToken");

        if (
          !localStorage.getItem("pocketAccessToken") &&
          authCode &&
          storedRequestToken
        ) {
          setLoading(true);

          // Exchange the authCode (which is the request_token) for an access token
          const accessToken = await getAccessTokenFromCode(authCode);

          // Save access token to localStorage
          localStorage.setItem("pocketAccessToken", accessToken);

          // Clean up the stored request token and the URL
          localStorage.removeItem("pocketRequestToken");
          console.log("[Blog] Replacing URL with: /blog");
          router.replace("/blog"); // Clean the URL
        } else if (
          !localStorage.getItem("pocketAccessToken") &&
          storedRequestToken
        ) {
          // This case handles if the user was redirected back but no 'code' in URL,
          // which might happen if the authorization failed or was cancelled.
          // In this scenario, we should probably restart the auth flow or show an error.
          console.warn(
            "[Blog] No auth code in URL, but request token found in localStorage. Restarting auth."
          );
          localStorage.removeItem("pocketRequestToken"); // Clear potentially stale token
          await startPocketAuth(); // Restart the flow
        }

        // If we have an access token, fetch articles
        const accessToken = localStorage.getItem("pocketAccessToken");
        if (accessToken) {
          const fetchedArticles = await fetchArticles(accessToken, 20);
          setArticles(fetchedArticles);
        } else {
          console.log("[Blog] No access token, starting OAuth flow.");
          // Start OAuth flow
          await startPocketAuth();
        }
      } catch (err) {
        console.error("Error in Pocket authentication:", err);
        setError("Failed to authenticate with Pocket. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    handlePocketAuth();
  }, []);

  const startPocketAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get a request token and auth URL together
      const { code, auth_url } = await getRequestTokenAndAuthUrl();

      // Save the request token for later use
      localStorage.setItem("pocketRequestToken", code);

      console.log("[Blog] Starting Pocket auth with token:", code);
      console.log("[Blog] Redirecting to:", auth_url);

      // Redirect to Pocket authorization page
      window.location.href = auth_url;
    } catch (err) {
      console.error("Error starting Pocket auth:", err);
      setError(
        "Failed to start authentication process with Pocket. Please try again."
      );
      setLoading(false);
    }
  };

  const handleReauthorize = () => {
    // Clear existing tokens and restart auth flow
    localStorage.removeItem("pocketAccessToken");
    localStorage.removeItem("pocketRequestToken");
    startPocketAuth();
  };

  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className={styles.blogContainer}>
      {/* Home link */}
      <div className={styles.blogHeader}>
        <h1>My Pocket Articles</h1>
        <BackButton />
        <button onClick={handleReauthorize} className={styles.authButton}>
          Reconnect Pocket
        </button>
      </div>

      {loading && (
        <div className={styles.loading}>Loading articles from Pocket...</div>
      )}

      {error && <div className={styles.error}>{error}</div>}

      {!loading && !error && articles.length === 0 && (
        <div className={styles.noArticles}>
          <p>No articles found in your Pocket account.</p>
        </div>
      )}

      {articles.map((article) => (
        <div key={article.item_id} className={styles.blogItem}>
          <h2>
            <a
              href={article.resolved_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.blogLink}
            >
              {article.resolved_title || "Untitled Article"}{" "}
              <span className="arrow">→</span>
            </a>
          </h2>

          {article.top_image_url && (
            <img
              src={article.top_image_url}
              alt={article.resolved_title}
              className={styles.articleImage}
            />
          )}

          <p className={styles.articleExcerpt}>{article.excerpt}</p>
          <div className={styles.articleMeta}>
            <span className={styles.articleDate}>
              Saved on {formatDate(article.time_added)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Blog;
