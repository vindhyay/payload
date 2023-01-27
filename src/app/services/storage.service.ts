import { Injectable } from "@angular/core";
import { Tokens } from "../modules/auth/models";
import { USER_DATA_KEY, ACCESS_TOKEN, REFRESH_TOKEN } from "../state/constants";

// TODO change to cookies

@Injectable({
  providedIn: "root",
})
export class StorageService {
  setToken(tokenData: { type: string; token: string; expiryTime: number }) {
    this.setCookie(tokenData?.type, tokenData?.token, tokenData?.expiryTime);
  }
  getToken(type: string) {
    return this.getCookie(type);
  }
  saveTokensData(data: Tokens) {
    this.setToken({ type: ACCESS_TOKEN, token: data?.accessToken, expiryTime: data?.accessTokenExpirationTime });
    this.setToken({ type: REFRESH_TOKEN, token: data?.refreshToken, expiryTime: data?.refreshTokenExpirationTime });
  }

  // User data
  get user(): any {
    const stringData = localStorage.getItem(USER_DATA_KEY);
    return stringData ? JSON.parse(stringData) : null;
  }
  set user(user: any) {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
  }

  clear() {
    localStorage.removeItem(USER_DATA_KEY);
    this.clearCookie(ACCESS_TOKEN);
    this.clearCookie(REFRESH_TOKEN);
  }

  // Cookie methods
  setCookie(name, value, time) {
    let expires = "";
    if (time) {
      const date = new Date();
      date.setTime(date.getTime() + time);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }
  getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }
  clearCookie(name) {
    document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  }
}
