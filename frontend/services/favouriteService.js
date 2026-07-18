/**
 * Favourites Service — localStorage-based.
 * No backend involved. Stores an array of vehicle IDs.
 */

const KEY = 'ksv_favourites';

function getAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function save(ids) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

const favouriteService = {
  /** Returns array of saved vehicle IDs */
  getIds() {
    return getAll();
  },

  /** Returns true if the vehicle is already saved */
  isFavourite(vehicleId) {
    return getAll().includes(vehicleId);
  },

  /** Add a vehicle to favourites */
  add(vehicleId) {
    const ids = getAll();
    if (!ids.includes(vehicleId)) {
      save([...ids, vehicleId]);
    }
  },

  /** Remove a vehicle from favourites */
  remove(vehicleId) {
    save(getAll().filter((id) => id !== vehicleId));
  },

  /** Toggle — add if not present, remove if present. Returns new boolean state. */
  toggle(vehicleId) {
    if (favouriteService.isFavourite(vehicleId)) {
      favouriteService.remove(vehicleId);
      return false;
    }
    favouriteService.add(vehicleId);
    return true;
  },

  /** Clear all favourites */
  clear() {
    save([]);
  },
};

export default favouriteService;
