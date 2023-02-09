import { useEffect } from 'react';
import useAuth from './useAuth';
import useRefreshToken from './useRefreshToken';
import { api } from '../api/NFTeamApi';
import { AxiosError } from 'axios';

const useAxiosPrivate = () => {
  const reissue = useRefreshToken();
  const auth = useAuth()?.auth;

  useEffect(() => {
    const requestIntercept = api.interceptors.request.use(
      (config) => {
        if (!config.headers['Authorization']) {
          config.headers['Authorization'] = auth?.accessToken;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseIntercept = api.interceptors.response.use(
      (res) => res,
      (error: AxiosError) => {
        const prevReq = error.config;
        if (error.response?.status === 403 && prevReq) {
          const newAccessToken = reissue();
          prevReq.headers['Authorization'] = newAccessToken;
          return api(prevReq);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestIntercept);
      api.interceptors.response.eject(responseIntercept);
    };
  }, [auth, reissue]);

  return api;
};

export default useAxiosPrivate;
