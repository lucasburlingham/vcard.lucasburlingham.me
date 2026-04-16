# vCard Forge

> [!WARNING]  
> This project was created by GPT-5.4 mini with Medium reasoning. None of the code was written by a human. It may contain errors and should be used for educational purposes only. As such, it is licensed in the public domain. Use at your own risk.

Static RFC 6350 vCard 4.0 generator built with HTML, CSS, and minimal JavaScript. The official specification is [RFC 6350](https://datatracker.ietf.org/doc/html/rfc6350).

## Run

Open `index.html` in a browser, or navigate to [vcard.lucasburlingham.me](https://vcard.lucasburlingham.me).

## Notes

- Generates `BEGIN:VCARD` / `VERSION:4.0` / `FN` / `N` / `END:VCARD` in the required order.
- Escapes text values and folds lines to 75 UTF-8 octets.
- Uses CRLF line endings in the generated output.

## License

This project is in the public domain. Use it freely for any purpose. No warranty is provided.
