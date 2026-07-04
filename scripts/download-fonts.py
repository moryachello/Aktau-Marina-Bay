import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FONTS_DIR = ROOT / "fonts"
FONTS_DIR.mkdir(exist_ok=True)

url = "https://fonts.googleapis.com/css2?family=Montserrat:wght@200;300;400;500;600;700&display=block"
req = urllib.request.Request(
    url,
    headers={
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
    },
)
css = urllib.request.urlopen(req, timeout=30).read().decode()

range_map = {
    "cyrillic-ext": "U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F",
    "cyrillic": "U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116",
    "latin-ext": "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF",
    "latin": "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
}

pattern = re.compile(
    r"/\* (?P<range>cyrillic-ext|cyrillic|latin-ext|latin) \*/\s*"
    r"@font-face\s*\{[^}]*font-weight:\s*(?P<weight>\d+);[^}]*"
    r"url\((?P<url>https://[^)]+\.woff2)\)[^}]*\}",
    re.S,
)

out_css = ["/* Montserrat — local */"]

for match in pattern.finditer(css):
    range_name = match.group("range")
    weight = match.group("weight")
    gurl = match.group("url")
    fname = f"montserrat-{weight}-{range_name.replace('-', '')}.woff2"
    dest = FONTS_DIR / fname
    if not dest.exists():
        print("download", fname)
        urllib.request.urlretrieve(gurl, dest)
    out_css.append(
        f"@font-face {{\n"
        f"  font-family: 'Montserrat';\n"
        f"  font-style: normal;\n"
        f"  font-weight: {weight};\n"
        f"  font-display: block;\n"
        f"  src: url('../fonts/{fname}') format('woff2');\n"
        f"  unicode-range: {range_map[range_name]};\n"
        f"}}"
    )

(ROOT / "css" / "fonts.css").write_text("\n\n".join(out_css), encoding="utf-8")
print("done", len(list(FONTS_DIR.glob("*.woff2"))), "files")
