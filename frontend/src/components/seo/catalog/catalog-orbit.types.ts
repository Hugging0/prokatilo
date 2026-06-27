export interface CatalogOrbitItem {
  appItemId: number;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  prices: {
    short: number;
    day: number;
    week: number;
  };
}
