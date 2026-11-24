import axios from 'axios';

const HOST = window.location.hostname;
export const API_URL = `http://${HOST}:8080`;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});
