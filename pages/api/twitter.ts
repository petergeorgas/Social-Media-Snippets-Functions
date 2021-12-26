import type {VercelRequest, VercelResponse} from "@vercel/node"
import Cors from 'cors';

// Initializing the cors middleware
const cors = Cors({
  methods: ['GET', 'POST'],
  origin: "*",
})

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req: VercelRequest, res: VercelResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

/*
    Serverless function designed to retrieve information regarding a specific Tweet from the Twitter API. 
    It is preferred to use a serverless function here because we have to use an authorization header in order
    to access the Twitter web API
*/

type QueryParams = {
  ids: string;
  expansions: string;
  "tweet.fields": string;
  "user.fields": string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await runMiddleware(req, res, cors)
  
  const twitter_api_endpoint: string = "https://api.twitter.com/2/tweets?";

  if (req.method === "POST") {
    const {status_id}: {status_id: string} = req.body;

    const query_params: QueryParams = {
      ids: status_id,
      expansions: "author_id",
      "tweet.fields": "created_at,public_metrics,possibly_sensitive,in_reply_to_user_id,geo",
      "user.fields": "profile_image_url,verified",
    };

    let api_req_link: string =
      twitter_api_endpoint + new URLSearchParams(query_params).toString(); // Append status ID

    const twitter_api_request: RequestInit = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.TWITTER_API_TOKEN}`,
      },
    };

    const twitter_api_response: Response = await fetch(api_req_link, twitter_api_request);
    const jsonData: string = await twitter_api_response.json();

    res.status(200).json(jsonData);
  }
}
