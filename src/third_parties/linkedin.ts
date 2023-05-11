import axios from 'axios';
export async function scrapeLinkedInProfile(
  profileURL: string
): Promise<string> {
  const endpoint = 'https://nubela.co/proxycurl/api/v2/linkedin';
  const headers = { Authorization: `Bearer ${process.env.PROXYCURL_API_KEY}` };

  const response = await axios.get(endpoint, {
    headers,
    params: { url: profileURL },
  });

  const data: Record<any, any> = Object.entries(response.data)
    .filter(
      ([k, v]) =>
        v !== null &&
        v !== undefined &&
        v !== '' &&
        (<any>v).length !== 0 &&
        !['people_also_viewed', 'certifications'].includes(k)
    )
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});

  if (data['groups']) {
    for (const group of data['groups']) {
      delete group['profile_pic_url'];
    }
  }

  return JSON.stringify(data);
}
