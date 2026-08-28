import { useEffect } from "react";
import { CALLBACK_TYPE_ENUM, REQUEST_TYPE_ENUM, requestFromMiniApp } from "esewa-ui-library";

useEffect(() => {
  const saveAuthData = (res: { token?: string; scope?: any }): void => {
    if (!res.token) {
      console.warn('Token is missing, skipping storage');
      return;
    }

    sessionStorage.setItem("miniAppAuthToken", res.token);
    sessionStorage.setItem("miniAppAuthScope", JSON.stringify(res.scope))
  }
  const initAppCallback = (data: any) => {
    try {
      if (!data) {
        throw new Error('Received null or undefined response');
      }
      const res = JSON.parse(data);
      if (!res || typeof res !== 'object') {
        throw new Error('Parsed response is not a valid object');
      }
      if (res?.error_message) {
        return;
      }
      saveAuthData(res);
    } catch (error) {
      console.error('Error parsing response:', error);
    }
  };
  const requestData = {
    merchant_identifier: 'IAAAAABTOBAbFhAXHhEHAgoXX0FRR1FJJiw3LCwkJzE=', //your identifier key
    requestType: REQUEST_TYPE_ENUM.INIT_APP,
    callbackKey: CALLBACK_TYPE_ENUM.INIT_APP_CALLBACK
  };
  requestFromMiniApp(requestData, initAppCallback);
}, [])