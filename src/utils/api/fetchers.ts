// API fetcher function
export const getFetcher = async (url: string) => {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`
        HTTP error
        Status: ${response.status}
        Message: ${response.statusText}
        URL: ${url}
    `);
  }

  return response.json();
};
