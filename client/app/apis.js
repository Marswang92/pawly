import axios from 'axios';

export const BASE_URL = 'http://localhost:3000/api/v1';
// export const BASE_URL = 'https://peaceful-woodland-53096.herokuapp.com/api/v1';
export const AUTH_URL = `${BASE_URL}/user_token`;
export const USER_URL = `${BASE_URL}/users`;
export const USERNAME_URL = `${BASE_URL}/username`;
export const USER_SEARCH_URL = (keyword) => `${USER_URL}/search/${keyword}`;
export const USER_FOLLOW_URL = `${USER_URL}/follow`;
export const USER_UNFOLLOW_URL = `${USER_URL}/unfollow`;
export const AVATAR_URL = `${USER_URL}/avatar`;
export const FEED_URL = `${USER_URL}/feed`;
export const USER_DETAIL_URL = (userId) => `${USER_URL}/detail/${userId}`;
export const PETS_URL = `${BASE_URL}/pets`;
export const PICTURE_URL = `${BASE_URL}/pictures`;
export const PICTURE_LIKE_URL = `${BASE_URL}/pictures/like`;
export const PICTURE_UNLIKE_URL = `${BASE_URL}/pictures/unlike`;


export default {

  /* User APIs */
  user: {
    login: (strategy, token) =>
      axios({
        method: 'post',
        url: AUTH_URL,
        data: {
          ...token,
          strategy,
        }
      }),
    register: (email, password) =>
      axios({
        method: 'post',
        url: USER_URL,
        data: {
          email,
          password
        }
      }),
    update: (update, token) =>
      axios({
        method: 'patch',
        url: USER_URL,
        headers: { Authorization: token },
        data: update,
      }),
    detail: (id, token) =>
      axios({
        method: 'get',
        url: USER_DETAIL_URL(id),
        headers: {
          Authorization: token,
        },
      }),
    toggleFollow: (userId, type, token) =>
      axios({
        method: 'post',
        url: type === 'follow' ? USER_FOLLOW_URL : USER_UNFOLLOW_URL,
        headers: {
          Authorization: token,
        },
        data: { id: userId },
      }),
    search: (keyword, token) =>
      axios({
        method: 'get',
        url: USER_SEARCH_URL(keyword),
        headers: { Authorization: token },
      }),
    avatar: (image, token) =>
      axios({
        method: 'patch',
        url: AVATAR_URL,
        headers: {
          Authorization: token,
          'Content-Type': 'multipart/form-data',
        },
        data: image
      }),
  },

  /* Picture APIs */
  picture: {
    toggleLike: (picId, type, token) =>
      axios({
        method: 'post',
        url: type === 'like' ? PICTURE_LIKE_URL : PICTURE_UNLIKE_URL,
        headers: {
          Authorization: token,
        },
        data: { picId },
      }),
    feed: (token) =>
      axios({
        method: 'get',
        url: FEED_URL,
        headers: {
          Authorization: token,
        },
      }),
  }
};
