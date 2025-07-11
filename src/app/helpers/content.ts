import { signal, Signal } from '@angular/core';
import { Content, ContentType } from '@interfaces';

const _allIdsByName = signal<Map<string, string>>(new Map());
export const allIdsByName: Signal<Map<string, string>> =
  _allIdsByName.asReadonly();

const _allContentById = signal<Map<string, Content>>(new Map());
export const allContentById: Signal<Map<string, Readonly<Content>>> =
  _allContentById.asReadonly();

export function setAllIdsByName(state: Map<string, string>): void {
  _allIdsByName.set(new Map(state));
}

export function setAllContentById(state: Map<string, Content>): void {
  _allContentById.set(new Map(state));
}

export function getEntriesByType<T>(type: ContentType): T[] {
  return (
    [...allContentById()]
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, entry]) => entry.__type === type)
      .map((e) => e[1]) as T[]
  );
}

export function getEntry<T extends Content>(
  entryIdOrName: string,
): T | undefined {
  if (!entryIdOrName) return undefined;

  const idHash = allIdsByName();
  const entriesHash = allContentById();

  let ret: T = entriesHash.get(entryIdOrName) as T;

  const nameToId = idHash.get(entryIdOrName);
  if (nameToId) {
    ret = entriesHash.get(nameToId) as T;
  }

  return ret;
}
