import axios from 'axios';

import { HTTP_TIMEOUT_MS } from '@/constants/config';

export const httpClient = axios.create({
  timeout: HTTP_TIMEOUT_MS,
});
