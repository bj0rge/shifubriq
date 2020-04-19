import axios, { AxiosInstance } from 'axios';
import config from '../config';

const briqConf = config.briq;

const briqApi: AxiosInstance = axios.create({
  baseURL: briqConf.baseUrl,
  timeout: 1e4,
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
});
briqApi.interceptors.request.use((axiosConfig) => {
  const auth = { ...axiosConfig.auth, username: briqConf.token };
  const newConfig = { ...axiosConfig, auth };
  return newConfig;
});

type Transaction = {
  amount: number;
  comment: string;
  app: string;
  from: string;
  to: string;
};

export async function transferBriqs(
  transaction: Transaction,
  organizationName: string,
): Promise<any> {
  const res = await briqApi.post(
    `/organizations/${organizationName}/transactions`,
    transaction,
  );
  return res;
}
