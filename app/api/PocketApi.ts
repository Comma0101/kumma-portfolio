
import axios from 'axios';

interface RequestTokenResponse {
  code: string;
  auth_url: string;
}

interface AccessTokenResponse {
  access_token: string;
  username: string;
}

interface PocketArticle {
  item_id: string;
  resolved_title: string;
  resolved_url: string;
  excerpt: string;
  time_added: string;
  top_image_url?: string;
}

interface FetchArticlesResponse {
  list: { [key: string]: PocketArticle };
}

export const getRequestTokenAndAuthUrl = async (): Promise<RequestTokenResponse> => {
  const response = await axios.post<RequestTokenResponse>('/api/pocket/request_token');
  return response.data;
};

export const getAccessTokenFromCode = async (requestCode: string): Promise<string> => {
  const response = await axios.post<AccessTokenResponse>('/api/pocket/access_token', {
    request_token: requestCode,
  });
  return response.data.access_token;
};

export const fetchArticles = async (accessToken: string, count: number): Promise<PocketArticle[]> => {
  const response = await axios.post<FetchArticlesResponse>('/api/pocket/get_articles', {
    access_token: accessToken,
    count: count,
  });
  return Object.values(response.data.list);
};
