export const getFetcher = (url: string) => fetch(url).then((res) => res.json());
