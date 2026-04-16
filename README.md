# vCard Forge

Static RFC 6350 vCard 4.0 generator built with HTML, CSS, and minimal JavaScript.

## Run

Open `index.html` in a browser.

## Notes

- Generates `BEGIN:VCARD` / `VERSION:4.0` / `FN` / `N` / `END:VCARD` in the required order.
- Escapes text values and folds lines to 75 UTF-8 octets.
- Uses CRLF line endings in the generated output.
