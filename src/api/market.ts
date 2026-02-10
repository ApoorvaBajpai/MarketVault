import { authFetch } from "./base";

export const getMarketPrices = () =>
    authFetch("http://localhost:5000/api/coins/listings-with-info");

export const getCoinDetails = (id: string) =>
    authFetch(`http://localhost:5000/api/coins/${id}/details`);
