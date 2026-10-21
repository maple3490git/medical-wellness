import type { Patient } from "@/lib/types";
import { patients as seedPatients } from "@/data/patients";

/**
 * Couche d'accès aux données.
 *
 * Implémentation actuelle : stockage en mémoire (données de démonstration).
 * L'interface `DbCollection` est volontairement générique afin de pouvoir la
 * remplacer par un client base de données réel (Prisma, Drizzle, pg, ...)
 * sans toucher au reste de l'application.
 */
export interface DbCollection<T extends { id: string }> {
  all(): T[];
  byId(id: string): T | undefined;
  insert(item: T): T;
  update(id: string, patch: Partial<T>): T | undefined;
  remove(id: string): boolean;
  filter(predicate: (item: T) => boolean): T[];
  count(): number;
}

function createCollection<T extends { id: string }>(seed: T[]): DbCollection<T> {
  const store: T[] = [...seed];
  return {
    all: () => [...store],
    byId: (id) => store.find((item) => item.id === id),
    insert: (item) => {
      store.push(item);
      return item;
    },
    update: (id, patch) => {
      const index = store.findIndex((item) => item.id === id);
      if (index === -1) return undefined;
      store[index] = { ...store[index], ...patch };
      return store[index];
    },
    remove: (id) => {
      const index = store.findIndex((item) => item.id === id);
      if (index === -1) return false;
      store.splice(index, 1);
      return true;
    },
    filter: (predicate) => store.filter(predicate),
    count: () => store.length,
  };
}

export interface Db {
  patients: DbCollection<Patient>;
}

export const db: Db = {
  patients: createCollection<Patient>(seedPatients),
};

export default db;
