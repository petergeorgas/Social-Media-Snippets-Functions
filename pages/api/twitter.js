/*
    Serverless function designed to retrieve information regarding a specific Tweet from the Twitter API. 
    It is preferred to use a serverless function here because we have to use an authorization header in order
    to access the Twitter web API. 
*/
export default async function handler(req, res) {
  const twitter_api_endpoint = "https://api.twitter.com/2/tweets?";

  if (req.method === "POST") {
    const { status_id } = req.body;

    const query_params = {
      ids: status_id,
      expansions: "author_id",
      "tweet.fields": "created_at",
      "user.fields": "profile_image_url,verified",
    };

    let api_req_link =
      twitter_api_endpoint + new URLSearchParams(query_params).toString(); // Append status ID

    const api_request = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.TWITTER_API_TOKEN}`,
      },
    };

    const api_response = await fetch(api_req_link, api_request);
    const jsonData = await api_response.json();

    res.status(200).json(jsonData);
  }
}
