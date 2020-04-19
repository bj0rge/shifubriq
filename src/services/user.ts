import { fetchAllUsers } from '../providers/slack';

export async function getUsersNames(ids: string[]): Promise<string[]> {
  const allUserNames = await fetchAllUsers();
  const usersNames = ids.map((id) => {
    const userName = allUserNames[id];
    if (!userName) {
      throw new Error(`No username found for ${id}`);
    }
    return userName;
  });

  return usersNames;
}
