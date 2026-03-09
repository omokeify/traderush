"""Keyword filters for announcement detection."""

KEYWORD_FILTERS = [
    "announcement",
    "partnership",
    "listing",
    "launch",
    "upgrade",
    "mainnet",
    "testnet",
    "airdrop",
    "burn",
    "staking",
    "collaboration",
    "integration",
    "adoption",
]


def matches_keywords(text: str) -> list[str]:
    """Return list of keywords found in text (case-insensitive)."""
    if not text:
        return []
    lower = text.lower()
    return [kw for kw in KEYWORD_FILTERS if kw in lower]
