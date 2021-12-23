import type {VercelRequest, VercelResponse} from "@vercel/node"

/*
    Serverless function designed to retrieve information regarding a specific Tweet from the Twitter API. 
    It is preferred to use a serverless function here because we have to use an authorization header in order
    to access the Twitter web API. 
*/

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const twitter_api_endpoint: string = "https://api.twitter.com/2/tweets?";

  if (req.method === "POST") {
    const {status_id}: {status_id: string} = req.body;

    const query_params = {
      ids: status_id,
      expansions: "author_id",
      "tweet.fields": "created_at",
      "user.fields": "profile_image_url,verified",
    };

    let api_req_link: string =
      twitter_api_endpoint + new URLSearchParams(query_params).toString(); // Append status ID

    const api_request = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.TWITTER_API_TOKEN}`,
      },
    };

    const api_response: Response = await fetch(api_req_link, api_request);
    const jsonData:string = await api_response.json();

    res.status(200).json(jsonData);
  }
}
