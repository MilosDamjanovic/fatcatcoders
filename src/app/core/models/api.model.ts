export const api = {
  oauth: {
    login: '/login',
  },
  user: {
    create: '/users',
    addNewTrack: '/users/:userId/time-tracks',
    update: '/users/:userId',
    getAll: '/users',
  },
  time: {
    tracks: '/time-tracks',
  },
  admins: {
    getAll: '/admins'
  }
};
