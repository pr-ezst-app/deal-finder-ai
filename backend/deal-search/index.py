"""
AI Deal Finder — accepts a product query + optional budget,
returns AI-generated deal recommendations with specs, prices, and store links.
Uses Groq API (llama-3.3-70b) — fast and geo-unrestricted.
"""

import json
import os
import urllib.request

GROQ_API_KEY = os.environ["GROQ_API_KEY"]

SYSTEM_PROMPT = """You are an expert shopping assistant and deal finder.
When given a product query and optional budget, analyze the market and return the best value options.

For SPECIFIC products (e.g. "Sony WH-1000XM5"): return 3 store options with prices.
For GENERAL categories (e.g. "gaming laptop", "wireless headphones under $200"):
  - Recommend 3 specific product models that best fit the budget and use case
  - For each: full model name, why it is the best value, key specs, estimated street price, stores

Always respond with valid JSON only. No markdown fences, no extra text — raw JSON only.

Required JSON structure:
{
  "query_type": "general",
  "summary": "1-2 sentence expert summary of the best approach for this budget/query",
  "results": [
    {
      "rank": 1,
      "name": "Full product model name",
      "emoji": "single relevant emoji",
      "why": "One sentence explaining why this is the best value pick",
      "specs": ["Key spec 1", "Key spec 2", "Key spec 3", "Key spec 4"],
      "price_range": "$XXX - $XXX",
      "best_price": 299,
      "value_score": 92,
      "stores": [
        { "name": "Amazon", "price": 299, "url": "https://www.amazon.com/s?k=Product+Name+Here" },
        { "name": "Best Buy", "price": 319, "url": "https://www.bestbuy.com/site/searchpage.jsp?st=Product+Name+Here" },
        { "name": "Walmart", "price": 309, "url": "https://www.walmart.com/search?q=Product+Name+Here" }
      ]
    }
  ]
}

Rules:
- value_score is 0-100 based on price-to-performance for the stated budget
- Store URLs must use real search URLs with the product name URL-encoded (spaces as +)
- Always return exactly 3 results
- query_type must be either "specific" or "general"
"""


def call_groq(query: str, budget: str) -> dict:
    user_message = f"Product query: {query}"
    if budget:
        user_message += f"\nBudget: {budget}"

    payload = json.dumps({
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        "temperature": 0.3,
        "max_tokens": 1800,
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.groq.com/openai/v1/chat/completions",
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {GROQ_API_KEY}",
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
    """AI deal finder: takes a product query + budget and returns the 3 best value picks with store links."""

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

    data = call_groq(query, budget)

    return {
        "statusCode": 200,
        "headers": cors_headers,
        "body": json.dumps(data),
    }
