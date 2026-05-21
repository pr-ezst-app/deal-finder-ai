"""
AI Deal Finder — accepts a product query + optional budget,
returns AI-generated deal recommendations with specs, prices, and store links.
"""

import json
import os
import urllib.request
import urllib.error

OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]

SYSTEM_PROMPT = """You are an expert shopping assistant and deal finder.
When given a product query and optional budget, you analyze the market and return the best value options.

For SPECIFIC products (e.g. "Sony WH-1000XM5"): return 3 store options with prices.
For GENERAL categories (e.g. "gaming laptop", "wireless headphones under $200"):
  - Recommend 3 specific products that best fit the budget & use case
  - For each: name, why it's the best value, key specs, estimated price, stores to buy from

Always respond with valid JSON only. No markdown, no extra text.

JSON format:
{
  "query_type": "specific or general",
  "summary": "1-2 sentence expert summary of the best approach for this budget/query",
  "results": [
    {
      "rank": 1,
      "name": "Full product name",
      "emoji": "relevant emoji",
      "why": "1 sentence on why this is the best value pick",
      "specs": ["spec 1", "spec 2", "spec 3", "spec 4"],
      "price_range": "$XXX - $XXX",
      "best_price": 299,
      "value_score": 92,
      "stores": [
        { "name": "Amazon", "price": 299, "url": "https://www.amazon.com/s?k=PRODUCT+NAME" },
        { "name": "Best Buy", "price": 319, "url": "https://www.bestbuy.com/site/searchpage.jsp?st=PRODUCT+NAME" },
        { "name": "Walmart", "price": 309, "url": "https://www.walmart.com/search?q=PRODUCT+NAME" }
      ]
    }
  ]
}

For store URLs always use real search URLs with the product name URL-encoded.
Value score is 0-100 based on price-to-performance ratio for the budget."""


def call_openai(query: str, budget: str) -> dict:
    user_message = f"Product query: {query}"
    if budget:
        user_message += f"\nBudget: {budget}"

    payload = json.dumps({
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        "temperature": 0.3,
        "max_tokens": 1500,
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {OPENAI_API_KEY}",
        },
        method="POST",
    )

    with urllib.request.urlopen(req, timeout=25) as resp:
        result = json.loads(resp.read().decode("utf-8"))

    raw = result["choices"][0]["message"]["content"].strip()

    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1]
        raw = raw.rsplit("```", 1)[0].strip()

    return json.loads(raw)


def handler(event: dict, context) -> dict:
    """AI-powered deal finder: analyzes product queries and returns best value recommendations with store links."""

    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}

    body = json.loads(event.get("body") or "{}")
    query = body.get("query", "").strip()
    budget = body.get("budget", "").strip()

    if not query:
        return {
            "statusCode": 400,
            "headers": cors_headers,
            "body": json.dumps({"error": "Query is required"}),
        }

    data = call_openai(query, budget)

    return {
        "statusCode": 200,
        "headers": cors_headers,
        "body": json.dumps(data),
    }
