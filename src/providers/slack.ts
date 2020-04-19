import axios, { AxiosInstance } from 'axios';
import config from '../config';

const slackConf = config.slack;
const { commands } = slackConf;

const slackApi: AxiosInstance = axios.create({
  baseURL: slackConf.baseUrl,
  timeout: 1e4,
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
});
slackApi.interceptors.request.use((axiosConfig) => {
  const params = { ...axiosConfig.params, token: slackConf.token };
  const newConfig = { ...axiosConfig, params };
  return newConfig;
});

type UsersList = { [userId: string]: string };

export async function fetchAllUsers(): Promise<UsersList> {
  const res = await slackApi.post(commands.listUsers);
  const { members } = res.data;

  const usersList = members.reduce((accumulator, member) => {
    return {
      ...accumulator,
      [member.id]: member.name,
    };
  }, {});
  return usersList;
}

type ChannelId = string;
async function getAppChannelForUser(userId: string): Promise<ChannelId> {
  const res = await slackApi.post(commands.openConv, null, {
    params: {
      users: userId,
    },
  });
  const channelId = res.data?.channel?.id;
  return channelId;
}

type PostMessageData = {
  text: string;
  channel: string;
  attachments?: string;
};

export async function postMessage(
  text: string,
  userId: string,
  attachments?: any[],
): Promise<void> {
  const channelId = await getAppChannelForUser(userId);
  const params: PostMessageData = { text, channel: channelId };
  if (attachments) {
    params.attachments = JSON.stringify(attachments);
  }

  await slackApi.post(commands.postMessage, null, { params });
}

export async function postMessages(
  text: string,
  usersIds: string[],
  attachments?: any[],
): Promise<void> {
  await Promise.all(
    usersIds.map((userId) => postMessage(text, userId, attachments)),
  );
}

type TeamInfo = {
  id: string;
  name: string;
  domain: string;
  emailDomain: string;
};

export async function getTeamInfo(): Promise<TeamInfo> {
  const res = await slackApi.post(commands.teamInfo);
  const teamInfo = {
    id: res.data.team.id,
    name: res.data.team.name,
    domain: res.data.team.domain,
    emailDomain: res.data.team.email_domain,
  };
  return teamInfo;
}
